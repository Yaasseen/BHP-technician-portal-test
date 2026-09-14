<?php

namespace App\Console\Commands;

use App\Services\Utility;
use Illuminate\Console\Command;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\Log;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\DB;


class FlagPostedServiceOrdersFromBCJob extends Command
{
    // The name and signature of the console command.
    protected $signature = 'serviceorders:flag-posted';

    // The console command description.
    protected $description = 'Flag service orders as posted when Business Central reports them as archived/posted';

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
		Log::info("FlagPostedServiceOrdersFromBCJob@handle Job Started");
        try {

			$maxReplicationCount = $this->utility->getMaxReplicationCount();

            $serviceResponse = $this->service->serviceOrdersToBeDeleted($maxReplicationCount);

            if (empty($serviceResponse)) {
                Log::warning('FlagPostedServiceOrdersFromBCJob@handle No service orders fetched.');
                return;
            }

			Log::info("Getting the formatted records");
			$formattedResponse = $serviceResponse;

			DB::transaction(function() use ($formattedResponse) {
				$documentNos = collect($formattedResponse)->pluck('No');
				$flaggedCount = 0;

				$documentNos->chunk(1000)->each(function ($chunk) use (&$flaggedCount) {
					$flaggedCount += ServiceOrder::whereIn('document_no', $chunk)->update([
						'is_posted' => true,
						'posted_at' => now(),
					]);
				});

				foreach ($formattedResponse as $item) {
					$newCount = $item['Replication_Counter'];
					if ($newCount > $maxReplicationCount) {
						$maxReplicationCount = $newCount;
					}
				}
				 Log::info("FlagPostedServiceOrdersFromBCJob@handle Service Orders flagged as posted successfully: ", [
					'count' => $flaggedCount,
				 ]);
			});

			$this->utility->updateMaxReplicationCount($maxReplicationCount);
			Log::info("FlagPostedServiceOrdersFromBCJob@handle Service orders flagged as posted successfully: Max Replication Counter :{[$maxReplicationCount]}");

        } catch (\Exception $e) {
            Log::error('FlagPostedServiceOrdersFromBCJob@handle Error flagging posted service orders.', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
