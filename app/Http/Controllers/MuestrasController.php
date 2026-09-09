<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Muestra;

class MuestrasController extends Controller
{
    public function index(Request $request)
    {
        $query = Muestra::with(['freezer.dispositivo.alertasGeneradas' => function ($q) {
            $q->where('estado', 1); // 1 = Pendiente
        }, 'users', 'usuarios']);

        if ($request->filled('freezer_id')) {
            $query->where('freezer_id', $request->freezer_id);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        } else {
            // Por defecto mostrar activos
            $query->where('estado', 'activo');
        }

        $muestras = $query->orderBy('fecha_inicio', 'desc')->paginate(10)->withQueryString();

        // Procesar has_active_alert y ordenar
        $muestrasCollection = collect($muestras->items())->map(function ($muestra) {
            $hasAlert = false;
            if ($muestra->freezer && $muestra->freezer->dispositivo) {
                if ($muestra->freezer->dispositivo->alertasGeneradas->count() > 0) {
                    $hasAlert = true;
                }
            }
            $muestra->has_active_alert = $hasAlert;
            return $muestra;
        })->sortByDesc('has_active_alert')->values();

        // Set the modified items back to the paginator
        $muestras->setCollection($muestrasCollection);

        return Inertia::render('Muestras/muestras', [
            'muestras' => $muestras,
            'filters' => $request->only(['freezer_id', 'estado']),
            'freezers' => \App\Models\Freezer::select('id', 'ubicacion')->orderBy('ubicacion')->get(),
            'users' => \App\Models\User::select('id', 'name', 'email')->get(),
            'usuarios' => \App\Models\Usuario::select('id', 'nombre', 'email')->get(),
        ]);
    }

    public function show(Muestra $muestra)
    {
        $muestra->load(['freezer.dispositivo', 'users', 'usuarios']);

        return Inertia::render('Muestras/show', [
            'muestra' => $muestra,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cantidad' => 'nullable|numeric',
            'vencimiento' => 'nullable|date',
            'temperatura_minima' => 'nullable|numeric',
            'temperatura_maxima' => 'nullable|numeric',
            'observaciones' => 'nullable|string',
            'freezer_id' => 'required|exists:freezers,id',
            'usuarios_ids' => 'array',
            'usuarios_ids.*' => 'exists:usuarios,id',
            'users_ids' => 'array',
            'users_ids.*' => 'exists:users,id',
        ]);

        $validated['temperatura_minima'] = $validated['temperatura_minima'] ?? -25.0;
        $validated['temperatura_maxima'] = $validated['temperatura_maxima'] ?? -10.0;
        $validated['estado'] = 'activo';
        $validated['fecha_inicio'] = now();

        // Si no hay docentes asignados, asignar el usuario actual por defecto
        if (empty($validated['users_ids'])) {
            $validated['users_ids'] = [auth()->id()];
        }

        $muestra = Muestra::create($validated);

        if (!empty($validated['usuarios_ids'])) {
            $muestra->usuarios()->attach($validated['usuarios_ids']);
        }
        if (!empty($validated['users_ids'])) {
            $muestra->users()->attach($validated['users_ids']);
        }

        return redirect()->back()->with('success', 'Muestra creada exitosamente.');
    }

    public function update(Request $request, Muestra $muestra)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cantidad' => 'nullable|numeric',
            'vencimiento' => 'nullable|date',
            'temperatura_minima' => 'nullable|numeric',
            'temperatura_maxima' => 'nullable|numeric',
            'observaciones' => 'nullable|string',
            'freezer_id' => 'required|exists:freezers,id',
            'estado' => 'required|in:activo,inactivo',
            'usuarios_ids' => 'array',
            'usuarios_ids.*' => 'exists:usuarios,id',
            'users_ids' => 'array',
            'users_ids.*' => 'exists:users,id',
        ]);

        $muestra->update($validated);

        if (isset($validated['usuarios_ids'])) {
            $muestra->usuarios()->sync($validated['usuarios_ids']);
        }
        if (isset($validated['users_ids'])) {
            $muestra->users()->sync($validated['users_ids']);
        }

        return redirect()->back()->with('success', 'Muestra actualizada exitosamente.');
    }

    public function destroy(Muestra $muestra)
    {
        if ($muestra->estado !== 'inactivo') {
            return redirect()->back()->with('error', 'Solo se pueden eliminar muestras inactivas.');
        }

        $muestra->delete();
        return redirect()->back()->with('success', 'Muestra eliminada permanentemente.');
    }
}
