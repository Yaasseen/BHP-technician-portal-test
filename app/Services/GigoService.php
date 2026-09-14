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
            $isTechnicianBasket = $toLocation->type === 'technician_basket';

            $serviceOrder->update([
                'gigo_location_id' => $toLocation->id,
                'gigo_location_name' => $toLocation->name,
                'gigo_location_updated_at' => now(),
                'gigo_pending_ack' => $isTechnicianBasket,
                'technician_acknowledged_at' => $isTechnicianBasket ? null : $serviceOrder->technician_acknowledged_at,
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
            $isTechnicianBasket = $toLocation->type === 'technician_basket';

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
                'gigo_pending_ack' => $isTechnicianBasket,
                'technician_acknowledged_at' => $isTechnicianBasket ? null : DB::raw('technician_acknowledged_at'),
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

    public function acknowledgeReceipt(string $documentNo, string $technicianId, ?string $technicianName): ServiceOrder
    {
        $serviceOrder = ServiceOrder::where('document_no', $documentNo)->firstOrFail();

        if ((string) $serviceOrder->technician_id !== (string) $technicianId) {
            throw new GigoAcknowledgeException("This item isn't assigned to you.");
        }

        return DB::transaction(function () use ($serviceOrder, $technicianId, $technicianName) {
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
                'moved_by' => $technicianId,
                'moved_by_name' => $technicianName,
            ]);

            return $serviceOrder;
        });
    }

    public function returnToGigo(string $documentNo, string $technicianId, ?string $technicianName): ServiceOrder
    {
        $serviceOrder = ServiceOrder::where('document_no', $documentNo)->firstOrFail();

        if ((string) $serviceOrder->technician_id !== (string) $technicianId) {
            throw new GigoAcknowledgeException("This item isn't assigned to you.");
        }

        $gigoLocation = GigoLocation::where('code', 'GIGO')->where('is_active', true)->firstOrFail();

        return $this->moveToLocation($documentNo, $gigoLocation->id, 'job_complete_return', $technicianId, $technicianName);
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
}
