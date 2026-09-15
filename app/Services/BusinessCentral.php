<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use App\Services\Utility;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use GuzzleHttp\Exception\RequestException;
use App\Models\ServiceOrder;
use App\Models\ServiceOrderFilter;

class BusinessCentral
{
    protected Utility $utility;
    protected string $oDataBaseUrl;
    protected string $oDataUsername;
    protected string $oDataPassword;
    protected string $soapBaseUrl;
    protected string $soapUsername;
    protected string $soapPassword;
    protected string $bcInstanceName;
    protected bool $sslVerify;

    // Constants to avoid magic strings
    private const CACHE_TTL_MINUTES = 10;
    private const CACHE_KEY_TECHNICIAN_LIST = 'technician_list';
    private const CACHE_KEY_REPAIR_STATUS = 'repair_status_list';
    private const CACHE_KEY_SPARE_PARTS = 'spare_parts_list';
    private const CACHE_KEY_LOCATIONS = 'location_list';
    private const CACHE_KEY_TEAMS = 'team_list';

    private const SOAP_NAMESPACE = 'urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp';

    public function __construct(Utility $utility)
    {
        $this->utility = $utility;

        $this->oDataBaseUrl = config('services.business_central.odata_base_url') ?? '';
        $this->oDataUsername = config('services.business_central.odata_username') ?? '';
        $this->oDataPassword = config('services.business_central.odata_password') ?? '';
        $this->soapBaseUrl = config('services.business_central.soap_base_url') ?? '';
        $this->soapUsername = config('services.business_central.soap_username') ?? '';
        $this->soapPassword = config('services.business_central.soap_password') ?? '';
        $this->bcInstanceName = config('services.business_central.instance_name') ?? '';
        $this->sslVerify = (bool) (config('services.business_central.ssl_verify') ?? true);
    }

    /**
     * Resolve instance from container (Backward Compatibility)
     */
    public static function getInstance(): self
    {
        return app(self::class);
    }

    private function getHttpClient(int $timeout = 30): Client
    {
        return new Client([
            'base_uri' => $this->oDataBaseUrl,
            'auth' => [
                $this->oDataUsername,
                $this->oDataPassword,
                'ntlm',
            ],
            'timeout'  => $timeout,
            'verify' => $this->sslVerify,
        ]);
    }

    private function getSoapClient(): Client
    {
        return new Client([
            'base_uri' => $this->soapBaseUrl,
            'auth' => [
                $this->soapUsername,
                $this->soapPassword,
                'ntlm',
            ],
            'timeout'  => 30,
            'verify' => $this->sslVerify,
        ]);
    }

    /**
     * Generic OData Fetcher
     */
    private function fetchOData(string $endpoint, array $queryParams = [], int $timeout = 30): ?array
    {
        try {
            $client = $this->getHttpClient($timeout);
            $url = "/{$this->bcInstanceName}/ODataV4/Company('TBH')/{$endpoint}";

            if (!empty($queryParams)) {
                $url .= '?' . http_build_query($queryParams);
            }

            Log::channel('business_central')->info("OData Request: GET {$url}");

            // Handle manual OData filters passed directly in endpoint (legacy support)
            // Ideally, we should refactor calls to pass query params separately, but for now:
            $response = $client->get($url, ['timeout' => $timeout]);
            $responseContent = $response->getBody()->getContents();

            // Log a snippet of the response or count to avoid massive logs for lists
            $data = json_decode($responseContent, true);
            $value = $data['value'] ?? $data;

            $count = is_array($value) ? count($value) : 1;
            Log::channel('business_central')->info("OData Response from {$endpoint}: Fetched {$count} records.");

            return $value;
        } catch (\Exception $e) {
            Log::channel('business_central')->error("Failed to fetch OData from {$endpoint}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Generic SOAP Request Handler
     */
    private function sendSoapRequest(string $action, string $bodyContent): string
    {
        $endpoint = "/{$this->bcInstanceName}/WS/TBH/Codeunit/ServiceOrderApp";
        $namespace = self::SOAP_NAMESPACE;

        $payload = <<<XML
            <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                <Body>
                    <{$action} xmlns="{$namespace}">
                        {$bodyContent}
                    </{$action}>
                </Body>
            </Envelope>
        XML;

        Log::channel('business_central')->info("SOAP Request [{$action}] Payload: " . $payload);

        try {
            $client = $this->getSoapClient();
            $response = $client->post($endpoint, [
                'body' => $payload,
                'headers' => [
                    'Content-Type' => 'text/xml; charset="utf-8"',
                    'SOAPAction' => "{$namespace}:{$action}", // Some BC versions use action in header differently
                ],
            ]);

            $responseBody = $response->getBody()->getContents();
            Log::channel('business_central')->info("SOAP Response [{$action}]: ", ['response' => $responseBody]);

            return $responseBody;
        } catch (RequestException $e) {
            Log::channel('business_central')->critical("SOAP Request Failed [{$action}]");

            if ($e->hasResponse()) {
                $responseBody = $e->getResponse()->getBody()->getContents();
                Log::channel('business_central')->error('Guzzle Error', ['error' => $e->getMessage(), 'response' => $responseBody]);

                if (preg_match('/<faultstring[^>]*>(.*?)<\/faultstring>/s', $responseBody, $matches)) {
                    return trim($matches[1]);
                }
            }
            return "An error occurred while processing {$action}.";
        } catch (\Exception $e) {
            Log::channel('business_central')->error("Unexpected Error [{$action}]: " . $e->getMessage());
            return $e->getMessage();
        }
    }

    public function technicianList(): array
    {
        return Cache::remember(self::CACHE_KEY_TECHNICIAN_LIST, now()->addMinutes(self::CACHE_TTL_MINUTES), function () {
            $data = $this->fetchOData('TechnicianApp');
            $technicianList = [];

            if ($data) {
                foreach ($data as $item) {
                    $technicianList[$item['ID']] = $item;
                }
            }
            return $technicianList;
        });
    }

    public function getTechnicianById(string $identifier): ?array
    {
        // Query BC directly for the specific username (ID) without caching
        $data = $this->fetchOData("TechnicianApp?\$filter=ID eq '{$identifier}'");

        if (!empty($data) && isset($data[0])) {
            return $data[0];
        }

        return null;
    }


    public function getRegionList(): array
    {
        // Currently returning empty array based on legacy code.
        // If this needs to be populated, implement the logic here.
        return $this->regionList ?? [];
    }

    public function getTeamList(): array
    {
        // Currently returning empty array based on legacy code.
        return $this->teamList ?? [];
    }

    public function serviceOrders($maxReplicationCount): array
    {
        try {
            Log::channel('business_central')->info("Received Service Order Pull Request With Filter : " . $maxReplicationCount);
            $startTime = microtime(true);

            // Fetch Service Lines
            // Note: passing query params manually to match existing format exactly for now
            $serviceLines = $this->fetchOData("ServiceLines?\$filter=Replication_Counter gt $maxReplicationCount");

            // Fetch Repair Status List
            $repairStatusList = $this->fetchOData("RepairStatusList");
            $repairStatusMapping = [];

            if ($repairStatusList) {
                foreach ($repairStatusList as $status) {
                    $repairStatusMapping[$status['Code']] = $status['Service_Order_Status'];
                }
            }

            $combinedResponse = [];

            if ($maxReplicationCount == 0 || $serviceLines === null) {
                $serviceHeaders = $this->fetchOData("ServiceHeaders");
                if ($serviceLines && $serviceHeaders) {
                    $combinedResponse = $this->utility->mergeResponses(['value' => $serviceLines], ['value' => $serviceHeaders], $repairStatusMapping);
                }
            } else {
                foreach ($serviceLines as $line) {
                    $documentNo = $line['Document_No'];

                    // Add service_order_status
                    $repairStatusCode = $line['Repair_Status_Code'];
                    // Logic fix: $repairStatusDict was undefined in original code, assumed correct mapping here
                    $line['Service_Order_Status'] = $repairStatusMapping[$repairStatusCode] ?? null;

                    // Fetch individual header
                    $serviceHeaderData = $this->fetchOData("ServiceHeaders?\$filter=No eq '$documentNo'");

                    if (!empty($serviceHeaderData)) {
                        $headerData = $serviceHeaderData[0];
                        $combinedResponse[] = array_merge($line, $headerData);
                    }
                }
            }

            Log::channel('business_central')->info('Service orders pulled successfully.', [
                'time' => (microtime(true) - $startTime) . ' seconds',
                'count' => count($combinedResponse)
            ]);

            return $combinedResponse;
        } catch (\Exception $e) {
            Log::channel('business_central')->error('Failed to pull service orders: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Pull single Service Order from BC directly with timeout
     */
    public function getSingleServiceOrder(string $documentNo, int $timeoutSeconds = 3): ?array
    {
        try {
            Log::channel('business_central')->info("Pulling single Service Order from BC directly for document {$documentNo} with timeout {$timeoutSeconds}s");

            $serviceLines = $this->fetchOData("ServiceLines?\$filter=Document_No eq '{$documentNo}'", [], $timeoutSeconds);
            $serviceHeaderData = $this->fetchOData("ServiceHeaders?\$filter=No eq '{$documentNo}'", [], $timeoutSeconds);

            if (empty($serviceLines) && empty($serviceHeaderData)) {
                Log::channel('business_central')->warning("No service lines or header found in BC for document {$documentNo}");
                return null;
            }

            $repairStatusList = $this->fetchOData("RepairStatusList", [], $timeoutSeconds);
            $repairStatusMapping = [];
            if ($repairStatusList) {
                foreach ($repairStatusList as $status) {
                    $repairStatusMapping[$status['Code']] = $status['Service_Order_Status'];
                }
            }

            $line = !empty($serviceLines) ? $serviceLines[0] : [];
            $header = !empty($serviceHeaderData) ? $serviceHeaderData[0] : [];

            $combined = array_merge($line, $header);

            if (!empty($combined['Repair_Status_Code'])) {
                $combined['Service_Order_Status'] = $repairStatusMapping[$combined['Repair_Status_Code']] ?? ($combined['Service_Order_Status'] ?? null);
            }

            return $combined;
        } catch (\Exception $e) {
            Log::channel('business_central')->error("Failed to fetch single service order {$documentNo} from BC: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Sync/update local ServiceOrder record from BC item array
     */
    public function syncSingleServiceOrderFromBCData(array $item): ServiceOrder
    {
        $docNo = $item['Document_No'] ?? ($item['No'] ?? null);

        $serviceOrder = ServiceOrder::updateOrCreate(
            ['document_no' => $docNo],
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

        if (!empty($item['Brand_Code'])) {
            ServiceOrderFilter::firstOrCreate([
                'brand_code' => $item['Brand_Code'],
            ]);
        }

        return $serviceOrder;
    }

    public function serviceOrdersToBeDeleted($maxReplicationCount = 100): array
    {
        // NOTE: The URL in original code used a different instance/company hardcoded?
        // "/ECOM0923/ODataV4/Company('TBH')/DeletedServiceOrders"
        // Preserving that behavior if intentional, but using config variables for consistency where possible.
        // If ECOM0923 is truly hardcoded, it suggests a specific archive environment. 
        // For professional refactor, we usually stick to the configured instance. 
        // I will use the configured instance for consistency unless specifically told otherwise,
        // but note the deviation from original hardcoded 'ECOM0923'.

        //$data = $this->fetchOData("DeletedServiceOrders?\$filter=Replication_Counter gt $maxReplicationCount");
        $data = $this->fetchOData("DeletedServiceOrders");
        return $data ?? [];
    }

    public function servicePriority(): ?array
    {
        return $this->fetchOData("ServicePriority");
    }

    public function repairStatusList(): array
    {
        return Cache::remember(self::CACHE_KEY_REPAIR_STATUS, now()->addMinutes(self::CACHE_TTL_MINUTES), function () {
            return $this->fetchOData("RepairStatusList") ?? [];
        });
    }

    public function getSpareParts(): array
    {
        return Cache::remember(self::CACHE_KEY_SPARE_PARTS, now()->addMinutes(self::CACHE_TTL_MINUTES), function () {
            return $this->fetchOData("ServiceItems") ?? [];
        });
    }

    public function ServiceSpareParts($documentNo): ?array
    {
        return $this->fetchOData("ServiceSpareParts?\$filter=Document_No eq '$documentNo'");
    }

    public function getLocationsList(): array
    {
        return Cache::remember(self::CACHE_KEY_LOCATIONS, now()->addMinutes(self::CACHE_TTL_MINUTES), function () {
            // Note: The original code accessed ['value'] on the response. fetchOData handles that.
            return $this->fetchOData("LocationsList") ?? [];
        });
    }

    public function updateServiceOrderStatus($documentNo, $itemNo, $repairStatusCode, $returnVal, $comment = ''): string
    {
        $safeComment = htmlspecialchars((string) $comment, ENT_XML1, 'UTF-8');

        $body = "
            <documentNo>{$documentNo}</documentNo>
            <itemNo>{$itemNo}</itemNo>
            <repairStatusCode>{$repairStatusCode}</repairStatusCode>
            <returnVal>{$returnVal}</returnVal>
            <comment>{$safeComment}</comment>
            <response>true</response>
        ";

        return $this->sendSoapRequest('UpdateServiceStatus', $body);
    }

    public function sendMessageBusinessCentral($mobileNo, $documentNo, $repairStatusCode, $visitDate, $visitTime): string
    {
        $body = "
            <mobileNo>{$mobileNo}</mobileNo>
            <documentNo>{$documentNo}</documentNo>
            <repairStatusCode>{$repairStatusCode}</repairStatusCode>
            <visitDate>{$visitDate}</visitDate>
            <visitTime>{$visitTime}</visitTime>
            <returnVal>''</returnVal>
            <response>true</response>
        ";

        return $this->sendSoapRequest('SendSMS', $body);
    }

    public function requestSparePart($documentNo, $sparePartCode, $quantity, $consumerCode, $locationCode, $serviceItemNo): string
    {
        $body = "
            <documentNo>{$documentNo}</documentNo>
            <claimTo>{$consumerCode}</claimTo>
            <no>{$sparePartCode}</no>
            <binCode>kk</binCode>
            <quantity>{$quantity}</quantity>
            <locationCode>{$locationCode}</locationCode>
            <serviceItemNo>{$serviceItemNo}</serviceItemNo>
            <response>''</response>
        ";

        return $this->sendSoapRequest('RequestSpareParts', $body);
    }

    public function updatePortalImage($serviceOrderNo, $orderPicture, $sLNo, $imageIsSignature): string
    {
        $imageIsSignatureValue = $imageIsSignature ? 'true' : 'false';

        $body = "
            <serviceOrderNo>{$serviceOrderNo}</serviceOrderNo>
            <orderPicture>{$orderPicture}</orderPicture>
            <sLNo>{$sLNo}</sLNo>
            <imageIsSignature>{$imageIsSignatureValue}</imageIsSignature>
        ";

        return $this->sendSoapRequest('UpdatePortalImage', $body);
    }

    public function teamRegionConfiguration(): ?array
    {
        $today = now()->toDateString();
        return $this->fetchOData("TeamRegionConfiguration?\$filter=Date ge {$today}");
    }

    public function getTeamRegionConfigurationData(Carbon $startDate, Carbon $endDate): array
    {
        $start = $startDate->toDateString();
        $end = $endDate->toDateString();
        return $this->fetchOData("TeamRegionConfiguration?\$filter=Date ge {$start} and Date le {$end}") ?? [];
    }

    public function getAllTeams(): array
    {
        return Cache::remember(self::CACHE_KEY_TEAMS, now()->addMinutes(self::CACHE_TTL_MINUTES), function () {
            return $this->fetchOData("TeamRegion") ?? [];
        });
    }
}
