<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\TechnicianController;




class CacheTechniciansData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cache-technicians-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    
    /**
     * The BusinessCentral instance.
     *
     */
    protected $apiService;
    protected $technicianController;

    /**
     * Create a new command instance.
     *
     */
    public function __construct(TechnicianController $technicianController)
    {
        parent::__construct();
        $this->apiService = BusinessCentral::getInstance();
        $this->technicianController = $technicianController;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */


    public function handle()
    {
        $data = $this->apiService->technicianList();
        // $data = $this->apiService->getSpareParts();
        // $data = $this->apiService->technicianList;
        // $data = $this->apiService->serviceOrders();
        // $data = $this->apiService->servicePriority();
        // $data = $this->apiService->repairStatusList();
        // $data = $this->apiService->getLocationsList();
        $data = $this->technicianController->getTechnician('103');
        $documentNo = 'CW00016813';
        $itemNo = 'WA11T5260BY/NQ';
        $repairStatusCode = 'ACKNOWLDG';
        $returnVal = '101';
        $response = True;
        // $data = $this->apiService->updateServiceOrderStatus($documentNo, $itemNo, $repairStatusCode, $returnVal, $response);

        // if (isset($data['status']) && $data['status'] == 'failed') {

        //     Log::error('Failed to fetch technician data: ' . $data['message']);
        // }

        // Cache::put('technicians', $data, 3600);

        print_r($data);
        Log::debug($data);
        // $values = $data['value'];
        // print_r($values); 
    }
}
