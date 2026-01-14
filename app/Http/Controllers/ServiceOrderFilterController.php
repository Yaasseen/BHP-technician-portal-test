<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceOrder;
use App\Models\ServiceOrderFilter;
use App\Services\BusinessCentral;
use Illuminate\Http\JsonResponse;



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


    public function getStatuses(): JsonResponse
    {
        return response()->json(
            ['PENDING', 'TECH-ASSN', 'RESCH-UNAVAI', 'RESCH-COMP', 'INPROGRESS', 'COMPLETED']
        );
    }

}
