<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrderActivity;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\NotificationController;



class ServiceOrderActivityController extends Controller
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

        // Fetch the technician list from BusinessCentral
        $technicianList = $this->businessCentral->technicianList();
        // Log::info("List Technician", $technicianList);

        $technicianLookup = [];
        foreach ($technicianList as $technician) {
            if (isset($technician['ID'], $technician['First_Name'], $technician['Last_Name'])) {
                $technicianLookup[$technician['ID']] = trim($technician['First_Name'] . ' ' . $technician['Last_Name']);
            }
        }

        $activities = ServiceOrderActivity::where('document_no', $documentNo)
            ->get(['id', 'document_no', 'repair_status_code', 'description', 'image_data', 'signature_data', 'date', 'time', 'created_by', 'updated_by']);

        if ($activities->isEmpty()) {
            return response()->json([
                'message' => 'No activities found for the given document number.',
                'data' => [],
            ], 404);
        }

        $activitiesFormatted = $activities->map(function ($activity) use ($technicianLookup) {
            $imageUrl = $activity->image_data 
            ? URL::route('service-order-activities.image', ['id' => $activity->id]) 
            : null;

            $signatureUrl = $activity->signature_data 
            ? URL::route('service-order-activities.signature', ['id' => $activity->id]) 
            : null;

            return [
                'document_no' => $activity->document_no,
                'repair_status_code' => $activity->repair_status_code,
                'description' => (!empty($activity->description) && $activity->description !== 'undefined') ? $activity->description : 'No Description Available.',
                'date' => $activity->date,
                'time' => $activity->time,
                'created_by' => $technicianLookup[$activity->created_by] ?? null,
                'updated_by' => $technicianLookup[$activity->updated_by] ?? null,
                'image_url' => $imageUrl ?? null,
                'signature_url' => $signatureUrl ?? null, 
            ];
           
        });

        return response()->json([
            'message' => 'Service Order Activities fetched successfully.',
            'data' => $activitiesFormatted,
        ], 200);
    }

    public function getImage($id)
    {
        $serviceOrderActivity = ServiceOrderActivity::find($id);
        if (!$serviceOrderActivity || !$serviceOrderActivity->image_data) {
            return response()->json(['error' => 'Image not found.'], 404);
        }

        $mimeType = 'image/' . pathinfo($serviceOrderActivity->image_name, PATHINFO_EXTENSION);
        // Log::info("IMgmimetype",  [$mimeType]);
        return response($serviceOrderActivity->image_data)->header('Content-Type', $mimeType);

    }

    public function getSignature($id)
    {
        $serviceOrderActivity = ServiceOrderActivity::find($id);

        if (!$serviceOrderActivity || !$serviceOrderActivity->signature_data) {
            return response()->json(['error' => 'Signature not found.'], 404);
        }
        $mimeType = 'image/' . pathinfo($serviceOrderActivity->signature_name, PATHINFO_EXTENSION);
        // Log::info("Sigmimetype",  [$mimeType]);
        return response($serviceOrderActivity->signature_data)->header('Content-Type', $mimeType);
    }

    public function store(Request $request)
    {
        $user = Auth::guard('in-memory')->user();

        $validatedData = $request->validate([
            'document_no' => 'required|string|exists:service_orders,document_no',
            'repair_status_code' => 'required|string',
            'service_order_status' => 'nullable|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'image_file' => 'nullable|file|mimes:jpeg,png,jpg,webp',
            'signature' => 'nullable|string',
        ]);

        $imageBinary = null;
        $imageName = null;
        if ($request->has('image')) {
            $base64Image = $validatedData['image'];
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $matches)) {
                $imageType = strtolower($matches[1]); // Get the image type (e.g., png, jpeg, jpg)
                $imageBinary = base64_decode(substr($base64Image, strpos($base64Image, ',') + 1));
                $imageName = 'image_' . uniqid() . '.' . $imageType; // Use the actual image type for naming
            } else {
                throw new \Exception('Invalid base64 image data');
            }
        } elseif ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $imageBinary = file_get_contents($file);
            $imageName = 'image_' . uniqid() . '.' . $file->getClientOriginalExtension();
            // $size = $file->getSize();
            // Log::info("Img Size", [$size]);

        }

        $signatureBinary = null;
        $signatureName = null;
        // log::info("signature key", [$request['signature']]);
        if ($request->has('signature') && $request['signature'] !== 'undefined') {
            $base64Signature = $validatedData['signature'];
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Signature, $matches)) {
                $signatureType = strtolower($matches[1]); // Get the signature type (e.g., png, jpeg, jpg)
                $signatureBinary = base64_decode(substr($base64Signature, strpos($base64Signature, ',') + 1));
                $signatureName = 'signature_' . uniqid() . '.' . $signatureType; // Use the actual signature type for naming
            } else {
                throw new \Exception('Invalid base64 signature data');
            }
        }

        try {
            DB::beginTransaction();

            $serviceOrderActivity = ServiceOrderActivity::create([
                'document_no' => $validatedData['document_no'],
                'description' => $validatedData['description'],
                'repair_status_code' => $validatedData['repair_status_code'],
                'service_order_status' => $validatedData['service_order_status'],
                'image_data' => $imageBinary,
                'image_name' => $imageName,
                'signature_data' => $signatureBinary,
                'signature_name' => $signatureName,
                'created_by' => $user->ID,
                'date' => now()->toDateString(),
                'time' => now()->toTimeString(),
            ]);
            Log::info("Created ServiceOrderActivity:");

            // Update service order repair status code
            $serviceOrder = ServiceOrder::where('document_no', $validatedData['document_no'])->firstOrFail();
            $serviceOrder->repair_status_code = $validatedData['repair_status_code'];
            if (!empty($validatedData['service_order_status'])) {
                $serviceOrder->service_order_status = $validatedData['service_order_status'];
            }
            $serviceOrder->status = $validatedData['status'];
            $serviceOrder->save();
            Log::info("ServiceOrder status is: " . $validatedData['status']);
            Log::info("After Update: ServiceOrder status is " . $serviceOrder->fresh()->status);

            $response = $this->businessCentral->updateServiceOrderStatus(
                $serviceOrder->document_no,
                $serviceOrder->item_no,
                $serviceOrder->repair_status_code,
                $serviceOrder->technician_id
            );
            
            if (str_contains(strtolower($response), 'error') || 
                str_contains($response, 'You cannot change status') || 
                empty($response)) {
                Log::error("Service Order status update failed: {$response}");
                throw new \Exception($response); // Throw the actual error from Business Central
            }

            // Send Image to Business Central**
            if ($imageBinary) {
                Log::info("Sending Image to Business Central...");
                $this->businessCentral->updatePortalImage(
                    $serviceOrder->document_no,
                    base64_encode($imageBinary), // Convert binary to base64
                    $serviceOrder->priority_weight,
                    false 
                );
            }

            // Send Signature to Business Central**
            if ($signatureBinary) {
                Log::info("Sending Signature to Business Central...");
                $this->businessCentral->updatePortalImage(
                    $serviceOrder->document_no,
                    base64_encode($signatureBinary), // Convert binary to base64
                    $serviceOrder->priority_weight, 
                    true 
                );
            }

            DB::commit();
            $serviceOrder->refresh();
            return response()->json([
                'message' => 'Service Order Activity created successfully.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Service Order Activity failed: " . $e->getMessage(), [$e]);

            return response()->json([
                'error' => $e->getMessage() // This will now return the custom error message
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $user = Auth::guard('in-memory')->user();
        if (!$user) {
            return response()->json(['error' => 'User not authenticated.'], 401);
        }
        $validated = $request->validate([
            'repair_status_code' => 'nullable|string',
            'description' => 'nullable|string',
            'image' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
            'signature' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
        ]);

        $activity = ServiceOrderActivity::find($id);

        if (!$activity) {
            return response()->json(['message' => 'Service Order Activity not found'], 404);
        }

        $activity->repair_status_code = $validated['repair_status_code'] ?? $activity->repair_status_code;
        $activity->description = $validated['description'] ?? $activity->description;

        if ($request->hasFile('image')) {
            $activity->image = file_get_contents($request->file('image')->getRealPath());
        }
        if ($request->hasFile('signature')) {
            $activity->signature = file_get_contents($request->file('signature')->getRealPath());
        }

        $activity->updated_by = $user->ID;
        $activity->date = now()->toDateString();
        $activity->time = now()->toTimeString();

        $activity->save();

        return response()->json([
            'message' => 'Service Order Activity updated successfully',
            'data' => $activity,
        ], 200);
    }
}
