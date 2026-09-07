<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Medicion;

class MedicionesController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicion::with(['dispositivo.freezer']);

        if ($request->filled('dispositivo_id')) {
            $query->where('dispositivo_id', $request->dispositivo_id);
        }
        if ($request->filled('bateria')) {
            $query->where('bateria', $request->bateria === 'conectada' ? 1 : 0);
        }

        if ($request->filled('min_temp')) {
            $query->where('temperatura', '>=', $request->min_temp);
        }
        if ($request->filled('max_temp')) {
            $query->where('temperatura', '<=', $request->max_temp);
        }

        return Inertia::render('Mediciones/mediciones', [
            'mediciones' => $query->orderBy('fecha_y_hora', 'desc')->paginate(5)->withQueryString(),
            'filters' => $request->only(['dispositivo_id', 'bateria', 'min_temp', 'max_temp']),
            'dispositivos' => \App\Models\Dispositivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function show(Medicion $medicion)
    {
        $medicion->load(['dispositivo.freezer']);

        return Inertia::render('Mediciones/mediciones', [
            'medicion' => $medicion,
        ]);
    }
}
