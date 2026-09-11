<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AlertaGenerada;
use App\Models\Alerta;
use App\Models\Dispositivo;
use App\Models\Muestra;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use App\Mail\AlertaTemperaturaMail;
use Carbon\Carbon;

class ProcessPendingAlerts extends Command
{
    protected $signature = 'app:process-pending-alerts';
    protected $description = 'Evaluate device inactivity and sample expiration, and process pending alert emails';

    public function handle()
    {
        $this->verificarMuestrasVencidas();
        $this->verificarDispositivosInactivos();

        // Buscar alertas que no hayan sido resueltas (estado 0 = nuevo, 1 = enviado)
        $alertas = AlertaGenerada::where('estado', '<', 2)->get();
        
        foreach ($alertas as $alertaGenerada) {
            $dispositivo = $alertaGenerada->dispositivo;
            $freezer = $dispositivo?->freezer;
            $alerta = $alertaGenerada->alerta;

            if (!$dispositivo) continue;

            // Recolectar administradores
            $users = collect();
            if ($freezer) {
                // Admins del freezer
                $users = $users->merge($freezer->users);
                
                // Admins de las muestras del freezer
                foreach ($freezer->muestras as $muestra) {
                    $users = $users->merge($muestra->users);
                }
            }
            // Filtrar duplicados por si un admin está en ambas listas
            $users = $users->unique('id');

            // Generar firma usando ruta relativa para evitar problemas con Nginx Proxy Manager y cabeceras
            $rutaRelativa = URL::signedRoute('alertas.resolver', ['alertaGenerada' => $alertaGenerada->id], null, false);
            // Reconstruir la URL absoluta usando la URL de la aplicación definida en .env
            $urlResolucion = rtrim(config('app.url'), '/') . $rutaRelativa;

            foreach ($users as $user) {
                Mail::to($user->email)
                    ->queue(new AlertaTemperaturaMail(
                        $freezer, 
                        $dispositivo, 
                        $alerta, 
                        $urlResolucion, 
                        $alertaGenerada->fecha_y_hora
                    ));
            }

            // Cambiar estado a 1 (Enviado) si estaba en 0
            if ($alertaGenerada->estado == 0) {
                $alertaGenerada->update(['estado' => 1]);
            }
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
                    AlertaGenerada::create([
                        'dispositivo_id' => $dispositivo->id,
                        'alerta_id' => $alertaVencimiento->id,
                        'fecha_y_hora' => $ahora,
                        'estado' => 0,
                    ]);
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
                    AlertaGenerada::create([
                        'dispositivo_id' => $dispositivo->id,
                        'alerta_id' => $alertaInactividad->id,
                        'fecha_y_hora' => $ahora,
                        'estado' => 0,
                    ]);
                }
            }
        }
    }
}

