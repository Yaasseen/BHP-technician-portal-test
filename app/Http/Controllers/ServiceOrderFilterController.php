<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceOrder;
use App\Models\ServiceOrderFilter;
use App\Services\BusinessCentral;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;



class ServiceOrderFilterController extends Controller
{

    private $businessCentral;

    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }


    public function getServiceRepairStatusCode()
    {
        $repairStatusCodes = ServiceOrder::query()
            ->select('repair_status_code')
            ->whereNotNull('repair_status_code')
            ->distinct()
            ->pluck('repair_status_code');

        return response()->json($repairStatusCodes);

    }


    public function getBrandCode()
    {
        $brandCodes = ServiceOrderFilter::query()
            ->select('brand_code')
            ->whereNotNull('brand_code')
            ->distinct()
            ->pluck('brand_code');

        return response()->json($brandCodes);
    }


    public function fetchTeams()
    {
        $allocatedTeams = $this->businessCentral->getAllTeams();

        $teamNames = array_column($allocatedTeams, 'Values');

        return response()->json($teamNames);
    }

    public function syncTeams()
    {
        $user = Auth::guard('in-memory')->user();

        if ($user->Technician_Type !== 'Admin') {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $allocatedTeams = $this->businessCentral->refreshTeamsCache();
        $teamNames = array_column($allocatedTeams, 'Values');

        return response()->json([
            'message' => count($teamNames) . ' team(s) synced from Business Central.',
            'data' => $teamNames,
        ]);
    }


    public function getStatuses(): JsonResponse
    {
        return response()->json(array_keys(config('portal.statuses')));
    }

}
