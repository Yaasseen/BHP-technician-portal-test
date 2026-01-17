<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\ServiceOrderReplicationCount;

class Utility
{
    /**
     * Merge service lines with service headers based on the Document_No.
     *
     * @param array $serviceLines
     * @param array $serviceHeaders
     * @return array
     */
    public function mergeResponses(array $serviceLines, array $serviceHeaders, array $repairStatusMapping): array
    {
        Log::info('Starting mergeResponses method.');

        $headersDict = [];
        foreach ($serviceHeaders['value'] as $header) {
            $headersDict[$header['No']] = $header;
        }

        Log::info('Headers dictionary prepared.', ['headersCount' => count($headersDict)]);

        $combinedResponse = [];
        foreach ($serviceLines['value'] as $line) {
            $documentNo = $line['Document_No'];
            if (isset($headersDict[$documentNo])) {
                $combinedEntry = array_merge($line, $headersDict[$documentNo]);
                $combinedResponse[] = $combinedEntry;


                // Add service_order_status
                $repairStatusCode = $line['Repair_Status_Code'] ?? null;
                $combinedEntry['Service_Order_Status'] = $repairStatusMapping[$repairStatusCode] ?? null;

                $combinedResponse[] = $combinedEntry;
            }
        }

        Log::info('Finished processing service lines.', ['combinedCount' => count($combinedResponse)]);

        return $combinedResponse;
    }

    /**
     * Get detailed response combining headers and lines, tracking extras and max replication count.
     *
     * @param array $serviceLines
     * @param array $serviceHeaders
     * @return array
     */
    public function getRespDetails(array $serviceLines, array $serviceHeaders): array
    {
        Log::info('Starting getRespDetails method.');

        $headersDict = [];
        foreach ($serviceHeaders['value'] as $header) {
            $headersDict[$header['No']] = $header;
        }

        $linesDict = [];
        foreach ($serviceLines['value'] as $line) {
            $linesDict[$line['Document_No']] = $line;
        }

        $combinedResponse = [];
        $serviceHeaderExtra = [];
        $serviceLinesExtra = [];

        foreach ($serviceLines['value'] as $line) {
            $documentNo = $line['Document_No'];
            if (isset($headersDict[$documentNo])) {
                $combinedEntry = array_merge($line, $headersDict[$documentNo]);
                $combinedResponse[] = $combinedEntry;

            } else {
                $serviceLinesExtra[] = $line;
            }
        }

        foreach ($serviceHeaders['value'] as $header) {
            if (!isset($linesDict[$header['No']])) {
                $serviceHeaderExtra[] = $header;
            }
        }

        Log::info('Finished merging data.', [
            'headersExtraCount' => count($serviceHeaderExtra),
            'linesExtraCount' => count($serviceLinesExtra)
        ]);

        Storage::put('ServiceHeaderExtra.json', json_encode($serviceHeaderExtra, JSON_PRETTY_PRINT));
        Storage::put('ServicelinesExtra.json', json_encode($serviceLinesExtra, JSON_PRETTY_PRINT));

        Log::info('Extra data written to JSON files in storage/app/.');

        return $combinedResponse;
    }

    /**
     * Retrieve the maximum replication count.
     *
     * @return int
     */
    public function getMaxReplicationCount(): int
    {
        Log::info('Retrieving max replication count.');

        $serviceOrderReplicationCount = ServiceOrderReplicationCount::first();

        if (!$serviceOrderReplicationCount) {
            Log::warning('Max replication count record not found. Initializing to -1.');
            $serviceOrderReplicationCount = ServiceOrderReplicationCount::create([
                'max_replication_count' => 0, 
            ]);
        }

        return $serviceOrderReplicationCount->max_replication_count;
    }

    /**
     * Update the maximum replication count if the new count is greater.
     *
     * @param int $newCount
     * @return bool
     */
    public function updateMaxReplicationCount(int $newCount): bool
    {
        Log::info('Updating max replication count.', ['newCount' => $newCount]);

        $serviceOrderReplicationCount = ServiceOrderReplicationCount::first();

        if (!$serviceOrderReplicationCount) {
            Log::warning('Max replication count record not found. Creating new record.');
            $serviceOrderReplicationCount = ServiceOrderReplicationCount::create([
                'max_replication_count' => $newCount,
            ]);
        } else {
            $serviceOrderReplicationCount->max_replication_count = $newCount;
            $serviceOrderReplicationCount->save();

            Log::info('Max replication count updated.', ['updatedCount' => $newCount]);
        }

        return true;
    }
}
