<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppSettingController extends Controller
{
    public function index()
    {
        return response()->json(['data' => AppSetting::current()], 200);
    }

    public function update(Request $request)
    {
        $user = Auth::guard('in-memory')->user();

        if ($user->Technician_Type !== 'Admin') {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $validated = $request->validate([
            'outdoor_daily_order_cap' => 'required|integer|min:1',
            'overdue_days_threshold' => 'required|integer|min:1',
            'priority_tiers' => 'required|array|min:1',
            'priority_tiers.*.max_days' => 'nullable|integer|min:1',
            'priority_tiers.*.weight' => 'required|integer|min:1',
            'priority_tiers.*.priority' => 'required|string',
        ]);

        $settings = AppSetting::current();
        $settings->update(array_merge($validated, ['updated_by' => $user->ID]));

        return response()->json([
            'message' => 'Settings updated successfully.',
            'data' => $settings->fresh(),
        ], 200);
    }
}
