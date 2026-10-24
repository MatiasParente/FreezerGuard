<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:process-pending-alerts')->everyMinute()->withoutOverlapping();

// Purgar datos antiguos según configuración del sistema (hora y días configurables desde la UI)
Schedule::command('app:purge-mediciones --force')->hourly()->withoutOverlapping();
