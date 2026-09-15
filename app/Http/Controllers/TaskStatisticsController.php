<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Services\BusinessCentral;
use App\Models\AppSetting;



class TaskStatisticsController extends Controller
{

    private $businessCentral;

    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }

    public function getServiceOrderCounts()
    {
        $user = Auth::guard('in-memory')->user();
        $allStatuses = array_keys(config('portal.statuses'));
        $overdueThresholdDate = now()->subDays(AppSetting::current()->overdue_days_threshold);

        if ($user->Technician_Dept == ' ' && !in_array($user->Technician_Type, ['Technician', 'CSC', 'Team Leader', 'Admin'])) {
            return response()->json([
                'total_tasks' => 0,
                'active_tasks' => 0,
                'completed_tasks' => 0,
                'reschedule_tasks' => 0,
                'overdue_tasks' => 0,
            ]);
        }

        // $allowedTechnicianTypes = ['CSC', 'Read Only', 'Team Leader', 'Admin'];
        $allowedTechnicianTypes = ['CSC', 'Team Leader'];
        if (
            $user->Technician_Type === 'Admin' ||
            (in_array($user->Technician_Type, $allowedTechnicianTypes) && trim($user->Technician_Dept) === '')
        ) {
            // $totalTasks = ServiceOrder::where('status', 'PENDING')->count();
            $totalTasks = ServiceOrder::whereIn('status', $allStatuses)->count();
            $inProcessTasks = ServiceOrder::whereIn('status', ['TECH-ASSN', 'INPROGRESS'])->count();
            $finishedTasks = ServiceOrder::where('status', 'COMPLETED')->count();
            $reScheduleTasks = ServiceOrder::whereIn('status', ['RESCH-UNAVAI', 'RESCH-COMP'])->count();
            $overdueTasks = ServiceOrder::where('status', 'TECH-ASSN')
            ->whereDate('allocation_date', '<', $overdueThresholdDate)  // Configurable via Settings > overdue_days_threshold
            ->count();

            return response()->json([
                'total_tasks' => $totalTasks,
                'active_tasks' => $inProcessTasks,
                'completed_tasks' => $finishedTasks,
                'reschedule_tasks' => $reScheduleTasks,
                'overdue_tasks' => $overdueTasks,
            ]);
        }
        $allowedTechnicianTypes = ['CSC', 'Read Only', 'Team Leader'];
        if (in_array($user->Technician_Type, $allowedTechnicianTypes)) {

            $baseQuery = ServiceOrder::whereIn('status', $allStatuses);

            if ($user->Technician_Dept) {
                $baseQuery = $baseQuery->where('service_order_type', 'like', $user->Technician_Dept . '%');
            }

            // Count for Total Tasks
            $totalTasks = (clone $baseQuery)->count();

            // Count for In-Progress Tasks
            $inProcessTasks = (clone $baseQuery)->whereIn('status', ['TECH-ASSN', 'INPROGRESS'])->count();

            // Count for Finished Tasks
            $finishedTasks = (clone $baseQuery)->where('status', 'COMPLETED')->count();

            // Count for Reschedule Tasks
            $reScheduleTasks = (clone $baseQuery)->whereIn('status', ['RESCH-UNAVAI', 'RESCH-COMP'])->count();

            // Count for Overdue Tasks
            $overdueTasks = (clone $baseQuery)
                ->where('status', 'TECH-ASSN')
                ->whereDate('allocation_date', '<', $overdueThresholdDate)
                ->count();

            return response()->json([
                'total_tasks' => $totalTasks,
                'active_tasks' => $inProcessTasks,
                'completed_tasks' => $finishedTasks,
                'reschedule_tasks' => $reScheduleTasks,
                'overdue_tasks' => $overdueTasks,
            ]);
    }

        if ($user->Technician_Type === 'Technician') {
            $userId = $user->ID;

            // Base query for this technician
            $baseQuery = ServiceOrder::where('technician_id', $userId);

            // Total tasks (any status)
            $totalTasks = (clone $baseQuery)->count();

            // Completed tasks
            $finishedTasks = (clone $baseQuery)
                ->where('status', 'COMPLETED')
                ->count();

            // Pending tasks
            $pendingTasks = (clone $baseQuery)
                ->where('status', 'PENDING')
                ->count();

            // In-progress tasks
            $inProcessTasks = (clone $baseQuery)
                ->whereIn('status', ['TECH-ASSN', 'INPROGRESS'])
                ->count();

            // Rescheduled tasks
            $reScheduleTasks = (clone $baseQuery)
                ->whereIn('status', ['RESCH-UNAVAI', 'RESCH-COMP'])
                ->count();

            // Overdue tasks
            $overdueTasks = (clone $baseQuery)
                ->where('status', 'TECH-ASSN')
                ->whereDate('allocation_date', '<', $overdueThresholdDate)
                ->count();

            // Optional debug logs (for testing issues)
            Log::info('Task counts for technician: ' . $userId, [
                'total' => $totalTasks,
                'completed' => $finishedTasks,
                'pending' => $pendingTasks,
                'in_process' => $inProcessTasks,
                'rescheduled' => $reScheduleTasks,
                'overdue' => $overdueTasks,
            ]);

            // Return the JSON response
            return response()->json([
                'total_tasks' => $totalTasks,
                'completed_tasks' => $finishedTasks,
                'pending_tasks' => $pendingTasks,
                'active_tasks' => $inProcessTasks,
                'reschedule_tasks' => $reScheduleTasks,
                'overdue_tasks' => $overdueTasks,
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 403);
    }


    // public function getWeeklyScheduleOverview(Request $request)
    // {
    //     $weekOffset = (int) $request->query('week_offset', 0); // Ensure it's an integer

    //     $weekStartInput = $request->query('week_start'); // Get user-selected week start date

    //     if ($weekStartInput) {
    //         $startOfWeek = Carbon::parse($weekStartInput)->startOfWeek();
    //         $endOfWeek = Carbon::parse($weekStartInput)->endOfWeek();
    //     } else {
    //         $startOfWeek = Carbon::now()->startOfWeek()->addWeeks($weekOffset);
    //         $endOfWeek = Carbon::now()->endOfWeek()->addWeeks($weekOffset);
    //     }

    //     $orders = ServiceOrder::whereBetween('schedule_date', [$startOfWeek, $endOfWeek])
    //         ->where('service_order_type', 'OUTDOOR') // Added condition
    //         ->select('document_no', 'name', 'schedule_date', 'department', 'region', 'technician_id', 'technician_name', 'remarks', 'description', 'priority', 'schedule_time')
    //         ->get();

    //     $weeklySchedule = [];

    //     foreach ($orders as $order) {
    //         $day = Carbon::parse($order->schedule_date)->format('l'); // Get weekday name (Monday, Tuesday, etc.)

    //         if (!isset($weeklySchedule[$day])) {
    //             $weeklySchedule[$day] = [];
    //         }

    //         // Separate schedules based on both department and region
    //         // $departmentRegionKey = $order->department . "-" . $order->region;
    //         $departmentRegionKey = $order->department . " - " . $order->region;

    //         if (!isset($weeklySchedule[$day][$departmentRegionKey])) {
    //             $weeklySchedule[$day][$departmentRegionKey] = [
    //                 'region' => $order->region ?? 'No regions assigned',
    //                 'team' => $order->department ?? 'No team assigned',
    //                 'count' => "0/12",
    //                 'tickets' => []
    //             ];
    //         }

    //         $weeklySchedule[$day][$departmentRegionKey]['tickets'][] = [
    //             'document_no' => $order->document_no,
    //             'customer_name' => $order->name,
    //             'technician_id' => $order->technician_id,
    //             'technician_name' => $order->technician_name,
    //             'remarks' => $order->remarks,
    //             'description' => $order->description,
    //             'priority' => $order->priority,
    //             'region' => $order->region,
    //             'schedule_date' => $order->schedule_date,
    //             'schedule_time' => $order->schedule_time,
    //         ];

    //         // Count assigned tickets for this department-region separately
    //         $weeklySchedule[$day][$departmentRegionKey]['count'] =
    //             count($weeklySchedule[$day][$departmentRegionKey]['tickets']) . "/12";
    //     }

    //     // Add active team & slot count
    //     foreach ($weeklySchedule as $day => $teams) {
    //         $activeTeams = count($teams);
    //         $slotsUsed = array_sum(array_map(fn($team) => count($team['tickets']), $teams));

    //         $weeklySchedule[$day]['active_teams'] = $activeTeams;
    //         $weeklySchedule[$day]['slots_used'] = $slotsUsed;
    //     }

    //     return response()->json([
    //         'week_start' => $startOfWeek->toDateString(),
    //         'week_end' => $endOfWeek->toDateString(),
    //         'current_week_offset' => $weekOffset,
    //         'schedule' => $weeklySchedule
    //     ]);
    // }




    private function getServiceOrders(Carbon $start, Carbon $end)
    {
        return ServiceOrder::whereBetween('schedule_date', [$start, $end])
            ->where('service_order_type', 'OUTDOOR')
            ->get([
                'document_no', 'name', 'schedule_date', 'department', 'region',
                'technician_id', 'technician_name', 'remarks', 'description',
                'priority', 'schedule_time'
            ]);
    }

    private function buildScheduleFromOrders($orders)
    {
        $schedule = [];

        foreach ($orders as $order) {
            $day = Carbon::parse($order->schedule_date)->format('l');
            $key = "{$order->department} - {$order->region}";

            $schedule[$day][$key]['region'] = $order->region ?? 'No region';
            $schedule[$day][$key]['team'] = $order->department ?? 'No team';
            $schedule[$day][$key]['tickets'][] = [
                'document_no' => $order->document_no,
                'customer_name' => $order->name,
                'technician_id' => $order->technician_id,
                'technician_name' => $order->technician_name,
                'remarks' => $order->remarks,
                'description' => $order->description,
                'priority' => $order->priority,
                'region' => $order->region,
                'schedule_date' => $order->schedule_date,
                'schedule_time' => $order->schedule_time,
            ];

            $schedule[$day][$key]['count'] = count($schedule[$day][$key]['tickets']) . "/12";
        }

        return $schedule;
    }

    private function mergeTeamRegionsIntoSchedule(array $schedule, array $configs)
    {
        foreach ($configs as $config) {
            if (!$config['Active']) continue;

            $date = Carbon::parse($config['Date']);
            $day = $date->format('l');
            $team = $config['Team'];

            $regions = collect($config)->filter(fn($v, $k) => str_starts_with($k, 'R_') && $v === true)->keys();

            foreach ($regions as $regionKey) {
                $region = str_replace('R_', '', $regionKey);
                $regionFormatted = preg_replace('/(?<!^)([A-Z])/', ' $1', $region); // CamelCase to space
                $key = "{$team} - {$region}";

                if (!isset($schedule[$day][$key])) {
                    $schedule[$day][$key] = [
                        'region' => $region,
                        'team' => $team,
                        'count' => "0/12",
                        'tickets' => []
                    ];
                }
            }
        }

        return $schedule;
    }

    private function addDaySummaries(array $schedule)
    {
        foreach ($schedule as $day => &$teams) {
            $activeTeams = count(array_filter($teams, fn($team) => is_array($team) && isset($team['tickets'])));
            $slotsUsed = array_sum(array_map(fn($team) => count($team['tickets']), $teams));

            $teams['active_teams'] = $activeTeams;
            $teams['slots_used'] = $slotsUsed;
        }

        return $schedule;
    }




    public function getWeeklyScheduleOverview(Request $request)
    {
        $weekOffset = (int) $request->query('week_offset', 0);
        $weekStartInput = $request->query('week_start');

        $startOfWeek = $weekStartInput
            ? Carbon::parse($weekStartInput)->startOfWeek()
            : now()->startOfWeek()->addWeeks($weekOffset);

        $endOfWeek = $startOfWeek->copy()->endOfWeek();

        // 1. Fetch orders from DB
        $orders = $this->getServiceOrders($startOfWeek, $endOfWeek);

        // 2. Fetch team-region availability from OData
        $teamRegionConfigurations = $this->businessCentral->getTeamRegionConfigurationData($startOfWeek, $endOfWeek);

        // 3. Build weekly schedule with orders
        $weeklySchedule = $this->buildScheduleFromOrders($orders);

        // 4. Merge in OData teams/regions with 0 tickets if not already present
        $weeklySchedule = $this->mergeTeamRegionsIntoSchedule($weeklySchedule, $teamRegionConfigurations);

        // 5. Add summary per day
        $weeklySchedule = $this->addDaySummaries($weeklySchedule);

        return response()->json([
            'week_start' => $startOfWeek->toDateString(),
            'week_end' => $endOfWeek->toDateString(),
            'current_week_offset' => $weekOffset,
            'schedule' => $weeklySchedule
        ]);
    }

}
