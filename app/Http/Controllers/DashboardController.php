<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Muestra;
use App\Models\Medicion;
use App\Models\AlertaGenerada;
use App\Models\Dispositivo;
use App\Models\Freezer;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Muestras por vencer (filtrables por freezer si se requiere)
        $muestrasQuery = Muestra::with('freezer.dispositivo');
        if ($request->filled('freezer_id')) {
            $muestrasQuery->where('freezer_id', $request->freezer_id);
        }

        $muestras = $muestrasQuery->get()->map(function($muestra) {
            $dias = $muestra->vencimiento ? now()->diffInDays($muestra->vencimiento, false) : null;
            if ($dias === null) {
                $estado = 'Sin Vencimiento';
            } elseif ($dias < 0) {
                $estado = 'Vencida';
            } elseif ($dias <= 3) {
                $estado = 'Por vencer';
            } else {
                $estado = 'Ok';
            }
            $muestra->estado_vencimiento = $estado;
            return $muestra;
        });

        // Lista de dispositivos con su última medición y estado de alertas para las Tarjetas Superiores
        $dispositivosConEstado = Dispositivo::with('freezer')->get()->map(function($disp) {
            $ultimaMedicion = Medicion::where('dispositivo_id', $disp->id)
                ->orderBy('fecha_y_hora', 'desc')
                ->first();

            return [
                'id' => $disp->id,
                'nombre' => $disp->nombre,
                'freezer_ubicacion' => $disp->freezer ? $disp->freezer->ubicacion : 'Sin Freezer',
                'ultima_medicion' => $ultimaMedicion,
                'estado_alertas' => [
                    'temperatura' => (bool)$disp->alerta_temperatura_activa,
                    'bateria' => (bool)$disp->alerta_bateria_activa,
                    'vencimiento' => (bool)$disp->alerta_vencimiento_activa,
                    'inactividad' => (bool)$disp->alerta_inactividad_activa,
                ],
            ];
        });

        // Alertas sin resolver (conteo total)
        $alertasSinResolverCount = AlertaGenerada::where('estado', '!=', 2)->count();

        // Últimas 100 mediciones para gráfico en tiempo real
        $ultimasMediciones = Medicion::with('dispositivo')
            ->orderBy('fecha_y_hora', 'desc')
            ->take(100)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($medicion) {
                $tempMin = $medicion->dispositivo->temp_min_default ?? -20.0;
                $tempMax = $medicion->dispositivo->temp_max_default ?? 30.0;
                $tieneAlerta = ($medicion->bateria === true) 
                    || ($medicion->temperatura < $tempMin) 
                    || ($medicion->temperatura > $tempMax);
                $medicion->tiene_alerta = $tieneAlerta;
                return $medicion;
            });

        // Alertas paginadas (Sin resolver + resueltas de últimos 30 días)
        $alertas = AlertaGenerada::with(['dispositivo.freezer', 'alerta'])
            ->where('estado', '!=', 2)
            ->orWhere('fecha_y_hora', '>=', now()->subDays(30))
            ->orderBy('fecha_y_hora', 'desc')
            ->paginate(5, ['*'], 'alertas_page')->withQueryString();

        // Freezers para desplegable de muestras
        $freezers = Freezer::select('id', 'ubicacion')->orderBy('ubicacion')->get();

        return Inertia::render('Dashboard', [
            'muestras' => $muestras,
            'dispositivosConEstado' => $dispositivosConEstado,
            'ultimasMediciones' => $ultimasMediciones,
            'alertasSinResolverCount' => $alertasSinResolverCount,
            'alertas' => $alertas,
            'freezers' => $freezers,
            'filters' => $request->only(['freezer_id']),
        ]);
    }
}
