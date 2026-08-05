<?php

use App\Http\Controllers\Api\TelemetryController;
use Illuminate\Support\Facades\Route;

Route::middleware('nodered')->post('/iot/data', [TelemetryController::class, 'store']);