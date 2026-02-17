<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SparePartActivity;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\Auth;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\NotificationController;

class SparePartActivityController extends Controller
{
    private $businessCentral;
    private $notificationController;

    public function __construct(NotificationController $notificationController)
    {
        $this->businessCentral = BusinessCentral::getInstance();
        $this->notificationController = $notificationController;
    }


    public function index(Request $request)
    {
        $documentNo = $request->query('document_no');
        if (!$documentNo) {
            return response()->json([
                'error' => 'Document number is required.',
            ], 400);
        }

        // Fetch technician list from BusinessCentral
        $technicianList = $this->businessCentral->technicianList();

        $technicianLookup = [];
        foreach ($technicianList as $technician) {
            if (isset($technician['ID'], $technician['First_Name'], $technician['Last_Name'])) {
                $technicianLookup[$technician['ID']] = trim($technician['First_Name'] . ' ' . $technician['Last_Name']);
            }
        }

        // Fetch spare part activities for the given document number
        $activities = SparePartActivity::where('document_no', $documentNo)
            ->get(['id', 'document_no', 'spare_part_no', 'description', 'quantity', 'requested_date', 'requested_time', 'requested_by', 'updated_by', 'consumer_code', 'consumer']);

        if ($activities->isEmpty()) {
            return response()->json([
                'message' => 'No activities found for the given document number.',
                'data' => [],
            ], 200);
        }

        // Format the response
        $activitiesFormatted = $activities->map(function ($activity) use ($technicianLookup) {
            return [
                'document_no' => $activity->document_no,
                'spare_part_no' => $activity->spare_part_no,
                'description' => $activity->description,
                'quantity' => $activity->quantity,
                'requested_date' => $activity->requested_date,
                'requested_time' => $activity->requested_time,
                'consumer' => $activity->consumer,
                'consumer_code' => $activity->consumer_code,
                'requested_by' => $technicianLookup[$activity->requested_by] ?? null,
                'updated_by' => $technicianLookup[$activity->updated_by] ?? null,
            ];
        });

        return response()->json([
            'message' => 'Spare Part Activities fetched successfully.',
            'data' => $activitiesFormatted,
        ], 200);
    }


    public function storeSparePart(Request $request)
    {
        $user = Auth::guard('in-memory')->user();

        $validatedData = $request->validate([
            'document_no' => 'required|string|exists:service_orders,document_no',
            'spare_part_no' => 'required|string|max:24',
            'location_code' => 'required|string|max:24',
            'description' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'consumer_code' => 'required|integer',
            'service_item_no' => 'required|string|max:255',
            'consumer' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Spare Part Request to Business Central
            $response = $this->businessCentral->requestSparePart(
                $validatedData['document_no'],
                $validatedData['spare_part_no'],
                $validatedData['quantity'],
                $validatedData['consumer_code'],
                $validatedData['location_code'],
                $validatedData['service_item_no']
            );

            if (str_contains(strtolower($response), 'error') || empty($response)) {
                throw new \Exception("Spare part request failed. Selected part for replacement.");
            }

            // Proceed with saving to the database if request is successful
            $sparepartActivity = SparePartActivity::create([
                'document_no' => $validatedData['document_no'],
                'spare_part_no' => $validatedData['spare_part_no'],
                'description' => $validatedData['description'],
                'quantity' => $validatedData['quantity'],
                'consumer_code' => $validatedData['consumer_code'],
                'consumer' => $validatedData['consumer'],
                'requested_by' => $user->ID,
                'requested_date' => now()->toDateString(),
                'requested_time' => now()->toTimeString(),
            ]);

            Log::info("Created Spare Part Activity:");

            DB::commit();

            return response()->json([
                'message' => 'Spare Part Request created successfully.',
                'data' => $sparepartActivity,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Spare Part Request failed: " . $e->getMessage());

            return response()->json([
                'error' => 'Failed to process the request.',
                'message' => 'Spare part selected for replacement.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    public function getServiceSpareParts(Request $request)
    {
        $documentNo = $request->query('document_no');
        if (!$documentNo) {
            return response()->json([
                'error' => 'Document number is required.',
            ], 400);
        }

        // Fetch technician list from BusinessCentral
        $service_spare_parts = $this->businessCentral->ServiceSpareParts($documentNo);
        return response()->json([
            'message' => 'Service Spare Parts fetched successfully.',
            'data' => $service_spare_parts,
        ], 200);
    }
}
