<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Muestra;

class MuestrasController extends Controller
{
    public function index(Request $request)
    {
        $query = Muestra::with(['freezer.dispositivo']);

        if ($request->filled('freezer_id')) {
            $query->where('freezer_id', $request->freezer_id);
        }
        if ($request->filled('estado')) {
        }

        return Inertia::render('Muestras/muestras', [
            'muestras' => $query->orderBy('fecha_inicio', 'desc')->paginate(5)->withQueryString(),
            'filters' => $request->only(['freezer_id']),
            'freezers' => \App\Models\Freezer::select('id', 'ubicacion')->orderBy('ubicacion')->get(),
        ]);
    }

    public function show(Muestra $muestra)
    {
        $muestra->load(['freezer.dispositivo']);

        return Inertia::render('Muestras/show', [
            'muestra' => $muestra,
        ]);
    }
}
