<?php

namespace App\Console\Commands;

use App\Services\Utility;
use Illuminate\Console\Command;
use App\Models\ServiceOrder;
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
        $_0 = Carbon::now();
        $_7 = Carbon::now()->subDays(7);
        $_8 = Carbon::now()->subDays(8);
        $_14 = Carbon::now()->subDays(14);
        $_15 = Carbon::now()->subDays(15);
        $_21 = Carbon::now()->subDays(21);
        $_22 = Carbon::now()->subDays(22);
        $_30 = Carbon::now()->subDays(30);
        $_31 = Carbon::now()->subDays(31);
        $_60 = Carbon::now()->subDays(60);
        $_61 = Carbon::now()->subDays(61);
      
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

                if ($serviceOrder->created_at >= $_0 &&  $serviceOrder->created_at <= $_7) {    
                    $serviceOrder->priority_weight = 1;
                    $serviceOrder->priority = 'LOW';
                } else if ($serviceOrder->created_at > $_7 &&  $serviceOrder->created_at <= $_14) {
                    $serviceOrder->priority_weight = 2;
                    $serviceOrder->priority  = 'LOW';
                } else if ($serviceOrder->created_at > $_14 &&  $serviceOrder->created_at <= $_21) {
                    $serviceOrder->priority_weight = 3;
                    $serviceOrder->priority = 'MEDIUM';
                } else if ($serviceOrder->created_at > $_21 &&  $serviceOrder->created_at <= $_30) {
                    $serviceOrder->priority_weight = 4;
                    $serviceOrder->priority = 'MEDIUM';
                } else if ($serviceOrder->created_at > $_30 &&  $serviceOrder->created_at <= $_60) {
                    $serviceOrder->priority_weight = 5;
                   $serviceOrder->priority = 'HIGH';
                } else {
                    $serviceOrder->priority_weight = 6;
                    $serviceOrder->priority = 'HIGH';
                }

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
