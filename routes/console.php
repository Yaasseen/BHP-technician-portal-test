<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Console\Commands\SyncServiceOrdersFromBCJob;
use App\Console\Commands\ServiceOrderPriorityChangeJob;
use App\Console\Commands\FlagPostedServiceOrdersFromBCJob;


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


// Schedule::command('serviceorders:sync')->everyFiveMinutes();

$minutes = env('CRON_MINUTES', 2);
$cronExpression = "*/$minutes * * * *";

Schedule::command(SyncServiceOrdersFromBCJob::class)->cron($cronExpression);
// Schedule::command(ServiceOrderPriorityChangeJob::class)->everyFiveSeconds();

Schedule::command(ServiceOrderPriorityChangeJob::class)->daily();
Schedule::command(FlagPostedServiceOrdersFromBCJob::class)->everyFiveMinutes();