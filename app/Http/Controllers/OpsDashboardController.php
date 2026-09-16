<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use App\Models\ServiceOrderActivity;
use App\Models\TeamRegionActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OpsDashboardController extends Controller
{
    private function baseServiceOrderQuery(Request $request)
    {
        $query = ServiceOrder::where('is_posted', false)
            ->whereNotNull('status');

        if ($request->filled('start') && $request->filled('end')) {
            $query->whereBetween('schedule_date', [$request->input('start'), $request->input('end')]);
        }

        if ($request->filled('status')) {
            $query->whereIn('status', (array) $request->input('status'));
        }

        if ($request->filled('search')) {
            $query->where('document_no', 'like', '%' . $request->input('search') . '%');
        }

        return $query;
    }

    private function jobsPage(Request $request, $query)
    {
        return (clone $query)
            ->orderByDesc('schedule_date')
            ->select('document_no', 'schedule_date', 'allocation_date', 'status', 'technician_name', 'name', 'region', 'department')
            ->paginate(10);
    }

    private function departmentSummary(Request $request, string $serviceOrderType)
    {
        $query = $this->baseServiceOrderQuery($request)
            ->where('service_order_type', $serviceOrderType);

        $byDay = (clone $query)
            ->whereNotNull('schedule_date')
            ->selectRaw('schedule_date, status, COUNT(*) as count')
            ->groupBy('schedule_date', 'status')
            ->orderBy('schedule_date')
            ->get();

        $byTechnician = (clone $query)
            ->whereNotNull('technician_name')
            ->selectRaw('technician_name, status, COUNT(*) as count')
            ->groupBy('technician_name', 'status')
            ->get();

        $documentNos = (clone $query)->pluck('document_no');

        $byRegion = TeamRegionActivity::whereIn('document_no', $documentNos)
            ->whereNotNull('region')
            ->whereNotNull('schedule_date')
            ->selectRaw('schedule_date, region, COUNT(*) as count')
            ->groupBy('schedule_date', 'region')
            ->orderBy('schedule_date')
            ->get();

        return response()->json([
            'by_day' => $byDay,
            'by_technician' => $byTechnician,
            'by_region' => $byRegion,
            'jobs' => $this->jobsPage($request, $query),
        ], 200);
    }

    public function outdoor(Request $request)
    {
        return $this->departmentSummary($request, 'OUTDOOR');
    }

    public function indoor(Request $request)
    {
        return $this->departmentSummary($request, 'INDOOR');
    }

    public function hhpt(Request $request)
    {
        return $this->departmentSummary($request, 'HHP/IT/DI');
    }

    public function technicianPerformance(Request $request)
    {
        $query = $this->baseServiceOrderQuery($request);

        $byTechnician = (clone $query)
            ->whereNotNull('technician_name')
            ->selectRaw('technician_name, status, COUNT(*) as count')
            ->groupBy('technician_name', 'status')
            ->get();

        $byAllocationDate = (clone $query)
            ->whereNotNull('allocation_date')
            ->selectRaw('allocation_date, status, COUNT(*) as count')
            ->groupBy('allocation_date', 'status')
            ->orderBy('allocation_date')
            ->get();

        return response()->json([
            'by_technician' => $byTechnician,
            'by_allocation_date' => $byAllocationDate,
            'jobs' => $this->jobsPage($request, $query),
        ], 200);
    }

    public function payments(Request $request)
    {
        $start = $request->input('start', now()->toDateString());
        $end = $request->input('end', now()->toDateString());

        $documentNos = ServiceOrderActivity::where('description', 'like', '%payment%')
            ->pluck('document_no')
            ->unique();

        $query = ServiceOrder::where('is_posted', false)
            ->whereIn('document_no', $documentNos)
            ->whereBetween('schedule_date', [$start, $end]);

        if ($request->filled('search')) {
            $query->where('document_no', 'like', '%' . $request->input('search') . '%');
        }

        $jobs = (clone $query)
            ->orderByDesc('schedule_date')
            ->select('document_no', 'name', 'schedule_date', 'region', 'technician_name', 'status')
            ->paginate(10);

        return response()->json(['jobs' => $jobs], 200);
    }
}
