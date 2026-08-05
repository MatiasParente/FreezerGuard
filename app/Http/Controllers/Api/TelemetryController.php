<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTelemetryRequest;
use App\Services\TelemetryService;

class TelemetryController extends Controller
{
    public function __construct(
        private TelemetryService $telemetryService
    ) {}

    public function store(StoreTelemetryRequest $request)
    {
        $result = $this->telemetryService->handleData(
            $request->validated()
        );

        return response()->json($result, 201);
    }
}