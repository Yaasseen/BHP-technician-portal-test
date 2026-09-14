<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AgeingController extends Controller
{
    private const BUCKET_CASE = "
        CASE
            WHEN DATEDIFF(NOW(), order_date) <= 3 THEN '0-3 days'
            WHEN DATEDIFF(NOW(), order_date) <= 7 THEN '4-7 days'
            WHEN DATEDIFF(NOW(), order_date) <= 14 THEN '8-14 days'
            WHEN DATEDIFF(NOW(), order_date) <= 30 THEN '15-30 days'
            ELSE '31+ days'
        END
    ";

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

    public function getSummary(Request $request)
    {
        $baseQuery = $this->scopedQuery();

        $byStatus = (clone $baseQuery)
            ->selectRaw('repair_status_code, ' . self::BUCKET_CASE . ' as bucket, COUNT(*) as count')
            ->groupBy('repair_status_code', 'bucket')
            ->get();

        $unassigned = (clone $baseQuery)
            ->whereNull('technician_id')
            ->selectRaw(self::BUCKET_CASE . ' as bucket, COUNT(*) as count')
            ->groupBy('bucket')
            ->get();

        return response()->json([
            'by_status' => $byStatus,
            'unassigned' => $unassigned,
            'total_open' => (clone $baseQuery)->count(),
            'total_unassigned' => (clone $baseQuery)->whereNull('technician_id')->count(),
        ], 200);
    }
}
