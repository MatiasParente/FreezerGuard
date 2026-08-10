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

    //Recibe los datos del dispositivo y los envia al servicio
    public function store(StoreTelemetryRequest $request)
    {
        $result = $this->telemetryService->handleData(
            $request->validated()
        );

        //retornamos success true si todo esta ok o false si hubo algun error
        return response()->json($result, 201);
    }
}