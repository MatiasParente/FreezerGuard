<?php

namespace App\Http\Controllers;
use App\Models\UpdateMuestra;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UpdateMuestraController extends Controller
{
    public function index(Request $request)
    {
        $updates = UpdateMuestra::with(['muestra', 'user'])
            ->latest('fecha')
            ->paginate(15);

        return Inertia::render('UpdateMuestras/Index', [
            'updates' => $updates,
        ]);

        // Si fuera una API JSON:
        // return response()->json($updates);
    }

    /**
     * Guarda un nuevo registro del historial de modificación.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'muestra_id'     => 'required|exists:muestras,id',
            'nombre_muestra' => 'required|string|max:255',
            'temp_min_old'   => 'nullable|numeric',
            'temp_max_old'   => 'nullable|numeric',
            'temp_min_new'   => 'required|numeric',
            'temp_max_new'   => 'required|numeric',
            'fecha'          => 'nullable|datetime',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['fecha'] = $validated['fecha'] ?? now();

        $updateMuestra = UpdateMuestra::create($validated);

        return redirect()->back()->with('success', 'Historial de actualización registrado con éxito.');
        
        // Si fuera una API JSON:
        // return response()->json($updateMuestra, 201);
    }
}
