<?php

namespace App\Http\Controllers;
use App\Services\BusinessCentral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class RepairStatusController extends Controller
{   
    private $businessCentral;
    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }
    public function getRepairStatusList()
    {
        $repairCodes = $this->businessCentral->repairStatusList();
        return response()->json($repairCodes);
    }
}
