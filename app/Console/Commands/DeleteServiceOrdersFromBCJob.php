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

            DB::transaction(function () use ($formattedResponse, &$maxReplicationCount) {
                $documentNos = collect($formattedResponse)->pluck('No')->filter()->values();
                $deletedCount = 0;

                $documentNos->chunk(1000)->each(function ($chunk) use (&$deletedCount) {
                    Log::info('Attempting to delete ServiceOrders Chunk', $chunk->toArray());

                    $chunkDeleted = ServiceOrder::whereIn('document_no', $chunk)->delete();
                    $deletedCount += $chunkDeleted;
                    Log::info("Deleted {$chunkDeleted} rows in this chunk.");

                    $remaining = ServiceOrder::whereIn('document_no', $chunk)->get();
                    if ($remaining->isNotEmpty()) {
                        Log::warning('WARNING: The following Service Orders still exist in DB after delete attempt:', $remaining->pluck('document_no')->toArray());
                    } else {
                        Log::info('Verification Success: All records in this chunk were confirmed deleted.');
                    }
                });

                $maxReplicationCounterInResponse = collect($formattedResponse)->max('Replication_Counter');

                if ($maxReplicationCounterInResponse > $maxReplicationCount) {
                    $maxReplicationCount = $maxReplicationCounterInResponse;
                }
                Log::info("DeleteServiceOrdersFromBCJob@handle Service Orders deleted successfully: ", [
                    'count' => $deletedCount,
                ]);
            });

            // $this->utility->updateMaxReplicationCount($maxReplicationCount);
            Log::info("DeleteServiceOrdersFromBCJob@handle Service orders deleted successfully: Max Replication Counter :{[$maxReplicationCount]}");
        } catch (\Exception $e) {
            Log::error('DeleteServiceOrdersFromBCJob@handle Error deleting required service orders.', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
