<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TeamSchedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use DateTime;



class TeamScheduleController extends Controller
{

    private $businessCentral;

    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }
    
    private function transformTeamData(array $data): array {
        $result = [];
        $currentDate = Carbon::now()->toDateString();
        // $currentDate = Carbon::parse('2025-01-07')->format('Y-m-d');; 

    
        foreach ($data as $team) {
            $teamDate = Carbon::parse($team["Date"])->toDateString(); 
            if ($teamDate >= $currentDate) { // Compare in YYYY-MM-DD format
                // Log::info("Processing Team Date: " . $teamDate); 
                $teamName = $team['Team'];
                unset($team['@odata.etag'], $team['Date'], $team['Team'], $team['Day']);
                $result[$teamDate][$teamName] = $team;
            }
        }
    
        return $result;    
    }

    public function getTeamRegionConfiguration() {
        $user = Auth::guard('in-memory')->user();
        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }
        
        $teamRegionConfiguration = $this->businessCentral->teamRegionConfiguration();
        // Log::info($teamRegionConfiguration);
        $transformedData = $this->transformTeamData($teamRegionConfiguration);
        
        return response()->json($transformedData);
    }
    

     // Fetch all team schedules
     public function index()
     {
         $schedules = TeamSchedule::all(); // Retrieve all records
         return response()->json($schedules, 200);
     }


     public function store(Request $request)
     {
         try {
             $request->validate([
                 'schedules' => 'required|array',
                 'schedules.*.day' => 'required|string',
                 'schedules.*.team' => 'required|string',
                 'schedules.*.region' => 'required|string',
                 'schedules.*.active' => 'nullable|boolean',
             ]);
 
             Log::info('Starting schedule update process');
 
             TeamSchedule::query()->delete();
 
             foreach ($request->schedules as $schedule) {
                 TeamSchedule::create($schedule);
             }

             Log::info('Schedules updated successfully');
             return response()->json(['message' => 'Schedules updated successfully'], 201);
 
         } catch (\Exception $e) {
             Log::error('Failed to update schedules', [
                 'error_message' => $e->getMessage(),
                 'stack_trace' => $e->getTraceAsString()
             ]);
 
             return response()->json(['message' => 'Failed to update schedules', 'error' => $e->getMessage()], 500);
         }
     }

     public function storeTeamRegionConfiguration()
     {
         try {
             // Delete existing records
             TeamSchedule::truncate();
     
             // Fetch team region configuration data
             $data = $this->businessCentral->teamRegionConfiguration();
     
             // Validate that $data is an array
             if (!is_array($data) || empty($data)) {
                 Log::warning('Invalid or empty team region configuration data.');
                 return response()->json(['error' => 'Invalid data format, expected a non-empty array'], 400);
             }
     
             $insertData = [];
     
             foreach ($data as $item) {
                 foreach ($item as $key => $value) {
                     if (str_starts_with($key, 'R_') && $value === true) {
                         $insertData[] = [
                             'day' => $item['Day'] ?? null,
                             'date' => $item['Date'] ?? null,
                             'team' => $item['Team'] ?? null,
                             'active' => $item['Active'] ?? false,
                             'region' => substr($key, 2), // Remove 'R_' prefix
                             'created_at' => now(),
                             'updated_at' => now(),
                         ];
                     }
                 }
             }
     
             if ($insertData) {
                 TeamSchedule::insert($insertData);
                 Log::info('Team region configurations saved successfully.');
             } else {
                 Log::info('No valid team region configurations to insert.');
             }
     
             return response()->json(['message' => 'Team region configurations saved successfully.'], 201);
         } catch (\Exception $e) {
             Log::error('Error saving team region configurations', [
                 'error' => $e->getMessage(),
                 'stack' => $e->getTraceAsString(),
             ]);
     
             return response()->json(['error' => 'Failed to save configurations', 'message' => $e->getMessage()], 500);
         }
     }

     

}
