<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsGeneralAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->is_general_admin) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'No autorizado. Se requieren permisos de Administrador General.'], 403);
            }
            abort(403, 'No tienes permisos de Administrador General para acceder a esta sección.');
        }

        return $next($request);
    }
}
