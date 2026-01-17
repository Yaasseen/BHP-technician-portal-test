<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use App\Services\Utility;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use DateTime;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;


//require 'vendor/autoload.php';

class BusinessCentral
{
    private static $instance = null;
    public $technicianList;
    public $regionList;
    public $teamList;
    public $sparePartList;
    protected $technicianListRefreshTime;
    protected $utility;
    protected $oDataBaseUrl;
    protected $oDataUsername;
    protected $oDataPassword;
    protected $soapBaseUrl;
    protected $soapUsername;
    protected $soapPassword;
    protected $username;
    protected $password;
    protected $bcInstanceName;

    private function __construct()
    {
        $this->oDataBaseUrl = env("ODATA_BASE_URL");
        $this->oDataUsername = env("ODATA_USER_NAME");
        $this->oDataPassword = env("ODATA_PASSWORD");
        $this->soapBaseUrl = env("SOAP_BASE_URL");
        $this->soapUsername = env("SOAP_USER_NAME");
        $this->soapPassword = env("SOAP_PASSWORD");
        $this->bcInstanceName = env("BC_INSTANCE_NAME", "bc270");
       

        $this->technicianList = [];
        $this->regionList = [];
        $this->teamList = [];
        $this->sparePartList = [];
        $this->technicianListRefreshTime = 0;
        $this->utility = new Utility();
    }
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new BusinessCentral();
        }
        return self::$instance;
    }

    private function createHttpClient(): Client
    {
        // Log::info("BC http URL : ", [$this->oDataBaseUrl]);
        return new Client([
            'base_uri' => $this->oDataBaseUrl,
            'auth' => [
                $this->oDataUsername,
                $this->oDataPassword,
                'ntlm',
            ],
        ]);
    }
    private function createSoapClient(): Client
    {
        // Log::info("BC soap URL : ", [$this->soapBaseUrl]);
        
        return new Client([
            'base_uri' => $this->soapBaseUrl,
            'auth' => [
                $this->soapUsername,
                $this->soapPassword,
                'ntlm',
            ],
        ]);
    }

    public function technicianList()
    {
        try {
            // Log::info("Received Technician Get Request");

            if ((time() - $this->technicianListRefreshTime) > 20) {

                $client = $this->createHttpClient();
                $technicianResponse = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/TechnicianApp");
                // $teamRegResponse = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/ServiceTeamRegProdMatrix");

                $technicianData = $technicianResponse->getBody()->getContents();
                $technicianData = json_decode($technicianData, true);

                $this->technicianListRefreshTime = time();
                foreach ($technicianData['value'] as $item) {
                    $this->technicianList[$item['ID']] = $item;
                }

                // $teamData = $teamRegResponse->getBody()->getContents();
                // $teamData = json_decode($teamData, true);

                // foreach ($teamData['value'] as $item) {
                //     if (isset($item['Region'])) {
                //         // Log::info(">>", [$item]);
                //         if (!in_array($item['Region'], $this->regionList)) {
                //             $this->regionList[] = $item['Region'];
                //         }
                //     }
                //     if (isset($item['Team'])) {
                //         if (!in_array($item['Team'], $this->teamList)) {
                //             $this->teamList[] = $item['Team'];
                //         }
                //     }
                // }

                // foreach ($teamData['value'] as $teamItem) {
                //     if (isset($this->technicianList[$teamItem['Technician']])) {
                //         $technician = &$this->technicianList[$teamItem['Technician']];

                //         if (!isset($technician['Team'])) {
                //             $technician['Team'] = [];
                //         }
                //         if (!isset($technician['Region'])) {
                //             $technician['Region'] = [];
                //         }
                //         if (!isset($technician['Product'])) {
                //             $technician['Product'] = [];
                //         }

                //         if (!in_array($teamItem['Team'], $technician['Team'])) {
                //             $technician['Team'][] = $teamItem['Team'];
                //         }

                //         if (!in_array($teamItem['Region'], $technician['Region'])) {
                //             $technician['Region'][] = $teamItem['Region'];
                //         }

                //         if (!in_array($teamItem['Product'], $technician['Product'])) {
                //             $technician['Product'][] = $teamItem['Product'];
                //         }

                //     } else {
                //         $this->technicianList[$teamItem['Technician']] = [
                //             'Team' => [$teamItem['Team']],
                //             'Region' => [$teamItem['Region']],
                //             'Product' => [$teamItem['Product']]
                //         ];
                //     }
                // }
                // Log::info("Pulled technicial list from BC is ", $this->technicianList);
            }

            return $this->technicianList;


        } catch (\Exception $e) {
            Log::error('Failed to pull technician list: ' . $e->getMessage());
            return $this->technicianList;
    
        }
           
    }


    public function getRegionList()
    {
        Log::info("Get Region List Request");
        return $this->regionList;
    }

    // public function getRegionList(): array

    // {
    //     $client = $this->createHttpClient();
    //     $teamRegResponse = $client->get("/bc270/ODataV4/Company('TBH')/TeamRegionConfiguration");
    //     $teamData = $teamRegResponse->getBody()->getContents();
    //     $teamData = json_decode($teamData, true);

    //     $regionList = [];

    //     // foreach ($teamData['value'] as $item) {
    //     //     foreach ($item as $key => $value) {
    //     //         if (strpos($key, 'R_') === 0 && $value) {
    //     //             if (!in_array($key, $regionList)) {
    //     //                 $regionList[] = $key;
    //     //             }
    //     //         }
    //     //     }
    //     // }
    //     foreach ($teamData['value'] as $item) {
    //         foreach ($item as $key => $value) {
    //             if (strpos($key, 'R_') === 0 && $value) {
    //                 $regionName = substr($key, 2); // Remove "R_" prefix
    //                 if (!in_array($regionName, $regionList)) {
    //                     $regionList[] = $regionName;
    //                 }
    //             }
    //         }
    //     }

    //     return $regionList;
    // }

    public function getTeamList()
    {
        Log::info("Get Team List Request");
        return $this->teamList;
    }

    // public function getTeamList(): array
    // {
    //     $client = $this->createHttpClient();
    //     $teamRegResponse = $client->get("/bc270/ODataV4/Company('TBH')/TeamRegionConfiguration");
    //     $teamData = $teamRegResponse->getBody()->getContents();
    //     $teamData = json_decode($teamData, true);

    //     $teamList = [];
    //     foreach ($teamData['value'] as $item) {
    //         if (isset($item['Team']) && !in_array($item['Team'], $teamList)) {
    //             $teamList[] = $item['Team'];
    //         }
    //     }

    //     return $teamList;
    // }

    
    public function serviceOrders($maxReplicationCount)
    {
        try {
            Log::info("Received Service Order Pull Request With Filter : " . $maxReplicationCount);
            $client = $this->createHttpClient();
            $startTime = microtime(true);

            $serviceLineUrl = "/{$this->bcInstanceName}/ODataV4/Company('TBH')/ServiceLines?\$filter=Replication_Counter gt $maxReplicationCount";
            $serviceLineResponse = $client->get($serviceLineUrl);
            $serviceLines = json_decode($serviceLineResponse->getBody()->getContents(), true);

            // Fetch Repair Status List
            $repairStatusUrl = "/{$this->bcInstanceName}/ODataV4/Company('TBH')/RepairStatusList";
            $repairStatusResponse = $client->get($repairStatusUrl);
            $repairStatusList = json_decode($repairStatusResponse->getBody()->getContents(), true);

            // Prepare mapping for Repair Status Code to Service Order Status
            $repairStatusMapping = [];
            foreach ($repairStatusList['value'] as $status) {
                $repairStatusMapping[$status['Code']] = $status['Service_Order_Status'];
            }

            $combinedResponse = [];

            if ($maxReplicationCount == 0) {
                $serviceHeaderUrl = "/{$this->bcInstanceName}/ODataV4/Company('TBH')/ServiceHeaders";
                $serviceHeaderResponse = $client->get($serviceHeaderUrl);
                $serviceHeaders = json_decode($serviceHeaderResponse->getBody()->getContents(), true);

                
                $combinedResponse = $this->utility->mergeResponses($serviceLines, $serviceHeaders, $repairStatusMapping); 
            } else {

                foreach ($serviceLines['value'] as $line) {
                    $documentNo = $line['Document_No'];

                    // Add service_order_status based on repair_status_code
                    $repairStatusCode = $line['Repair_Status_Code'];
                    $line['Service_Order_Status'] = $repairStatusDict[$repairStatusCode] ?? null;
    
                    $serviceHeaderUrl = "/{$this->bcInstanceName}/ODataV4/Company('TBH')/ServiceHeaders?\$filter=No eq '$documentNo'";
                    $serviceHeaderResponse = $client->get($serviceHeaderUrl);
                    $serviceHeader = json_decode($serviceHeaderResponse->getBody()->getContents(), true);
                    if (!empty($serviceHeader['value'])) {
                        $headerData = $serviceHeader['value'][0];
                        $combinedEntry = array_merge($line, $headerData);
                        $combinedResponse[] = $combinedEntry;
                    }
                }
            }

            $requestTime = microtime(true) - $startTime;

            Log::info('Service orders pulled successfully.', [
                'it took ' => $requestTime . ' seconds',
                ' to pull ' => count($combinedResponse), ' records'
            ]);

            return $combinedResponse;

        } catch (\Exception $e) {
            Log::error('Failed to pull service orders', [
                'error_message' => $e->getMessage(),
            ]);
        }
    }
public function serviceOrdersToBeDeleted($maxReplicationCount = 100)
	{
		try {
            Log::info("Received Service Order Pull Request With Filter : " . $maxReplicationCount);
            $client = $this->createHttpClient();
            $startTime = microtime(true);

            $serviceLineUrl = "/ECOM0923/ODataV4/Company('TBH')/ServiceOrderArchived?\$filter=Replication_Counter gt $maxReplicationCount";
			// $serviceLineUrl = "/ECOM0923/ODataV4/Company('TBH')/ServiceOrderArchived";
            $serviceLineResponse = $client->get($serviceLineUrl);
            $serviceLines = json_decode($serviceLineResponse->getBody()->getContents(), true);

            $requestTime = microtime(true) - $startTime;

            Log::info('Service orders pulled successfully.', [
                'it took ' => $requestTime . ' seconds',
                ' to pull ' => count($serviceLines), ' records'
            ]);

            return $serviceLines;

        } catch (\Exception $e) {
            Log::error('Failed to pull service orders', [
                'error_message' => $e->getMessage(),
            ]);
        }
	}

    /// get Service Priority
    public function servicePriority()
    {
        Log::info("Received Service Priority Pull Request");
        try {
            $client = $this->createHttpClient();

            $startTime = microtime(true);

            $response = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/ServicePriority");

            $requestTime = microtime(true) - $startTime;


            $servicePriorityResponse = json_decode($response->getBody()->getContents(), true);


            Log::info('Service Priority pull successfully', [
                'request_time' => $requestTime . ' seconds',
            ]);


            return $servicePriorityResponse;


        } catch (\Exception $e) {
            Log::critical('Failed to pull Service Priority', [
                'message' => $e->getMessage(),
            ]);
        }

    }
    /// get Repair Status List
    public function repairStatusList()
    {
        Log::info("Received Repair Status Pull Request");

        try {
            $cacheKey = 'repair_status_list';

            // Check if data exists in cache
            if (Cache::has($cacheKey)) {
                Log::info("Fetching Repair Status List from Cache");
                return Cache::get($cacheKey);
            }

            $client = $this->createHttpClient();
            $startTime = microtime(true);
            $response = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/RepairStatusList");
            $requestTime = microtime(true) - $startTime;

            $serviceRepairResponse = json_decode($response->getBody()->getContents(), true);

            // Store data in cache for 10 minutes
            Cache::put($cacheKey, $serviceRepairResponse, now()->addMinutes(10));

            Log::info('Repair Status pull fetched successfully', [
                'request_time' => $requestTime . ' seconds',
            ]);

            return $serviceRepairResponse;

        } catch (\Exception $e) {
            Log::critical('Failed to pull Repair Status List', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to fetch Repair Status List'], 500);
        }
    }

    // Get Spare Parts
    public function getSpareParts()
    {
        try {
            // Check if the data is already cached
            if (Cache::has('spare_parts_list')) {
                Log::info("Spare Parts List from Cache.");
                return Cache::get('spare_parts_list');
            }

            $client = $this->createHttpClient();

            $startTime = microtime(true);
            $response = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/ServiceItems");

            $requestTime = microtime(true) - $startTime;

            $sparePartsResponse = json_decode($response->getBody()->getContents(), true);

            // Store response in cache for 10 minutes
            Cache::put('spare_parts_list', $sparePartsResponse, now()->addMinutes(10));

            Log::info('Spare Parts fetched successfully', [
                'request_time' => $requestTime . ' seconds',
            ]);

            return $sparePartsResponse;
        } catch (\Exception $e) {
            Log::critical('Unexpected error fetching Spare Parts List', [
                'message' => $e->getMessage(),
            ]);
        }
    }
    // Get ServiceSpareParts
    public function ServiceSpareParts($documentNo)
    {
        try {
            $client = $this->createHttpClient();

            $startTime = microtime(true);

            // Use OData filter for Document_No
            $response = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/ServiceSpareParts?\$filter=Document_No eq '$documentNo'");

            $requestTime = microtime(true) - $startTime;

            $sparePartsResponse = json_decode($response->getBody()->getContents(), true);

            Log::info('Service Spare Parts fetched successfully', [
                'request_time' => $requestTime . ' seconds',
                'document_no' => $documentNo,
            ]);

            return $sparePartsResponse['value'];
        } catch (\Exception $e) {
            Log::error('Unexpected error fetching Service Spare Parts List', [
                'message' => $e->getMessage(),
                'document_no' => $documentNo,
            ]);
            return null; // Returning null to indicate failure
        }
    }

    public function getLocationsList()
    {
        try {
            // Check if the data is already cached
            if (Cache::has('location_list')) {
                Log::info("Location List from Cache.");
                return Cache::get('location_list');
            }

            $client = $this->createHttpClient();

            $startTime = microtime(true);
            $response = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/LocationsList");

            $requestTime = microtime(true) - $startTime;

            $locationListResponse = json_decode($response->getBody()->getContents(), true);

            // Store response in cache for 10 minutes
            Cache::put('location_list', $locationListResponse['value'], now()->addMinutes(10));

            Log::info('Location List fetched successfully', [
                'request_time' => $requestTime . ' seconds',
            ]);

            return $locationListResponse['value'];
        } catch (\Exception $e) {
            Log::critical('Unexpected error fetching Location List', [
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function updateServiceOrderStatus($documentNo, $itemNo, $repairStatusCode, $returnVal)
    {
        $endpoint = "/{$this->bcInstanceName}/WS/TBH/Codeunit/ServiceOrderApp";
        $payload = <<<XML
            <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                <Body>
                    <UpdateServiceStatus xmlns="urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp">
                        <documentNo>{$documentNo}</documentNo>
                        <itemNo>{$itemNo}</itemNo>
                        <repairStatusCode>{$repairStatusCode}</repairStatusCode>
                        <returnVal>{$returnVal}</returnVal>
                        <response>true</response>
                    </UpdateServiceStatus>
                </Body>
            </Envelope>
            XML;
        Log::info("Repair Status Code Request Payload: " . $payload);
        try {

            $client = $this->createSoapClient();
            $response = $client->post($endpoint, [
                'body' => $payload,
                'headers' => [
                    'Content-Type' => 'text/xml; charset="utf-8"',
                    'SOAPAction' => "urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp/UpdateServiceStatus",
                ],
            ]);
            $responseBody = $response->getBody()->getContents();
            
            Log::info("Repair Status Code Request Response", [
                'response' => $responseBody
            ]);
            Log::info("Repair Status Code updated successfully On Business Central.");
            return $responseBody;
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            Log::critical('Unexpected error updating Service Order Status');

        // Extract response body from exception
            if ($e->hasResponse()) {
                $responseBody = $e->getResponse()->getBody()->getContents();
                Log::error('Guzzle Error', ['error' => $e->getMessage(), 'response' => $responseBody]);

                // Extract the faultstring message
                if (preg_match('/<faultstring[^>]*>(.*?)<\/faultstring>/s', $responseBody, $matches)) {
                    $errorMessage = trim($matches[1]);
                    return $errorMessage; // Return the extracted error message instead of throwing
                }
            }

            return "An error occurred while updating the service order status.";
        }

    }


    public function sendMassageBusinessCentral($mobileNo, $documentNo, $repairStatusCode, $visitDate, $visitTime)
    {
        $endpoint = "/{$this->bcInstanceName}/WS/TBH/Codeunit/ServiceOrderApp";

        $payload = <<<XML
            <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                <Body>
                    <SendSMS xmlns="urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp">
                        <mobileNo>{$mobileNo}</mobileNo>
                        <documentNo>{$documentNo}</documentNo>
                        <repairStatusCode>{$repairStatusCode}</repairStatusCode>
                        <visitDate>{$visitDate}</visitDate>
                        <visitTime>{$visitTime}</visitTime>
                        <returnVal>''</returnVal>
                        <response>true</response>
                    </SendSMS>
                </Body>
            </Envelope>
            XML;
        try {
            Log::info("Sending SMS to Business Central", [
                'mobileNo' => $mobileNo,
                'documentNo' => $documentNo,
                'repairStatusCode' => $repairStatusCode,
                'visitDate' => $visitDate,
                'visitTime' => $visitTime,
            ]);
            $client = $this->createSoapClient();
            $response = $client->post($endpoint, [
                'body' => $payload,
                'headers' => [
                    'Content-Type' => 'text/xml; charset="utf-8"',
                    'SOAPAction' => "urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp/SendSMS",
                ],
            ]);
            $responseBody = $response->getBody()->getContents();
            
            Log::info("Massage Request Response", [
                'response' => $responseBody
            ]);
            Log::info("Massage Send successfully to Bussiness Central.");
            return $responseBody;

        } catch (\Exception $e) {
            Log::error("Response", [$e]);
            return $e->getMessage();
        }
    }

    
    public function requestSparePart($documentNo, $sparePartCode, $quantity, $consumerCode, $locationCode, $serviceItemNo)
    {
        $endpoint = "/{$this->bcInstanceName}/WS/TBH/Codeunit/ServiceOrderApp";

        $payload = <<<XML
        <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
            <Body>
                <RequestSpareParts xmlns="urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp">
                    <documentNo>{$documentNo}</documentNo>
                    <claimTo>{$consumerCode}</claimTo>
                    <no>{$sparePartCode}</no>
                    <binCode>kk</binCode>
                    <quantity>{$quantity}</quantity>
                    <locationCode>{$locationCode}</locationCode>
                    <serviceItemNo>{$serviceItemNo}</serviceItemNo>
                    <response>''</response>
                </RequestSpareParts>
            </Body>
        </Envelope>
        XML;

        try {
            Log::info("Sending Spare Part Request to Business Central", [
                'payload' => $payload
            ]);

            $client =  $this->createSoapClient();
            $response = $client->post($endpoint, [
                'body'    => $payload,
                'headers' => [
                    'Content-Type' => 'text/xml; charset="utf-8"',
                    'SOAPAction'   => "urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp",
                ],
            ]);

            $responseBody = $response->getBody()->getContents();
            
            Log::info("Spare Part Request Response", [
                'response' => $responseBody
            ]);
            Log::info("Spare Part Request sent successfully to Business Central.");
            return $responseBody;
            
        } catch (\Exception $e) {
            Log::error("Error in Spare Part Request", ['error' => $e->getMessage()]);
            return $e->getMessage();
        }
    }


    function updatePortalImage($serviceOrderNo, $orderPicture, $sLNo, $imageIsSignature)
    {
        $endpoint = "/{$this->bcInstanceName}/WS/TBH/Codeunit/ServiceOrderApp";
        $imageIsSignatureValue = $imageIsSignature ? 'true' : 'false'; // Ensure proper boolean value
        $payload = <<<XML
            <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                <Body>
                    <UpdatePortalImage xmlns="urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp">
                        <serviceOrderNo>{$serviceOrderNo}</serviceOrderNo>
                        <orderPicture>{$orderPicture}</orderPicture>
                        <sLNo>{$sLNo}</sLNo>
                        <imageIsSignature>{$imageIsSignatureValue}</imageIsSignature>
                    </UpdatePortalImage>
                </Body>
            </Envelope>
        XML;

        Log::info("SOAP Request: " . $payload);

        try {
            $client = $this->createSoapClient();
            $response = $client->post($endpoint, [
                'body' => $payload,
                'headers' => [
                    'Content-Type' => 'text/xml; charset="utf-8"',
                    'SOAPAction' => 'urn:microsoft-dynamics-schemas/codeunit/ServiceOrderApp:UpdatePortalImage'
                ],
            ]);
            $responseBody = $response->getBody();
            
            Log::info("Update Portal Image Request Response", [
                'response' => $responseBody
            ]);
            Log::info("Image/Signature updated successfully in Business Central.");
            return $responseBody;
        } catch (\Exception $e) {
            Log::error("SOAP Response Error", [$e]);
            return $e->getMessage();
        }
    }


    public function teamRegionConfiguration()
    {
        Log::info("Received Team Region Configuration Pull Request");
        try {
            $client = $this->createHttpClient();

            $startTime = microtime(true);

            $response = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/TeamRegionConfiguration?\$filter=Date ge " . now()->toDateString());

            $requestTime = microtime(true) - $startTime;

            $teamRegionConfigurationList = json_decode($response->getBody()->getContents(), true);

            Log::info('Team Region Configuration pull successfully', [
                'request_time' => $requestTime . ' seconds',
            ]);

            return $teamRegionConfigurationList['value'];

        } catch (\Exception $e) {
            Log::critical('Failed to pull Team Region Configuration', [
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function getTeamRegionConfigurationData(Carbon $startDate, Carbon $endDate)
    {
        Log::info("Fetching Team Region Configuration from OData", [
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString()
        ]);

        try {
            $client = $this->createHttpClient();

            $startTime = microtime(true);

            $url = "/{$this->bcInstanceName}/ODataV4/Company('TBH')/TeamRegionConfiguration?" .
                "\$filter=Date ge {$startDate->toDateString()} and Date le {$endDate->toDateString()}";

            $response = $client->get($url);

            $requestTime = microtime(true) - $startTime;

            $data = json_decode($response->getBody()->getContents(), true);

            Log::info('Team Region Configuration fetched successfully', [
                'request_time' => $requestTime . ' seconds',
                'records_fetched' => count($data['value'] ?? [])
            ]);

            return $data['value'] ?? [];

        } catch (\Exception $e) {
            Log::critical('Failed to fetch Team Region Configuration from OData', [
                'message' => $e->getMessage(),
            ]);
            return [];
        }
    }



    public function getAllTeams()
    {
        try {
            // Check if the data is already cached
            if (Cache::has('team_list')) {
                Log::info("Team List from Cache.");
                return Cache::get('team_list');
            }

            $client = $this->createHttpClient();

            $startTime = microtime(true);
            $response = $client->get("/{$this->bcInstanceName}/ODataV4/Company('TBH')/TeamRegion");

            $requestTime = microtime(true) - $startTime;

            $teamListResponse = json_decode($response->getBody()->getContents(), true);

            // Store response in cache for 10 minutes
            Cache::put('team_list', $teamListResponse['value'], now()->addMinutes(10));

            Log::info('Team List fetched successfully', [
                'request_time' => $requestTime . ' seconds',
            ]);

            return $teamListResponse['value'];
        } catch (\Exception $e) {
            Log::critical('Unexpected error fetching Team List', [
                'message' => $e->getMessage(),
            ]);
        }
    }

}

