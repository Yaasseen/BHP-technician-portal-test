<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'business_central' => [
        'odata_base_url' => env('ODATA_BASE_URL'),
        'odata_username' => env('ODATA_USER_NAME'),
        'odata_password' => env('ODATA_PASSWORD'),
        'soap_base_url' => env('SOAP_BASE_URL'),
        'soap_username' => env('SOAP_USER_NAME'),
        'soap_password' => env('SOAP_PASSWORD'),
        'instance_name' => env('BC_INSTANCE_NAME', 'bc270'),
    ],

];
