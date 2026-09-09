<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceOrder;
use Illuminate\Http\Response;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\BusinessCentral;

class ServiceOrderController extends Controller
{
    protected $businessCentral;

    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }

    public function getServiceOrdersByDateRange(Request $request)
    {
        try {

            $startDate = Carbon::parse($request->input('start'));
            $endDate = Carbon::parse($request->input('end'));
            $user = Auth::guard('in-memory')->user();

            $query = ServiceOrder::query();

            if ($user->Technician_Type == 'Technician') {
                $query = $query->where('technician_id', $user->ID);
            }

            $serviceOrders = $query->whereBetween('created_at', [$startDate, $endDate])->get();
            return response()->json([
                'serviceOrders' => $serviceOrders,
            ], 200);
        } catch (\Exception $e) {
            Log::error("Failed to retrive service order", [$e]);
            return response()->json(['error' => 'Failed to retrieve service orders.'], 500);
        }


    }


    public function getServiceOrders(Request $request)
    {
        try {
            // Log::info($request);
            $user = Auth::guard('in-memory')->user();
            $tableParams = $request->input('tableParams');
            $pagination = $tableParams['pagination'];
            $searchText = $request->input('searchText');
            $filter = $request->input('filter');
            // Extract pagination details
            $currentPage = $pagination['current'];
            $pageSize = $pagination['pageSize'];
            // Extract filter details
            $scheduleFilter = $filter['scheduled'];
            $notScheduleFilter = $filter['not_scheduled'];
            $periodFilter = $filter['period'];

             // New filters
            $repairStatusCode = $filter['repair_status_code'] ?? null;
            $brandCode = $filter['brand_code'] ?? null;
            $team = $filter['team'] ?? null; 
            $start = $filter['start'] ?? null;
            $end = $filter['end'] ?? null;
            $specificDate = $filter['specific_date'] ?? null;
            $portalStatus = $filter['portal_status'] ?? null;

            // $search = $request->input('search', null);
            if (trim($user->Technician_Dept) == '' && $user->Technician_Type != 'Technician') {
                // EXCEPTIONS: Allow blank Technician_Dept for CSC, Team Leader, or Admin
                if (!in_array($user->Technician_Type, ['CSC', 'Team Leader', 'Admin'])) {
                    return response()->json([
                        'error' => 'Technician department is not available. Please contact your administrator.',
                    ], 400);
                }
            }

            // Start query
            $query = ServiceOrder::query();

            // Condition 1: Technician sees only their orders
            if ($user->Technician_Type == 'Technician') {
                $query->where('technician_id', $user->ID);
            }

            // Condition 2: CSC or Team Leader with empty Technician_Dept sees all orders
            elseif (in_array($user->Technician_Type, ['CSC', 'Team Leader']) && trim($user->Technician_Dept) == '') {
                // Show all  no filter
            }

            // Condition 3: Admin sees all  no filter
            elseif ($user->Technician_Type == 'Admin') {
                // Show all  no filter
            }

            // Else: filter by department prefix (e.g., 'Electrical%')
            else {
                $query->where('service_order_type', 'like', $user->Technician_Dept . '%');
            }
            Log::info("User Type", [$user->Technician_Dept]);
            // Log::info("search", [$searchText]);
            if (($scheduleFilter and (!$notScheduleFilter)) or ((!$scheduleFilter) and $notScheduleFilter)) {
                if ($scheduleFilter) {
                    $query = $query->whereNotNull('schedule_date');
                } else {
                    $query = $query->whereNull('schedule_date');
                }
            }

            if ($periodFilter != 'all') {
                $dateRanges = [
                    "24h" => Carbon::now()->subHours(24),
                    "7d" => Carbon::now()->subDays(7),
                    "30d" => Carbon::now()->subDays(30),
                    "12m" => Carbon::now()->subMonths(12),
                ];
                $query->where('created_at', '>=', $dateRanges[$periodFilter]);
            }


            // New filters
            if ($repairStatusCode) {
                $query->where('repair_status_code', $repairStatusCode);
            }

            if ($brandCode) {
                $query->where('brand_code', $brandCode);
            }

            if ($team) {
                $query->where('department', $team);
            }

            if ($portalStatus) {
                $query->where('status', $portalStatus);
            }

            if ($start && $end) {
                $query->whereBetween('schedule_date', [Carbon::parse($start), Carbon::parse($end)]);
            } elseif ($specificDate) {
                $query->whereDate('schedule_date', Carbon::parse($specificDate));
            }

            if (strlen($searchText) > 0) {
                $query->where(function ($query) use ($request) {
                    $query->where('document_no', 'like', '%' . $request->searchText . '%')
                        ->orWhere('service_order_type', 'like', '%' . $request->searchText . '%')
                        ->orWhere('department', 'like', '%' . $request->searchText . '%')
                        ->orWhere('region', 'like', '%' . $request->searchText . '%')
                        ->orWhere('name', 'like', '%' . $request->searchText . '%');

                });
            }

            $query->orderBy('order_date', 'desc');

            $serviceOrders = $query->paginate($pageSize, ['*'], 'page', $currentPage);
            $sql = $query->toSql();
            Log:
            info($sql);

            return response()->json([
                'serviceOrders' => $serviceOrders,
                'filter' => $filter,
                'pagination' => [
                    'current' => $serviceOrders->currentPage(),
                    'last_page' => $serviceOrders->lastPage(),
                    'pageSize' => $serviceOrders->perPage(),
                    'total' => $serviceOrders->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error("Failed to retrive service order", [$e]);
            return response()->json(['error' => 'Failed to retrieve service orders.'], 500);
        }
    }

    public function getOutdoorServiceOrders(Request $request)
    {
        try {
            // Log::info($request);
            $user = Auth::guard('in-memory')->user();
            $tableParams = $request->input('tableParams');
            $pagination = $tableParams['pagination'];
            $searchText = $request->input('searchText');
            $filter = $request->input('filter');
    
            // Extract pagination details
            $currentPage = $pagination['current'];
            $pageSize = $pagination['pageSize'];
    
            // Extract filter details
            $scheduleFilter = $filter['scheduled'];
            $notScheduleFilter = $filter['not_scheduled'];
            $periodFilter = $filter['period'];
    
            $query = ServiceOrder::query();
    
            // Ensure only outdoor service orders
            $query->where('service_order_type', 'OUTDOOR');
                // ->whereNull('department')
                // ->whereNull('region')
                // ->where('service_order_status', '!=', 'Finished'); // Exclude "Finished" status
            
    
            // Restrict for technicians
            if ($user->Technician_Type == 'Technician') {
                $query->where('technician_id', $user->ID);
            }
    
            // Apply schedule filter
            if (($scheduleFilter && !$notScheduleFilter) || (!$scheduleFilter && $notScheduleFilter)) {
                if ($scheduleFilter) {
                    $query->whereNotNull('schedule_date');
                } else {
                    $query->whereNull('schedule_date');
                }
            }
    
            // Apply period filter
            if ($periodFilter != 'all') {
                $dateRanges = [
                    "24h" => Carbon::now()->subHours(24),
                    "7d" => Carbon::now()->subDays(7),
                    "30d" => Carbon::now()->subDays(30),
                    "12m" => Carbon::now()->subMonths(12),
                ];
                $query->where('created_at', '>=', $dateRanges[$periodFilter]);
            }
    
            // Apply search filter
            if (strlen($searchText) > 0) {
                $query->where(function ($query) use ($request) {
                    $query->where('document_no', 'like', '%' . $request->searchText . '%')
                        ->orWhere('service_order_type', 'like', '%' . $request->searchText . '%')
                        ->orWhere('department', 'like', '%' . $request->searchText . '%')
                        ->orWhere('region', 'like', '%' . $request->searchText . '%')
                        ->orWhere('name', 'like', '%' . $request->searchText . '%');
                });
            }
    
            // Apply pagination
            $serviceOrders = $query->paginate($pageSize, ['*'], 'page', $currentPage);
            Log::info($query->toSql());
    
            return response()->json([
                'serviceOrders' => $serviceOrders,
                'filter' => $filter,
                'pagination' => [
                    'current' => $serviceOrders->currentPage(),
                    'last_page' => $serviceOrders->lastPage(),
                    'pageSize' => $serviceOrders->perPage(),
                    'total' => $serviceOrders->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error("Failed to retrieve service orders", [$e]);
            return response()->json(['error' => 'Failed to retrieve service orders.'], 500);
        }
    }    



    public function getServiceOrder($document_no)
    {
        $timeout = env('BC_DIRECT_FETCH_TIMEOUT', 3);
        $bcData = $this->businessCentral->getSingleServiceOrder($document_no, (int)$timeout);

        if ($bcData) {
            $serviceOrder = $this->businessCentral->syncSingleServiceOrderFromBCData($bcData);
            return response()->json($serviceOrder);
        }

        $serviceOrder = ServiceOrder::find($document_no);

        if (!$serviceOrder) {
            return response()->json(['message' => 'Service Order not found'], 404);
        }

        return response()->json($serviceOrder);
    }


    public function updateServiceOrder(Request $request, $document_no)
    {
        $serviceOrder = ServiceOrder::find($document_no);

        if (!$serviceOrder) {
            return response()->json(['message' => 'Service Order not found'], 404);
        }

        $timeout = env('BC_DIRECT_FETCH_TIMEOUT', 3);
        $bcData = $this->businessCentral->getSingleServiceOrder($document_no, (int)$timeout);

        if ($bcData) {
            $bcStatus = $bcData['Repair_Status_Code'] ?? null;
            $localStatus = $serviceOrder->repair_status_code;

            // Sync latest BC data to DB
            $serviceOrder = $this->businessCentral->syncSingleServiceOrderFromBCData($bcData);

            if ($bcStatus !== null && $localStatus !== null && trim($bcStatus) !== trim($localStatus)) {
                return response()->json([
                    'error' => 'Status on our portal and BC was not same. Latest order info has been updated from BC, please try again.',
                    'message' => 'Status on our portal and BC was not same. Latest order info has been updated from BC, please try again.',
                    'data' => $serviceOrder,
                ], 409);
            }
        }

        $validatedData = $request->validate([
            'gspn_no' => 'nullable|string',
            'order_date' => 'nullable|date',
            'name' => 'nullable|string',
            'address' => 'nullable|string',
            'address_2' => 'nullable|string',
            'city' => 'nullable|string',
            'phone_no' => 'nullable|string',
            'warranty_type' => 'nullable|string',
            'remarks' => 'nullable|string',
            'customer_complaint' => 'nullable|string',
            'item_no' => 'nullable|string',
            'description' => 'nullable|string',
            'serial_no' => 'nullable|string',
            'dop' => 'nullable|string',
            'repair_status_code' => 'nullable|string',
            'department' => 'nullable|string',
            'region' => 'nullable|string',
            'document_type' => 'nullable|string',
            'shortcut_dimension_1_code' => 'nullable|string',
            'line_no' => 'nullable|integer',
            'actual_purchase_date' => 'nullable|date',
            'technician_id' => 'nullable|string',
            'priority' => 'nullable|string',
            'schedule_date' => 'nullable|date',
            'schedule_time' => 'nullable|date',
        ]);

        $serviceOrder->update($validatedData);

        return response()->json(['message' => 'Service Order updated successfully', 'data' => $serviceOrder]);
    }


    public function destroyServiceOrder($document_no)
    {
        $serviceOrder = ServiceOrder::find($document_no);

        if (!$serviceOrder) {
            return response()->json(['message' => 'Service Order not found'], 404);
        }

        $serviceOrder->delete();

        return response()->json(['message' => 'Service Order deleted successfully']);
    }

    public function countScheduledServiceOrders(Request $request)
    {
        try { 
            $counts = ServiceOrder::whereNotNull('department')
                ->whereNotNull('region')
                ->selectRaw('schedule_date, department, region, COUNT(*) as count')
                ->groupBy('schedule_date', 'department', 'region')
                ->orderBy('schedule_date', 'asc') // Ensure ordering from current to future dates
                ->get();

            return response()->json($counts, 200);
        } catch (\Exception $e) {
            Log::error("Failed to count scheduled service orders", [$e]);
            return response()->json(['error' => 'Failed to count service orders.'], 500);
        }
    }


}
