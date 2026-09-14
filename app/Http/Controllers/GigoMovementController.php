<?php

namespace App\Http\Controllers;

use App\Models\GigoLocation;
use App\Services\GigoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GigoMovementController extends Controller
{
    protected $gigoService;

    public function __construct(GigoService $gigoService)
    {
        $this->gigoService = $gigoService;
    }

    private function authorizeUser()
    {
        $user = Auth::guard('in-memory')->user();

        if ($user->Technician_Type !== 'Team Leader' && $user->Technician_Type !== 'CSC') {
            abort(response()->json(['error' => 'Unauthorized.'], 401));
        }

        return $user;
    }

    private function resolveLocationId(Request $request): int
    {
        if ($request->filled('location_id')) {
            return (int) $request->input('location_id');
        }

        $location = GigoLocation::where('code', $request->input('location_code'))
            ->where('is_active', true)
            ->firstOrFail();

        return $location->id;
    }

    public function scanSingle(Request $request)
    {
        $user = $this->authorizeUser();

        $request->validate([
            'document_no' => 'required|string|exists:service_orders,document_no',
            'location_id' => 'required_without:location_code|integer|exists:gigo_locations,id',
            'location_code' => 'required_without:location_id|string',
        ]);

        try {
            $locationId = $this->resolveLocationId($request);

            $serviceOrder = $this->gigoService->moveToLocation(
                $request->input('document_no'),
                $locationId,
                'scan',
                $user->ID,
                trim($user->First_Name . ' ' . $user->Last_Name)
            );

            return response()->json([
                'message' => 'Service order moved successfully.',
                'data' => $serviceOrder,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to scan-assign service order.', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to move service order.'], 500);
        }
    }

    public function scanBulk(Request $request)
    {
        $user = $this->authorizeUser();

        $request->validate([
            'document_nos' => 'required|array|min:1',
            'document_nos.*' => 'required|string|exists:service_orders,document_no',
            'location_id' => 'required_without:location_code|integer|exists:gigo_locations,id',
            'location_code' => 'required_without:location_id|string',
        ]);

        try {
            $locationId = $this->resolveLocationId($request);

            $moved = $this->gigoService->bulkMoveToLocation(
                $request->input('document_nos'),
                $locationId,
                'bulk_scan',
                $user->ID,
                trim($user->First_Name . ' ' . $user->Last_Name)
            );

            return response()->json([
                'message' => count($moved) . ' service order(s) moved successfully.',
                'data' => $moved,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to bulk scan-assign service orders.', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to move service orders.'], 500);
        }
    }

    public function history($document_no)
    {
        try {
            $history = $this->gigoService->getHistory($document_no);

            return response()->json(['data' => $history], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Service order not found.'], 404);
        }
    }

    public function locationContents($id)
    {
        try {
            $contents = $this->gigoService->getLocationContents((int) $id);

            return response()->json(['data' => $contents], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Location not found.'], 404);
        }
    }
}
