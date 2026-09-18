<?php

namespace App\Http\Controllers;

use App\Models\GigoLocation;
use App\Services\BusinessCentral;
use App\Services\GigoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GigoLocationController extends Controller
{
    protected $gigoService;
    protected $businessCentral;

    public function __construct(GigoService $gigoService)
    {
        $this->gigoService = $gigoService;
        $this->businessCentral = BusinessCentral::getInstance();
    }

    private function authorizeUser()
    {
        $user = Auth::guard('in-memory')->user();

        if (!in_array($user->Technician_Type, ['Team Leader', 'CSC', 'Admin'])) {
            abort(response()->json(['error' => 'Unauthorized.'], 401));
        }

        return $user;
    }

    public function index(Request $request)
    {
        $query = GigoLocation::where('is_active', true);

        if ($request->query('include') !== 'technician_basket') {
            $query->where('type', 'static');
        }

        return response()->json([
            'data' => $query->orderBy('name')->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $user = $this->authorizeUser();

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:gigo_locations,name',
            'code' => 'required|string|max:100|alpha_dash|unique:gigo_locations,code',
        ]);

        $location = GigoLocation::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'type' => 'static',
            'is_active' => true,
            'created_by' => $user->ID,
        ]);

        return response()->json([
            'message' => 'Location created successfully.',
            'data' => $location,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeUser();

        $location = GigoLocation::findOrFail($id);

        if ($location->type === 'technician_basket') {
            return response()->json(['error' => 'Technician baskets cannot be edited.'], 400);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:gigo_locations,name,' . $location->id,
            'is_active' => 'sometimes|boolean',
        ]);

        $location->update($validated);

        return response()->json([
            'message' => 'Location updated successfully.',
            'data' => $location,
        ], 200);
    }

    public function createTechnicianBaskets(Request $request)
    {
        $this->authorizeUser();

        $validated = $request->validate([
            'technician_ids' => 'required|array|min:1',
            'technician_ids.*' => 'required|string',
        ]);

        $technicianList = $this->businessCentral->technicianList();
        $created = [];
        $skipped = [];

        foreach ($validated['technician_ids'] as $technicianId) {
            $technician = $technicianList[$technicianId] ?? null;

            if (!$technician) {
                $skipped[] = $technicianId;
                continue;
            }

            $technicianName = trim(($technician['First_Name'] ?? '') . ' ' . ($technician['Last_Name'] ?? ''));
            $basket = $this->gigoService->getOrCreateTechnicianBasket($technician['ID'], $technicianName);
            $created[] = $basket;
        }

        return response()->json([
            'message' => count($created) . ' basket(s) ready' . (count($skipped) ? ', ' . count($skipped) . ' skipped (unknown technician).' : '.'),
            'data' => $created,
            'skipped' => $skipped,
        ], 200);
    }

    public function destroy($id)
    {
        $this->authorizeUser();

        $location = GigoLocation::findOrFail($id);

        if ($location->type === 'technician_basket') {
            return response()->json(['error' => 'Technician baskets cannot be disabled.'], 400);
        }

        $location->update(['is_active' => false]);

        return response()->json([
            'message' => 'Location disabled successfully.',
        ], 200);
    }
}
