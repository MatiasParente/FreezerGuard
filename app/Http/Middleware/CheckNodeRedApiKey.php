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

        if (!$header) {
            return response()->json([
                'success' => false,
                'message' => 'Authorization header missing.'
            ], 401);
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Authorization header.'
            ], 401);
        }

        $token = $matches[1];

        if (!hash_equals(env('NODERED_API_KEY'), $token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid API key.'
            ], 401);
        }

        return $next($request);
    }
}