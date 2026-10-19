<?php

namespace App\Http\Controllers;

use App\Models\HistorialMuestra;
use App\Models\Freezer;
use App\Support\SedeAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistorialMuestraController extends Controller
{
    public function index(Request $request)
    {
        $query = HistorialMuestra::with([
            'muestra',
            'freezer.dispositivo',
            'user'
        ]);

        // Filtrar por sede si aplica mediante SedeAccess
        $query = SedeAccess::scope($query, $request->user(), 'freezer.laboratorio');

        // Filtro por Freezer / Laboratorio
        if ($request->filled('freezer_id')) {
            $query->where('freezer_id', $request->freezer_id);
        }

        $updates = $query->latest('fecha')->paginate(15)->withQueryString();

        // Obtener freezers permitidos para el selector de filtro
        $freezers = SedeAccess::scope(
            Freezer::select('id', 'ubicacion', 'laboratorio_id')
                ->with(['laboratorio.sede', 'dispositivo:id,freezer_id,nombre']),
            $request->user()
        )->orderBy('ubicacion')->get();

        return Inertia::render('HistorialMuestra/Index', [
            'updates'  => $updates,
            'filters'  => $request->only(['freezer_id']),
            'freezers' => $freezers,
        ]);
    
    }

    /**
     * Guarda un nuevo registro del historial de modificación.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'muestra_id'     => 'required|exists:muestras,id',
            'nombre_muestra' => 'required|string|max:255',
            'accion' => 'required|string',
            'fecha' => 'nullable|date',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['fecha'] = $validated['fecha'] ?? now();

        $updateMuestra = HistorialMuestra::create($validated);

        return redirect()->back()->with('success', 'Historial de actualización registrado con éxito.');
        
        // Si fuera una API JSON:
        // return response()->json($updateMuestra, 201);
    }
}
