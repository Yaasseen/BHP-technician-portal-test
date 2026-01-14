<?php

namespace App\Console\Commands;

use App\Services\Utility;
use Illuminate\Console\Command;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\Log;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\DB; 


class SyncServiceOrdersFromBCJob extends Command
{
    // The name and signature of the console command.
    protected $signature = 'serviceorders:sync';

    // The console command description.
    protected $description = 'Sync service orders from external API and update or create in the database';

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
        try {
            $maxReplicationCount = $this->utility->getMaxReplicationCount();

            $serviceResponse = $this->service->serviceOrders($maxReplicationCount);

            if (empty($serviceResponse)) {
                Log::warning('No service orders fetched.');
                return;
            }


            DB::transaction(function () use ($serviceResponse, &$maxReplicationCount) {
                $createdCount = 0;
                $updatedCount = 0;

                foreach ($serviceResponse as $item) {
                    $serviceOrder = ServiceOrder::updateOrCreate(
                        ['document_no' => $item['Document_No']],
                        [
                            'gspn_no' => $item['GSPN_Number'] ?? null,
                            'order_date' => $item['Order_Date'] ?? null,
                            'name' => $item['Name'] ?? null,
                            'address' => $item['Address'] ?? null,
                            'address_2' => $item['Address_2'] ?? null,
                            'city' => $item['City'] ?? null,
                            'phone_no' => $item['Phone_No'] ?? null,
                            'warranty_type' => $item['Warranty_Type'] ?? null,
                            'remarks' => $item['Remarks'] ?? null,
                            'item_no' => $item['Item_No'] ?? null,
                            'description' => $item['Description'] ?? null,
                            'serial_no' => $item['Serial_No'] ?? null,
                            'repair_status_code' => $item['Repair_Status_Code'] ?? null,
                            'document_type' => $item['Document_Type'] ?? null,
                            'service_order_type' => $item['Service_Order_Type'] ?? null,
                            'line_no' => $item['Line_No'] ?? null,
                            'actual_purchase_date' => $item['Actual_Purchase_Date'] ?? null,
                            'shortcut_dimension_1_code' => $item['Shortcut_Dimension_1_Code'] ?? null,
                            'replication_counter' => $item['Replication_Counter'] ?? null,
                            'service_order_status' => $item['Service_Order_Status'] ?? null,
                            'service_item_no' => $item['Service_Item_No'] ?? null,
                            'service_item_group_code' => $item['Service_Item_Group_Code'] ?? null,
                            'brand_code' => $item['Brand_Code'] ?? null,
                            'mobile_no' => $item['Mobile_No'] ?? null,
                            'customer_no' => $item['Customer_No'] ?? null,
                        ]
                    );

                    // Add brand_code to ServiceOrderFilter without duplication
                    if (!empty($item['Brand_Code'])) {
                        \App\Models\ServiceOrderFilter::firstOrCreate([
                            'brand_code' => $item['Brand_Code'],
                        ]);
                    }

                    $newCount = $item['Replication_Counter'];
                    if ($newCount > $maxReplicationCount) {
                        $maxReplicationCount = $newCount;
                    }

                    $serviceOrder->wasRecentlyCreated ? $createdCount++ : $updatedCount++;
                }

                $this->utility->updateMaxReplicationCount($maxReplicationCount);

                Log::info("Service orders synced successfully: {$createdCount} created, {$updatedCount} updated. and Max Replication Counter :{[$maxReplicationCount]}");
            });

        } catch (\Exception $e) {
            Log::error('Error syncing service orders.', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
