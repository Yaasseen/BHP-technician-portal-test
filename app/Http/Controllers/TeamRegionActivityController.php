<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SparePartActivity;
use App\Models\TeamRegionActivity;
use Illuminate\Support\Facades\Auth;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\NotificationController;

class TeamRegionActivityController extends Controller
{

    private $businessCentral;

    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }
    public function teamRegionActivity($documentNumber, $team = null, $region = null, $schedule_date = null, $assignedBy = null, $updatedBy = null)
    {
        return TeamRegionActivity::create([
            'document_no' => $documentNumber,
            'team' => $team,
            'region' => $region,
            'assigned_by' => $assignedBy ?? Auth::id(),
            'updated_by' => $updatedBy ?? Auth::id(),
            'schedule_date' => $schedule_date,
            'assigned_date' => now()->toDateString(),
            'assigned_time' => now()->toTimeString(),
        ]);
    
    }


    public function getTeamRegionActivity(Request $request)
    {
        $validated = $request->validate([
            'team' => 'nullable|string',
            'region' => 'nullable|string',
            'schedule_date' => 'nullable|date',
        ]);

        // Fetch technician list from BusinessCentral
        $technicianList = $this->businessCentral->technicianList();
        
        $technicianLookup = [];
        foreach ($technicianList as $technician) {
            if (isset($technician['ID'], $technician['First_Name'], $technician['Last_Name'])) {
                $technicianLookup[$technician['ID']] = trim($technician['First_Name'] . ' ' . $technician['Last_Name']);
            }
        }

        $query = TeamRegionActivity::query();

        // Apply filters if provided
        if (!empty($validated['team'])) {
            $query->where('team', $validated['team']);
        }

        if (!empty($validated['region'])) {
            $query->where('region', $validated['region']);
        }

        if (!empty($validated['schedule_date'])) {
            $query->whereDate('schedule_date', $validated['schedule_date']);
        }

        $activities = $query->orderBy('assigned_date', 'desc')->get();

        // Format activities with assigned_by mapped to technician name
        $activitiesFormatted = $activities->map(function ($activity) use ($technicianLookup) {
            return [
                'id' => $activity->id,  
                'document_no' => $activity->document_no,  
                'team' => $activity->team,  
                'region' => $activity->region,
                'schedule_date' => $activity->schedule_date,
                'assigned_date' => $activity->assigned_date,
                'assigned_time' => $activity->assigned_time,
                'assigned_by' => $technicianLookup[$activity->assigned_by] ?? null, // Map technician ID to name
                'updated_by' => $technicianLookup[$activity->updated_by] ?? null, // Map technician ID to name
            ];
        });

        return response()->json([
            'activities' => $activitiesFormatted,
        ], 200);
    }


    public function getSingleTeamRegionActivity(Request $request)
    {
        $documentNo = $request->query('document_no');
        if (!$documentNo) {
            return response()->json([
                'error' => 'Document number is required.',
            ], 400);
        }

        // Fetch technician list from BusinessCentral
        $technicianList = $this->businessCentral->technicianList();
        
        // Create a lookup array for technician names
        $technicianLookup = [];
        foreach ($technicianList as $technician) {
            if (isset($technician['ID'], $technician['First_Name'], $technician['Last_Name'])) {
                $technicianLookup[$technician['ID']] = trim($technician['First_Name'] . ' ' . $technician['Last_Name']);
            }
        }

        // Fetch the activity by document_no
        $activity = TeamRegionActivity::where('document_no', $documentNo)->first();

        if (!$activity) {
            return response()->json([
                'message' => 'Activity not found',
            ], 404);
        }

        // Format response
        $activityFormatted = [
            'id' => $activity->id,
            'document_no' => $activity->document_no,
            'team' => $activity->team,
            'region' => $activity->region,
            'schedule_date' => $activity->schedule_date,
            'assigned_date' => $activity->assigned_date,
            'assigned_time' => $activity->assigned_time,
            'assigned_by' => $technicianLookup[$activity->assigned_by] ?? null,
            'updated_by' => $technicianLookup[$activity->updated_by] ?? null,
        ];

        return response()->json([
            'activity' => $activityFormatted,
        ], 200);
    }




}