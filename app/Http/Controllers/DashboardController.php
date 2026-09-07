<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Muestra;
use App\Models\Medicion;
use App\Models\AlertaGenerada;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        //muestras por vencer
        $muestras = Muestra::with('freezer.dispositivo')->get()->map(function($muestra) {
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

        // promedios diarios de los ultimos 7 dias de la temperatura
        $promediosDb = Medicion::selectRaw('DATE(fecha_y_hora) as date, AVG(temperatura) as avg_temp, dispositivo_id')
            ->where('fecha_y_hora', '>=', now()->subDays(7))
            ->groupBy('date', 'dispositivo_id')
            ->with('dispositivo')
            ->orderBy('date')
            ->get();
            
        //Transformar para Recharts
        $promedios = [];
        foreach ($promediosDb as $p) {
            $date = $p->date;
            if (!isset($promedios[$date])) {
                $promedios[$date] = ['date' => $date];
            }
            $nombreDispositivo = $p->dispositivo ? $p->dispositivo->nombre : 'Desconocido';
            $promedios[$date][$nombreDispositivo] = round($p->avg_temp, 2);
        }
        $promedios = array_values($promedios);

        //5 mediciones de temperatura ultimas
        $ultimasMediciones = Medicion::with('dispositivo')
            ->orderBy('fecha_y_hora', 'desc')
            ->take(5)
            ->get()
            ->reverse()
            ->values();

        // 4. Alertas (Pendientes o Resueltas en últimos 30 días)
        $alertas = AlertaGenerada::with(['dispositivo.freezer', 'alerta'])
            ->where('estado', '!=', 2)
            ->orWhere('fecha_y_hora', '>=', now()->subDays(30))
            ->orderBy('fecha_y_hora', 'desc')
            ->paginate(5, ['*'], 'alertas_page')->withQueryString();

        return Inertia::render('Dashboard', [
            'muestras' => $muestras,
            'promedios' => $promedios,
            'ultimasMediciones' => $ultimasMediciones,
            'alertas' => $alertas,
        ]);
    }
}
