<?php

namespace App\Http\Controllers;

use App\Services\BusinessCentral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class TechnicianController extends Controller
{
    private $businessCentral;

    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }


    public function getTechnicianList()
    {
        $user = Auth::guard('in-memory')->user();
        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            return response()->json(['error' => 'Forbidden. You do not have permission to view this list.'], 403);
        }
        $technicianList = $this->businessCentral->technicianList();

        $filteredTechnicians = array_filter($technicianList, function ($technician) {
            return isset($technician['Technician_Type']) && $technician['Technician_Type'] === 'Technician';
        });
        // Log::info("filteredTechnicians>", $filteredTechnicians);
        return response()->json($filteredTechnicians);
    }

    public function getTechnician($id)
    {
        $technicians = $this->businessCentral->technicianList();
        if (is_array($technicians) && isset($technicians[$id])) {
            $technician = $technicians[$id];
            return response()->json($technician);
        }

        // Return an error response if the technician is not found
        Log::warning("Technician with ID {$id} not found.");
        return response()->json(['message' => 'Technician not found'], 404);
    }

    public function getRegionList()
    {
        $user = Auth::guard('in-memory')->user();
        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            return response()->json(['error' => 'Forbidden. You do not have permission to view this list.'], 403);
        }
        $regionList = $this->businessCentral->getRegionList();
        return response()->json($regionList);
    }

    public function getTeamList()
    {
        $user = Auth::guard('in-memory')->user();
        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            return response()->json(['error' => 'Forbidden. You do not have permission to view this list.'], 403);
        }
        $teamList = $this->businessCentral->getTeamList();
        return response()->json($teamList);
    }

    public function getsparePartList()
    {
        $sparePartList = $this->businessCentral->getSpareParts();
        return response()->json(['value' => $sparePartList]);
    }

    public function getLocationList()
    {
        $locationList = $this->businessCentral->getLocationsList();
        return response()->json($locationList);
    }

    public function getStatuses(): JsonResponse
    {
        $statuses = collect(config('portal.technician_selectable_statuses'))
            ->map(fn ($desc, $code) => ['code' => $code, 'desc' => $desc])
            ->values();

        return response()->json($statuses);
    }
}
