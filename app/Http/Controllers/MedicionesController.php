<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Medicion;
use App\Models\Dispositivo;
use App\Support\SedeAccess;

class MedicionesController extends Controller
{
    public function index(Request $request)
    {
        $query = SedeAccess::scope(Medicion::with(['dispositivo.freezer']), $request->user(), 'dispositivo.freezer.laboratorio');

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
            'dispositivos' => SedeAccess::scope(Dispositivo::select('id', 'nombre'), $request->user(), 'freezer.laboratorio')->orderBy('nombre')->get(),
        ]);
    }

    public function show(Request $request, Medicion $medicion)
    {
        $medicion = SedeAccess::find(Medicion::query(), $request->user(), 'dispositivo.freezer.laboratorio', $medicion->id);
        $medicion->load(['dispositivo.freezer']);

        return Inertia::render('Mediciones/mediciones', [
            'medicion' => $medicion,
        ]);
    }

    public function destroy(Request $request, Medicion $medicion)
    {
        $medicion = SedeAccess::find(Medicion::query(), $request->user(), 'dispositivo.freezer.laboratorio', $medicion->id);
        $medicion->delete();
        return redirect()->back()->with('success', 'Medición eliminada permanentemente.');
    }
}
