<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\TechnicianController;

class NotificationController extends Controller
{
    private $technician;

    public function __construct(TechnicianController $technician)
    {
        $this->technician = $technician;
    }
    public function index()
    {
        $user = Auth::guard('in-memory')->user();
        $userId = $user->ID;

        $notifications = Notification::where('recipient_id', $userId)
            ->where('read_status', 'unread')
            ->orderBy('created_at', 'desc')
            ->get();

        // Count the notifications
        $notificationCount = $notifications->count();

        // Fetch technician details
        $technicianId = $notifications->pluck('sender_id')->unique()->first();
        $technicianResponse = $this->technician->getTechnician($technicianId);
        $technician = json_decode($technicianResponse->getContent(), true); // Decode JSON to array

        // Combine technician details with notifications
        $notificationsWithTechnician = $notifications->map(function ($notification) use ($technician) {
            $notification->sender_details = [
                'First_Name' => $technician['First_Name'] ?? 'N/A',
                'Last_Name' => $technician['Last_Name'] ?? 'N/A',
                'Technician_Type' => $technician['Technician_Type'] ?? 'N/A',
                'Technician_Dept' => $technician['Technician_Dept'] ?? 'N/A',
            ];
            return $notification;
        });

        // Return the combined response
        return response()->json([
            'success' => true,
            'notification_count' => $notificationCount,
            'data' => $notificationsWithTechnician,
        ]);
    }

    public function getRecipientsForNotification($technicianList, $serviceOrderType)
    {
        $recipients = [];


        foreach ($technicianList as $technician) {
            // Handle CSE technician type - Only OUTDOOR notifications
            if ($technician['Technician_Type'] === 'CSE' && $serviceOrderType === 'OUTDOOR') {
                $recipients[] = $technician['ID'];
            }

            // Handle Team Leader and Admin technician types - All service orders
            if (in_array($technician['Technician_Type'], ['Team Leader'])) {
                $recipients[] = $technician['ID'];
            }
        }

        return array_unique($recipients);
    }

    public function createNotification($data)
    {
        $user = Auth::guard('in-memory')->user();
        $userId = $user->ID;
        $validated = validator($data, [
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'recipient_id' => 'required',
            'service_order_id' => 'nullable',
            'notification_type' => 'required|string',
        ])->validate();

        Notification::where('recipient_id', $validated['recipient_id'])
        ->where('service_order_id', $validated['service_order_id'])
        ->where('read_status', 'unread')
        ->update(['read_status' => 'read']);

        $notification = Notification::create(array_merge($validated, [
            'sender_id' => $userId,
            'read_status' => 'unread',
        ]));

        return $notification;
    }

    public function markAsRead($id)
    {
        $user = Auth::guard('in-memory')->user();
        $userId = $user->ID;
        $notification = Notification::where('id', $id)
            ->where('recipient_id', $userId)
            ->first();

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
        }
        $notification->update(['read_status' => 'read']);

        return response()->json(['success' => true, 'message' => 'Notification marked as read']);
    }

    public function markAllAsRead()
    {
        $user = Auth::guard('in-memory')->user();
        $userId = $user->ID;

        Notification::where('recipient_id', $userId)
            ->where('read_status', 'unread')
            ->update(['read_status' => 'read']);

        return response()->json(['success' => true, 'message' => 'All notifications marked as read']);
    }


    public function delete($id)
    {
        $user = Auth::guard('in-memory')->user();
        $userId = $user->ID;

        $notification = Notification::where('id', $id)
            ->where('recipient_id', $userId)
            ->first();

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
        }
        $notification->delete();

        return response()->json(['success' => true, 'message' => 'Notification deleted successfully']);
    }
}
