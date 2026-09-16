<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceOrder;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use App\Services\BusinessCentral;
use App\Services\GigoService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AssignServiceOrder extends Controller
{
    private $businessCentral;
    private $notificationController;
    private $teamRegionActivityController;
    private $gigoService;

    public function __construct(NotificationController $notificationController, TeamRegionActivityController $teamRegionActivityController, GigoService $gigoService)
    {
        $this->businessCentral = BusinessCentral::getInstance();
        $this->notificationController = $notificationController;
        $this->teamRegionActivityController = $teamRegionActivityController;
        $this->gigoService = $gigoService;
    }

    private function findServiceOrder($document_no)
    {
        $serviceOrder = ServiceOrder::where('document_no', $document_no)->first();

        if (!$serviceOrder) {
            abort(response()->json(['error' => 'Service order not found.'], 404));
        }

        return $serviceOrder;
    }

    private function authorizeUser(string $requiredRole)
    {
        $user = Auth::guard('in-memory')->user();

        if ($user->Technician_Type !== $requiredRole) {
            abort(response()->json(['error' => 'Unauthorized.'], 401));
        }
    }

    public function assignDepartmentRegion(Request $request, $document_no)
    {
        $user = Auth::guard('in-memory')->user();
        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            abort(response()->json(['error' => 'Unauthorized.'], 401));
        }

        $validated = $request->validate([
            'department' => 'required|string',
            'region' => 'required|string',
        ]);

        $serviceOrder = $this->findServiceOrder($document_no);

        $serviceOrder->update($validated);

        return response()->json([
            'message' => 'Service Order department and region assigned successfully.',
            'data' => $serviceOrder,
        ], 200);
    }

    public function scheduleServiceOrder(Request $request, $document_no)
    {
        $user = Auth::guard('in-memory')->user();
        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            abort(response()->json(['error' => 'Unauthorized.'], 401));
        }

        // $this->authorizeUser('Team Leader');

        $validated = $request->validate([
            'schedule_date' => 'required|date',
            'schedule_time' => 'nullable|date_format:H:i',
        ]);

        $validated['schedule_time'] = $validated['schedule_time'] ?? now()->format('H:i');

        $serviceOrder = $this->findServiceOrder($document_no);
        $serviceOrder->update($validated);

        // $this->notificationController->createNotification([
        //     'title' => 'Service Order Schedule Successfully.',
        //     'message' => "A service order #{$serviceOrder->document_no} has been Schdule to you.",
        //     'recipient_id' => $serviceOrder->technician_id,
        //     'service_order_id' => $serviceOrder->document_no,
        //     'notification_type' => 'schedule',
        // ]);

        try {
            $this->businessCentral->sendMessageBusinessCentral(
                $serviceOrder->mobile_no,
                $serviceOrder->document_no,
                $serviceOrder->repair_status_code,
                $validated['schedule_date'],
                $validated['schedule_time'],
            );
        } catch (\Exception $e) {
            Log::error('Failed to send message to Business Central', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Service order scheduled successfully.',
            'data' => $serviceOrder,
        ], 200);
    }

    public function assignTechnician(Request $request, $document_no)
    {
        $user = Auth::guard('in-memory')->user();
        // CSC handles GIGO intake/returns but must not assign jobs directly
        // to a technician - that stays a Team Leader decision.
        if ($user->Technician_Type !== 'Team Leader') {
            abort(response()->json(['error' => 'Unauthorized.'], 401));
        }

        $validated = $request->validate([
            'technician_id' => 'required|string',
            'technician_name' => 'required|string',
            'allocation_date' => 'required|date',
            
        ]);

        $serviceOrder = $this->findServiceOrder($document_no);

        if (!empty($serviceOrder->technician_id) && $serviceOrder->technician_id !== $validated['technician_id']) {
            Notification::where('recipient_id', $serviceOrder->technician_id)
                ->where('service_order_id', $serviceOrder->document_no)
                ->where('read_status', 'unread')
                ->update(['read_status' => 'read']);
        }

        $serviceOrder->update(array_merge($validated, ['status' => 'TECH-ASSN']));
        $serviceOrder->update($validated);
        $this->notificationController->createNotification([
            'title' => 'New Service Order Assigned',
            'message' => "A new service order #{$serviceOrder->document_no} has been assigned to you.",
            'recipient_id' => $serviceOrder->technician_id,
            'service_order_id' => $serviceOrder->document_no,
            'notification_type' => 'assignment',
        ]);

        try {
            $this->gigoService->moveToTechnicianBasket(
                $serviceOrder->document_no,
                $validated['technician_id'],
                $validated['technician_name'],
                $user->ID,
                trim($user->First_Name . ' ' . $user->Last_Name)
            );
            $serviceOrder->refresh();
        } catch (\Exception $e) {
            Log::error('Failed to auto-move service order to technician GIGO basket.', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Technician assigned to service order successfully.',
            'data' => $serviceOrder,
        ], 200);
    }

    public function assignTechnicianBulk(Request $request)
    {
        $user = Auth::guard('in-memory')->user();
        // Same restriction as assignTechnician() - CSC can't bulk-assign either.
        if ($user->Technician_Type !== 'Team Leader') {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $validated = $request->validate([
            'document_nos'   => 'required|array|min:1',
            'document_nos.*' => 'required|string|exists:service_orders,document_no',
            'technician_id'  => 'required|string',
            'technician_name'=> 'required|string',
            'allocation_date'=> 'nullable|date', // Optional allocation_date
        ]);

        $documentNos = $validated['document_nos'];
        $technicianId = $validated['technician_id'];
        $technicianName = $validated['technician_name'];
        $allocationDate = $validated['allocation_date'] ?? now()->toDateString();  // Default to current timestamp if null

        // Fetch all service orders that match the document numbers
        $serviceOrders = ServiceOrder::whereIn('document_no', $documentNos)->get();

        if ($serviceOrders->isEmpty()) {
            return response()->json(['error' => 'No valid service orders found.'], 404);
        }

        $notifications = [];
        $timestamp = now();

        // Update service orders in bulk
        ServiceOrder::whereIn('document_no', $documentNos)->update([
            'technician_id'   => $technicianId,
            'technician_name' => $technicianName,
            'allocation_date' => $allocationDate,
            'status'          => 'TECH-ASSN', 
        ]);

        foreach ($serviceOrders as $serviceOrder) {
            // Mark previous unread notifications as read for reassigned orders
            if (!empty($serviceOrder->technician_id) && $serviceOrder->technician_id !== $technicianId) {
                Notification::where('recipient_id', $serviceOrder->technician_id)
                    ->where('service_order_id', $serviceOrder->document_no)
                    ->where('read_status', 'unread')
                    ->update(['read_status' => 'read']);
            }

            // Prepare notifications for bulk insert
            $notifications[] = [
                'title'            => 'New Service Order Assigned',
                'message'          => "A new service order #{$serviceOrder->document_no} has been assigned to you.",
                'recipient_id'     => $technicianId,
                'service_order_id' => $serviceOrder->document_no,
                'notification_type'=> 'assignment',
                'sender_id'        => $user->ID,  // Add sender_id here
                'read_status'      => 'unread'
            ];
        }

        // Bulk insert notifications
        if (!empty($notifications)) {
            Notification::insert($notifications);
        }

        try {
            $this->gigoService->bulkMoveToTechnicianBasket(
                $documentNos,
                $technicianId,
                $technicianName,
                $user->ID,
                trim($user->First_Name . ' ' . $user->Last_Name)
            );
        } catch (\Exception $e) {
            Log::error('Failed to auto-move service orders to technician GIGO basket (bulk).', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Technician assigned to service orders successfully.',
            'data'    => ServiceOrder::whereIn('document_no', $documentNos)->get(),
        ], 200);
    }


    // public function assignOutdoorServiceDepartmentRegion(Request $request)
    // {
    //     $user = Auth::guard('in-memory')->user();

    //     // Only allow Team Leaders or CSC
    //     if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
    //         return response()->json(['error' => 'Unauthorized.'], 401);
    //     }

    //     $validated = $request->validate([
    //         'department' => 'required|string',
    //         'region' => 'required|string',
    //         'schedule_date' => 'required|date',
    //         'selectedOrders' => 'required|array|min:1', 
    //         'selectedOrders.*' => 'string', 
    //     ]);

    //     $department = $validated['department'];
    //     $region = $validated['region'];
    //     $schedule_date = $validated['schedule_date'];
    //     $selectedOrders = $validated['selectedOrders'];
    //     $orderCount = count($selectedOrders);

    //     // Count existing orders assigned to this department & region on the same day
    //     $existingOrderCount = ServiceOrder::where('department', $department)
    //         ->where('region', $region)
    //         ->whereDate('schedule_date', $schedule_date)
    //         ->count();
    //     // Check if adding new orders exceeds the 10-order limit
    //     if (($existingOrderCount + $orderCount) > 12) {
    //         return response()->json([
    //             'error' => 'Cannot assign more than 12 service orders to the same team and region on the same day.',
    //             'existing_count' => $existingOrderCount,
    //             'new_orders_attempted' => $orderCount,
    //         ], 400);
    //     }

    //     // Proceed with updating service orders
    //     $updatedCount = ServiceOrder::whereIn('document_no', $selectedOrders)
    //         ->update([
    //             'department' => $department,
    //             'region' => $region,
    //             'schedule_date' => $schedule_date,
    //         ]);

    //     if ($updatedCount > 0) {
    //         foreach ($selectedOrders as $documentNumber) {
    //             $this->teamRegionActivityController->teamRegionActivity(
    //                 $documentNumber,
    //                 $department,
    //                 $region,
    //                 $schedule_date,
    //                 $user->id, // Assigned By
    //                 $user->id  // Updated By
    //             );
    //         }
    //         return response()->json([
    //             'message' => 'Service Orders updated successfully.',
    //             'updated_count' => $updatedCount,
    //         ], 200);
    //     } else {
    //         return response()->json([
    //             'error' => 'No matching service orders found or already updated.',
    //         ], 404);
    //     }
    // }



    public function assignOutdoorServiceDepartmentRegion(Request $request)
    {
        $user = Auth::guard('in-memory')->user();

        // Only allow Team Leaders or CSC
        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $validated = $request->validate([
            'department' => 'required|string',
            'region' => 'required|string',
            'schedule_date' => 'required|date',
            'schedule_time' => 'nullable|date_format:H:i', // Optional schedule_time
            'selectedOrders' => 'required|array|min:1', 
            'selectedOrders.*' => 'string', 
        ]);

        $department = $validated['department'];
        $region = $validated['region'];
        $schedule_date = $validated['schedule_date'];
        $selectedOrders = $validated['selectedOrders'];
        $orderCount = count($selectedOrders);
        // Set default schedule_time if not provided
        $validated['schedule_time'] = $validated['schedule_time'] ?? now()->format('H:i');
        $iso_date = Carbon::createFromFormat('Y/m/d', $schedule_date)->format('Y-m-d');
        // Count existing orders assigned to this department & region on the same day
        $existingOrderCount = ServiceOrder::where('department', $department)
            ->where('region', $region)
            ->whereDate('schedule_date', $schedule_date)
            ->count();
        // Check if adding new orders exceeds the configurable daily cap
        $dailyCap = \App\Models\AppSetting::current()->outdoor_daily_order_cap;
        if (($existingOrderCount + $orderCount) > $dailyCap) {
            return response()->json([
                'error' => "Cannot assign more than {$dailyCap} service orders to the same team and region on the same day.",
                'existing_count' => $existingOrderCount,
                'new_orders_attempted' => $orderCount,
            ], 400);
        }

        // Proceed with updating service orders
        $updatedCount = ServiceOrder::whereIn('document_no', $selectedOrders)
            ->update([
                'department' => $department,
                'region' => $region,
                'schedule_date' => $schedule_date,
                'schedule_time' => $validated['schedule_time'], // Update schedule_time as well
            ]);

        if ($updatedCount > 0) {
            // Get all updated service orders to send messages
            $updatedServiceOrders = ServiceOrder::whereIn('document_no', $selectedOrders)->get();
            
            foreach ($updatedServiceOrders as $serviceOrder) {
                // Record activity for each order
                $this->teamRegionActivityController->teamRegionActivity(
                    $serviceOrder->document_no,
                    $department,
                    $region,
                    $schedule_date,
                    $user->id, // Assigned By
                    $user->id  // Updated By
                );
                
                // Send message to Business Central for each order
                try {
                    $this->businessCentral->sendMessageBusinessCentral(
                        $serviceOrder->mobile_no,
                        $serviceOrder->document_no,
                        $serviceOrder->repair_status_code,
                        $iso_date,
                        $validated['schedule_time'], 
                    );
                } catch (\Exception $e) {
                    Log::error('Failed to send message to Business Central for order: ' . $serviceOrder->document_no, [
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            return response()->json([
                'message' => 'Service Orders updated successfully.',
                'updated_count' => $updatedCount,
            ], 200);
        } else {
            return response()->json([
                'error' => 'No matching service orders found or already updated.',
            ], 404);
        }
    }
}   
