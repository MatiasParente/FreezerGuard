<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AlertaGenerada;

class AlertasController extends Controller
{
    public function index(Request $request)
    {
        $query = AlertaGenerada::with(['dispositivo.freezer.muestras.users', 'dispositivo.freezer.muestras.usuarios', 'alerta']);

        if ($request->filled('dispositivo_id')) {
            $query->where('dispositivo_id', $request->dispositivo_id);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('tipo')) {
            $query->whereHas('alerta', function ($q) use ($request) {
                $q->where('tipo', $request->tipo);
            });
        }

        return Inertia::render('Alertas/alertas', [
            'alertas' => $query->orderBy('fecha_y_hora', 'desc')->paginate(5)->withQueryString(),
            'filters' => $request->only(['dispositivo_id', 'estado', 'tipo']),
            'dispositivos' => \App\Models\Dispositivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'tipos' => \App\Models\Alerta::select('id', 'tipo as nombre')->get(),
        ]);
    }

    public function show(AlertaGenerada $alertaGenerada)
    {
        $alertaGenerada->load(['dispositivo.freezer.muestras.users', 'dispositivo.freezer.muestras.usuarios', 'alerta']);

        return Inertia::render('Alertas/alertas', [
            'alerta' => $alertaGenerada,
        ]);
    }

    public function update(Request $request, AlertaGenerada $alertaGenerada)
    {
        $request->validate([
            'observacion' => 'nullable|string|max:1000',
        ]);

        $alertaGenerada->update([
            'observacion' => $request->observacion,
        ]);

        return back()->with('success', 'Observación actualizada correctamente.');
    }

    public function destroy(AlertaGenerada $alertaGenerada)
    {
        $alertaGenerada->delete();
        return redirect()->back()->with('success', 'Alerta eliminada permanentemente.');
    }
}
