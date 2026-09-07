<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Dispositivo;

class ConfiguracionController extends Controller
{
    public function index(Request $request)
    {
        $query = Dispositivo::with(['freezer', 'mediciones']);

        if ($request->filled('freezer_id')) {
            $query->where('freezer_id', $request->freezer_id);
        }

        return Inertia::render('Configuración/configuracion', [
            'dispositivos' => $query->paginate(5)->withQueryString(),
            'filters' => $request->only(['freezer_id']),
            'freezers' => \App\Models\Freezer::select('id', 'ubicacion')->orderBy('ubicacion')->get(),
        ]);
    }

    public function show(Dispositivo $dispositivo)
    {
        $dispositivo->load(['freezer', 'mediciones']);

        return Inertia::render('Configuración/configuracion', [
            'dispositivo' => $dispositivo,
        ]);
    }
}
