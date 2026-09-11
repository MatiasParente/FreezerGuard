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
            'available_freezers' => \App\Models\Freezer::doesntHave('dispositivo')->select('id', 'ubicacion')->orderBy('ubicacion')->get(),
        ]);
    }

    public function show(Dispositivo $dispositivo)
    {
        $dispositivo->load(['freezer', 'mediciones']);

        return Inertia::render('Configuración/configuracion', [
            'dispositivo' => $dispositivo,
        ]);
    }

    public function storeDispositivo(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'is_new_freezer' => 'required|boolean',
            'freezer_id' => 'required_if:is_new_freezer,false|nullable|exists:freezers,id|unique:dispositivos,freezer_id',
            'nueva_ubicacion' => 'required_if:is_new_freezer,true|nullable|string|max:255',
        ]);

        if ($validated['is_new_freezer']) {
            $freezer = \App\Models\Freezer::create([
                'ubicacion' => $validated['nueva_ubicacion'],
            ]);
            $freezerId = $freezer->id;
        } else {
            $freezerId = $validated['freezer_id'];
        }

        Dispositivo::create([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'freezer_id' => $freezerId,
        ]);

        return redirect()->back()->with('success', 'Dispositivo creado exitosamente.');
    }

    public function updateDispositivo(Request $request, Dispositivo $dispositivo)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'alerta_temperatura_activa' => 'required|boolean',
            'alerta_bateria_activa' => 'required|boolean',
            'alerta_vencimiento_activa' => 'required|boolean',
            'alerta_inactividad_activa' => 'required|boolean',
            'temp_min_default' => 'required|numeric|between:-100,100',
            'temp_max_default' => 'required|numeric|between:-100,100',
            'wifi_ssid' => 'nullable|string|max:255',
            'wifi_password' => 'nullable|string|max:255',
        ]);

        $dispositivo->update($validated);

        return redirect()->back()->with('success', 'Configuración del dispositivo actualizada.');
    }
}
