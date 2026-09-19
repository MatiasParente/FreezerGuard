<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AlertaGenerada;
use App\Models\Alerta;
use App\Models\Dispositivo;
use App\Models\Muestra;
use App\Services\AlertNotificationService;
use Carbon\Carbon;

class ProcessPendingAlerts extends Command
{
    protected $signature = 'app:process-pending-alerts';
    protected $description = 'Evaluate device inactivity, sample expiration, auto-resolution (5 min stability), and process pending alert emails';

    public function handle()
    {
        $this->verificarMuestrasVencidas();
        $this->verificarDispositivosInactivos();

        // 1. Procesar auto-resoluciones de alertas por retorno a estado normal (5 min)
        AlertNotificationService::procesarAutoResoluciones();

        // 2. Buscar alertas pendientes de envío (estado 0 = nuevo, 1 = enviado)
        $alertas = AlertaGenerada::where('estado', '<', 2)->get();
        
        foreach ($alertas as $alertaGenerada) {
            AlertNotificationService::enviarNotificacionAlerta($alertaGenerada);
        }
    }

    private function verificarMuestrasVencidas()
    {
        $alertaVencimiento = Alerta::where('tipo', 'Muestra Vencida')->first();
        if (!$alertaVencimiento) return;

        $ahora = now('America/Montevideo');

        // Muestras activas que ya hayan superado su fecha de vencimiento
        $muestrasVencidas = Muestra::where('estado', 'activo')
            ->whereNotNull('vencimiento')
            ->where('vencimiento', '<=', $ahora)
            ->with('freezer.dispositivo')
            ->get();

        foreach ($muestrasVencidas as $muestra) {
            $dispositivo = $muestra->freezer?->dispositivo;
            if ($dispositivo && $dispositivo->alerta_vencimiento_activa) {
                $sinResolver = AlertaGenerada::where('dispositivo_id', $dispositivo->id)
                    ->where('alerta_id', $alertaVencimiento->id)
                    ->where('estado', '<', 2)
                    ->exists();

                if (!$sinResolver) {
                    $alertaGenerada = AlertaGenerada::create([
                        'dispositivo_id' => $dispositivo->id,
                        'alerta_id' => $alertaVencimiento->id,
                        'fecha_y_hora' => $ahora,
                        'estado' => 0,
                    ]);

                    AlertNotificationService::enviarNotificacionAlerta($alertaGenerada);
                }
            }
        }
    }

    private function verificarDispositivosInactivos()
    {
        $alertaInactividad = Alerta::where('tipo', 'Dispositivo Inactivo')->first();
        if (!$alertaInactividad) return;

        $ahora = now('America/Montevideo');
        $limiteInactividad = $ahora->copy()->subMinutes(30);

        // Dispositivos que tienen activa la alerta de inactividad
        $dispositivos = Dispositivo::where('alerta_inactividad_activa', true)
            ->with('mediciones')
            ->get();

        foreach ($dispositivos as $dispositivo) {
            $ultimaMedicion = $dispositivo->mediciones()->latest('fecha_y_hora')->first();

            // Si nunca envió datos o la última medición es más antigua que 30 minutos
            if (!$ultimaMedicion || Carbon::parse($ultimaMedicion->fecha_y_hora)->lt($limiteInactividad)) {
                $sinResolver = AlertaGenerada::where('dispositivo_id', $dispositivo->id)
                    ->where('alerta_id', $alertaInactividad->id)
                    ->where('estado', '<', 2)
                    ->exists();

                if (!$sinResolver) {
                    $alertaGenerada = AlertaGenerada::create([
                        'dispositivo_id' => $dispositivo->id,
                        'alerta_id' => $alertaInactividad->id,
                        'fecha_y_hora' => $ahora,
                        'estado' => 0,
                    ]);

                    AlertNotificationService::enviarNotificacionAlerta($alertaGenerada);
                }
            }
        }
    }
}
