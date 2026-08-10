<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new App\Services\TelemetryService();
$result = $service->handleData([
    'device_id' => 1,
    'temperature' => 29.53,
    'bateria' => false,
    'timestamp' => '2026-08-08 04:00:00'
]);
dump($result);
dump(App\Models\AlertaGenerada::all()->toArray());
