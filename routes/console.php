<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:process-pending-alerts')->everyMinute()->withoutOverlapping();

// Purgar mediciones antiguas el 1 de cada mes a las 03:00 AM
Schedule::command('app:purge-mediciones --force')->monthlyOn(1, '03:00')->withoutOverlapping();
