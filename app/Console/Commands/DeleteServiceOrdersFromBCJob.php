<?php

namespace App\Console\Commands;

use App\Services\Utility;
use Illuminate\Console\Command;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\Log;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\DB; 


class DeleteServiceOrdersFromBCJob extends Command
{
    // The name and signature of the console command.
    protected $signature = 'serviceorders:delete';

    // The console command description.
    protected $description = 'Delete service orders from external API if found on database';

    protected $service;
    protected $utility;

    public function __construct()
    {
        parent::__construct();
        $this->service = BusinessCentral::getInstance();  
		$this->utility = new Utility();		
    }

    public function handle()
    {
		Log::info("DeleteServiceOrdersFromBCJob@handle Job Started");
        try {
			
			$maxReplicationCount = $this->utility->getMaxReplicationCount();

            $serviceResponse = $this->service->serviceOrdersToBeDeleted($maxReplicationCount);

            if (empty($serviceResponse)) {
                Log::warning('DeleteServiceOrdersFromBCJob@handle No service orders fetched.');
                return;
            }
			
			Log::info("Getting the formatted records");
			$formattedResponse = $serviceResponse;
			
			DB::transaction(function() use ($formattedResponse) {
				$documentNos = collect($formattedResponse)->pluck('No');
				$deletedCount = 0;
				
				$documentNos->chunk(1000)->each(function ($chunk) use (&$deletedCount) {
					$deletedCount += ServiceOrder::whereIn('document_no', $chunk)->delete();
				});
				
				foreach ($formattedResponse as $item) {
					$deletedCount += ServiceOrder::where('document_no', $item['No'])->delete();

					$newCount = $item['Replication_Counter'];
					if ($newCount > $maxReplicationCount) {
						$maxReplicationCount = $newCount;
					}
				}
				 Log::info("DeleteServiceOrdersFromBCJob@handle Service Orders deleted successfully: ", [
					'count' => $deletedCount,
				 ]);
			});
			
			$this->utility->updateMaxReplicationCount($maxReplicationCount);
			Log::info("DeleteServiceOrdersFromBCJob@handle Service orders deleted successfully: Max Replication Counter :{[$maxReplicationCount]}");

        } catch (\Exception $e) {
            Log::error('DeleteServiceOrdersFromBCJob@handle Error deleting required service orders.', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
