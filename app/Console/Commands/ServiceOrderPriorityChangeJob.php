<?php

namespace App\Console\Commands;

use App\Services\Utility;
use Illuminate\Console\Command;
use App\Models\ServiceOrder;
use App\Models\AppSetting;
use Illuminate\Support\Facades\Log;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;



class ServiceOrderPriorityChangeJob extends Command
{
    // The name and signature of the console command.
    protected $signature = 'ServiceOrder:UpdatePriority';

    // The console command description.
    protected $description = 'Update service orders priority job';

    protected $service;
    protected $utility;

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        // Tiers are ordered by max_days ascending, with a final tier of
        // max_days=null meaning "older than every other tier". Configurable
        // via the Settings panel (AppSetting::current()->priority_tiers).
        $tiers = collect(AppSetting::current()->priority_tiers)
            ->sortBy(fn ($tier) => $tier['max_days'] ?? PHP_INT_MAX)
            ->values()
            ->all();

        try {
            Log::info("Starting priority update batch job");

            $serviceOrders = ServiceOrder::whereNot('service_order_status', 'Finished')
                ->get(['document_no', 'priority_weight', 'priority', 'created_at']);

            if ($serviceOrders->isEmpty()) {
              return response()->json([
                   'message' => 'No service orders found for the priority update job.',
                    'data' => [],
                ], 404);
            }

            $priorityUpdateSuccessCounter = 0;
            $priorityUpdateFailureCounter = 0;

            foreach ($serviceOrders as $serviceOrder) {
                $ageDays = $serviceOrder->created_at->diffInDays(Carbon::now());

                $matchedTier = collect($tiers)->first(fn ($tier) => $tier['max_days'] === null || $ageDays <= $tier['max_days'])
                    ?? end($tiers);

                $serviceOrder->priority_weight = $matchedTier['weight'];
                $serviceOrder->priority = $matchedTier['priority'];

                try {
                    $serviceOrder->save();
                    $priorityUpdateSuccessCounter = $priorityUpdateSuccessCounter + 1;

                } catch (\Exception $e) {
                    Log::error('Error in updating priprity of service order', [$serviceOrder,
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    $priorityUpdateFailureCounter = $priorityUpdateFailureCounter + 1;
                }
            }
            
            Log::info("Finished priority update job: successfully udated priority for {$priorityUpdateSuccessCounter} serviced. Failed to update priority for {$priorityUpdateFailureCounter} service orders");

        } catch (\Exception $e) {
            Log::error('Failed service order priroty update job.', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
