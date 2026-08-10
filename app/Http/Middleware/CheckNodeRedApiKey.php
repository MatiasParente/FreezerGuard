<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
//usamos este codigo para verificar la api key que nos envia node-red sea la correcta para evitar ataques externos
class CheckNodeRedApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization');
        //si falta el header
        if (!$header) {
            return response()->json([
                'success' => false,
                'message' => 'falta autorizacion'
            ], 401);
        }
        //si el header no es correcto
        if (!preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return response()->json([
                'success' => false,
                'message' => 'autorizacion incorrecta'
            ], 401);
        }

        $token = $matches[1];
        //si la api key no es la correcta
        if (!hash_equals(env('NODERED_API_KEY'), $token)) {
            return response()->json([
                'success' => false,
                'message' => 'api key invalida'
            ], 401);
        }

        return $next($request);
    }
}