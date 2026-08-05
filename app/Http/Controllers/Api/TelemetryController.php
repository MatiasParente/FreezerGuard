<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreTelemetryRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    public function store(StoreTelemetryRequest $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Datos recibidos correctamente',
            'data' => $request->validated(),
        ]);
    }
}