<?php

namespace App\Services;

use App\Exceptions\GigoAcknowledgeException;
use App\Models\GigoLocation;
use App\Models\GigoMovement;
use App\Models\ServiceOrder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GigoService
{
    public function moveToLocation(string $documentNo, int $toLocationId, string $moveType, ?string $movedById, ?string $movedByName): ServiceOrder
    {
        $serviceOrder = ServiceOrder::where('document_no', $documentNo)->firstOrFail();
        $toLocation = GigoLocation::findOrFail($toLocationId);

        return DB::transaction(function () use ($serviceOrder, $toLocation, $moveType, $movedById, $movedByName) {
            $fromLocationId = $serviceOrder->gigo_location_id;
            $fromLocationName = $serviceOrder->gigo_location_name;
            $requiresAck = $this->locationRequiresAcknowledgement($toLocation);

            $serviceOrder->update([
                'gigo_location_id' => $toLocation->id,
                'gigo_location_name' => $toLocation->name,
                'gigo_location_updated_at' => now(),
                'gigo_pending_ack' => $requiresAck,
                'technician_acknowledged_at' => $requiresAck ? null : $serviceOrder->technician_acknowledged_at,
            ]);

            GigoMovement::create([
                'document_no' => $serviceOrder->document_no,
                'from_location_id' => $fromLocationId,
                'to_location_id' => $toLocation->id,
                'from_location_name' => $fromLocationName,
                'to_location_name' => $toLocation->name,
                'move_type' => $moveType,
                'moved_by' => $movedById,
                'moved_by_name' => $movedByName,
            ]);

            return $serviceOrder;
        });
    }

    public function moveByCode(string $documentNo, string $locationCode, string $moveType, ?string $movedById, ?string $movedByName): ServiceOrder
    {
        $location = GigoLocation::where('code', $locationCode)->where('is_active', true)->firstOrFail();

        return $this->moveToLocation($documentNo, $location->id, $moveType, $movedById, $movedByName);
    }

    public function bulkMoveToLocation(array $documentNos, int $toLocationId, string $moveType, ?string $movedById, ?string $movedByName): array
    {
        $toLocation = GigoLocation::findOrFail($toLocationId);

        $serviceOrders = ServiceOrder::whereIn('document_no', $documentNos)->get();

        if ($serviceOrders->isEmpty()) {
            return [];
        }

        return DB::transaction(function () use ($serviceOrders, $toLocation, $moveType, $movedById, $movedByName) {
            $movementRows = [];
            $timestamp = now();
            $requiresAck = $this->locationRequiresAcknowledgement($toLocation);

            foreach ($serviceOrders as $serviceOrder) {
                $movementRows[] = [
                    'document_no' => $serviceOrder->document_no,
                    'from_location_id' => $serviceOrder->gigo_location_id,
                    'to_location_id' => $toLocation->id,
                    'from_location_name' => $serviceOrder->gigo_location_name,
                    'to_location_name' => $toLocation->name,
                    'move_type' => $moveType,
                    'moved_by' => $movedById,
                    'moved_by_name' => $movedByName,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }

            ServiceOrder::whereIn('document_no', $serviceOrders->pluck('document_no'))->update([
                'gigo_location_id' => $toLocation->id,
                'gigo_location_name' => $toLocation->name,
                'gigo_location_updated_at' => $timestamp,
                'gigo_pending_ack' => $requiresAck,
                'technician_acknowledged_at' => $requiresAck ? null : DB::raw('technician_acknowledged_at'),
            ]);

            GigoMovement::insert($movementRows);

            return $serviceOrders->pluck('document_no')->toArray();
        });
    }

    public function moveToTechnicianBasket(string $documentNo, string $technicianId, string $technicianName, ?string $movedById, ?string $movedByName): ServiceOrder
    {
        $basket = $this->getOrCreateTechnicianBasket($technicianId, $technicianName);

        return $this->moveToLocation($documentNo, $basket->id, 'auto_assign', $movedById, $movedByName);
    }

    public function bulkMoveToTechnicianBasket(array $documentNos, string $technicianId, string $technicianName, ?string $movedById, ?string $movedByName): void
    {
        $basket = $this->getOrCreateTechnicianBasket($technicianId, $technicianName);

        $this->bulkMoveToLocation($documentNos, $basket->id, 'auto_assign', $movedById, $movedByName);
    }

    public function acknowledgeReceipt(string $documentNo, string $userId, ?string $userName, bool $isGigoTeam = false): ServiceOrder
    {
        $serviceOrder = ServiceOrder::where('document_no', $documentNo)->firstOrFail();

        $this->assertCanAcknowledge($serviceOrder, $userId, $isGigoTeam);

        return DB::transaction(function () use ($serviceOrder, $userId, $userName) {
            $serviceOrder->update([
                'gigo_pending_ack' => false,
                'technician_acknowledged_at' => now(),
            ]);

            GigoMovement::create([
                'document_no' => $serviceOrder->document_no,
                'from_location_id' => $serviceOrder->gigo_location_id,
                'to_location_id' => $serviceOrder->gigo_location_id,
                'from_location_name' => $serviceOrder->gigo_location_name,
                'to_location_name' => $serviceOrder->gigo_location_name,
                'move_type' => 'technician_ack',
                'moved_by' => $userId,
                'moved_by_name' => $userName,
            ]);

            return $serviceOrder;
        });
    }

    public function returnToGigo(string $documentNo, string $technicianId, ?string $technicianName): ServiceOrder
    {
        $serviceOrder = ServiceOrder::where('document_no', $documentNo)->firstOrFail();

        $this->assertInTechnicianBasket($serviceOrder, $technicianId);

        $gigoLocation = GigoLocation::where('code', 'GIGO')->where('is_active', true)->firstOrFail();

        return $this->moveToLocation($documentNo, $gigoLocation->id, 'job_complete_return', $technicianId, $technicianName);
    }

    /**
     * Ownership for acknowledge/return is based on where the order actually
     * sits in GIGO (its current basket location) - the same source of truth
     * "My Basket" uses - not the separate technician_id field on the order,
     * which only gets set by the formal Assign Technician flow and can drift
     * out of sync when an item is instead moved via a generic GIGO scan.
     */
    private function assertInTechnicianBasket(ServiceOrder $serviceOrder, string $technicianId): void
    {
        $location = $serviceOrder->gigo_location_id
            ? GigoLocation::find($serviceOrder->gigo_location_id)
            : null;

        $isOwner = $location
            && $location->type === 'technician_basket'
            && (string) $location->technician_id === (string) $technicianId;

        if (!$isOwner) {
            throw new GigoAcknowledgeException("This item isn't assigned to you.");
        }
    }

    private function locationRequiresAcknowledgement(GigoLocation $location): bool
    {
        return $location->type === 'technician_basket' || $location->code === 'GIGO';
    }

    /**
     * A technician acknowledges items sitting in their own basket. Items
     * returned to the shared GIGO desk instead need acknowledgement from
     * the GIGO team (Team Leader / Admin), since that location isn't tied
     * to a single technician_id the way a basket is.
     */
    private function assertCanAcknowledge(ServiceOrder $serviceOrder, string $userId, bool $isGigoTeam): void
    {
        $location = $serviceOrder->gigo_location_id
            ? GigoLocation::find($serviceOrder->gigo_location_id)
            : null;

        if ($location && $location->type === 'technician_basket') {
            if ((string) $location->technician_id === (string) $userId) {
                return;
            }
            throw new GigoAcknowledgeException("This item isn't assigned to you.");
        }

        if ($location && $location->code === 'GIGO') {
            if ($isGigoTeam) {
                return;
            }
            throw new GigoAcknowledgeException("Only the GIGO team can acknowledge this return.");
        }

        throw new GigoAcknowledgeException("This item isn't assigned to you.");
    }

    public function getOrCreateTechnicianBasket(string $technicianId, string $technicianName): GigoLocation
    {
        return GigoLocation::firstOrCreate(
            ['code' => 'TECH-' . $technicianId],
            [
                'name' => trim($technicianName) !== '' ? $technicianName . "'s Basket" : "Technician {$technicianId} Basket",
                'type' => 'technician_basket',
                'technician_id' => $technicianId,
                'is_active' => true,
            ]
        );
    }

    public function getHistory(string $documentNo): Collection
    {
        ServiceOrder::where('document_no', $documentNo)->firstOrFail();

        return GigoMovement::where('document_no', $documentNo)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }

    public function getLocationContents(int $locationId): Collection
    {
        GigoLocation::findOrFail($locationId);

        return ServiceOrder::where('gigo_location_id', $locationId)
            ->orderByDesc('gigo_location_updated_at')
            ->get();
    }

    public function getGigoDeskContents(): Collection
    {
        $gigoLocation = GigoLocation::where('code', 'GIGO')->firstOrFail();

        return ServiceOrder::where('gigo_location_id', $gigoLocation->id)
            ->orderByDesc('gigo_location_updated_at')
            ->get();
    }
}
