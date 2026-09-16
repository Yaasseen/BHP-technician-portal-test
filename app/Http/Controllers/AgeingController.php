<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AgeingController extends Controller
{
    private const BUCKETS = ['0 - 7', '8 - 14', '15 - 21', '22 - 30', '31 - 60', '> 60'];

    private function bucketCase(string $column): string
    {
        return "
            CASE
                WHEN DATEDIFF(NOW(), {$column}) <= 7 THEN '0 - 7'
                WHEN DATEDIFF(NOW(), {$column}) <= 14 THEN '8 - 14'
                WHEN DATEDIFF(NOW(), {$column}) <= 21 THEN '15 - 21'
                WHEN DATEDIFF(NOW(), {$column}) <= 30 THEN '22 - 30'
                WHEN DATEDIFF(NOW(), {$column}) <= 60 THEN '31 - 60'
                ELSE '> 60'
            END
        ";
    }

    private function dateColumn(?string $field): string
    {
        return $field === 'updated_at' ? 'updated_at' : 'order_date';
    }

    private function scopedQuery()
    {
        $user = Auth::guard('in-memory')->user();

        $query = ServiceOrder::where('is_posted', false);

        if ($user->Technician_Type == 'Technician') {
            $query->where('technician_id', $user->ID);
        } elseif (in_array($user->Technician_Type, ['CSC', 'Team Leader']) && trim($user->Technician_Dept) == '') {
            // Show all
        } elseif ($user->Technician_Type == 'Admin') {
            // Show all
        } else {
            $query->where('service_order_type', 'like', $user->Technician_Dept . '%');
        }

        return $query;
    }

    private function bucketTotals(string $column): array
    {
        $rows = $this->scopedQuery()
            ->selectRaw($this->bucketCase($column) . ' as bucket, COUNT(*) as count')
            ->groupBy('bucket')
            ->pluck('count', 'bucket');

        return collect(self::BUCKETS)->map(fn($bucket) => [
            'bucket' => $bucket,
            'count' => (int) ($rows[$bucket] ?? 0),
        ])->all();
    }

    public function getSummary(Request $request)
    {
        $baseQuery = $this->scopedQuery();

        $totalOpen = (clone $baseQuery)->count();

        $averageAge = (clone $baseQuery)
            ->selectRaw('AVG(DATEDIFF(NOW(), order_date)) as avg_age')
            ->value('avg_age');

        $statusOverview = (clone $baseQuery)
            ->selectRaw('repair_status_code, COUNT(*) as count')
            ->groupBy('repair_status_code')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => [
                'status' => $row->repair_status_code ?: 'Unknown',
                'count' => (int) $row->count,
            ]);

        return response()->json([
            'data_as_at' => now()->toDateTimeString(),
            'total_open' => $totalOpen,
            'total_unassigned' => (clone $baseQuery)->whereNull('technician_id')->count(),
            'average_age' => $averageAge ? round($averageAge, 2) : 0,
            'order_date_ageing' => $this->bucketTotals('order_date'),
            'last_modified_ageing' => $this->bucketTotals('updated_at'),
            'status_overview' => $statusOverview,
        ], 200);
    }

    public function getBucketOrders(Request $request)
    {
        $validated = $request->validate([
            'bucket' => 'nullable|string|in:0 - 7,8 - 14,15 - 21,22 - 30,31 - 60,> 60',
            'date_field' => 'nullable|string|in:order_date,updated_at',
            'status' => 'nullable|string',
        ]);

        $column = $this->dateColumn($validated['date_field'] ?? 'order_date');

        $query = $this->scopedQuery()
            ->selectRaw("document_no, name, repair_status_code, status, order_date, updated_at, schedule_date, DATEDIFF(NOW(), {$column}) as age_days");

        if (!empty($validated['bucket'])) {
            $query->whereRaw($this->bucketCase($column) . ' = ?', [$validated['bucket']]);
        }

        if (!empty($validated['status'])) {
            $query->where('repair_status_code', $validated['status']);
        }

        $orders = $query->orderByDesc('age_days')->limit(500)->get();

        return response()->json(['orders' => $orders], 200);
    }
}
