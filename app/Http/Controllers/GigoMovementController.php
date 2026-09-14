<?php

namespace App\Http\Controllers;

use App\Models\GigoLocation;
use App\Models\ServiceOrder;
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

    private function resolveLocation(Request $request): GigoLocation
    {
        if ($request->filled('location_id')) {
            return GigoLocation::findOrFail((int) $request->input('location_id'));
        }

        return GigoLocation::where('code', $request->input('location_code'))
            ->where('is_active', true)
            ->firstOrFail();
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
            $location = $this->resolveLocation($request);
            $documentNo = $request->input('document_no');
            $order = ServiceOrder::where('document_no', $documentNo)->first();
            $moveType = ($location->code === 'GIGO' && $order && $order->status === 'COMPLETED')
                ? 'job_complete_return'
                : 'scan';

            $serviceOrder = $this->gigoService->moveToLocation(
                $documentNo,
                $location->id,
                $moveType,
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
            $location = $this->resolveLocation($request);
            $documentNos = $request->input('document_nos');
            $moveType = 'bulk_scan';

            if ($location->code === 'GIGO') {
                $allCompleted = ServiceOrder::whereIn('document_no', $documentNos)->count()
                    === ServiceOrder::whereIn('document_no', $documentNos)->where('status', 'COMPLETED')->count();
                if ($allCompleted) {
                    $moveType = 'job_complete_return';
                }
            }

            $moved = $this->gigoService->bulkMoveToLocation(
                $documentNos,
                $location->id,
                $moveType,
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

    public function acknowledge(Request $request)
    {
        $user = Auth::guard('in-memory')->user();

        $request->validate([
            'document_no' => 'required|string|exists:service_orders,document_no',
        ]);

        try {
            $serviceOrder = $this->gigoService->acknowledgeReceipt(
                $request->input('document_no'),
                $user->ID,
                trim($user->First_Name . ' ' . $user->Last_Name)
            );

            return response()->json([
                'message' => 'Receipt acknowledged.',
                'data' => $serviceOrder,
            ], 200);
        } catch (\App\Exceptions\GigoAcknowledgeException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            Log::error('Failed to acknowledge receipt.', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to acknowledge receipt.'], 500);
        }
    }

    public function returnToGigo(Request $request)
    {
        $user = Auth::guard('in-memory')->user();

        $request->validate([
            'document_no' => 'required|string|exists:service_orders,document_no',
        ]);

        try {
            $serviceOrder = $this->gigoService->returnToGigo(
                $request->input('document_no'),
                $user->ID,
                trim($user->First_Name . ' ' . $user->Last_Name)
            );

            return response()->json([
                'message' => 'Order returned to GIGO.',
                'data' => $serviceOrder,
            ], 200);
        } catch (\App\Exceptions\GigoAcknowledgeException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            Log::error('Failed to return service order to GIGO.', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to return order to GIGO.'], 500);
        }
    }

    public function myBasket(Request $request)
    {
        $user = Auth::guard('in-memory')->user();

        $basket = GigoLocation::where('code', 'TECH-' . $user->ID)->first();

        if (!$basket) {
            return response()->json(['pending' => [], 'acknowledged' => []], 200);
        }

        $orders = ServiceOrder::where('gigo_location_id', $basket->id)
            ->orderByDesc('gigo_location_updated_at')
            ->get();

        return response()->json([
            'pending' => $orders->where('gigo_pending_ack', true)->values(),
            'acknowledged' => $orders->where('gigo_pending_ack', false)->values(),
        ], 200);
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
