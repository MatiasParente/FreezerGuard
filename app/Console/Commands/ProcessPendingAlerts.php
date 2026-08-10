<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AlertaGenerada;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use App\Mail\AlertaTemperaturaMail;

class ProcessPendingAlerts extends Command
{
    protected $signature = 'app:process-pending-alerts';
    protected $description = 'Process and resend pending alerts to administrators';

    public function handle()
    {
        // Buscar alertas que no hayan sido resueltas (estado 0 = nuevo, 1 = enviado)
        $alertas = AlertaGenerada::where('estado', '<', 2)->get();
        
        foreach ($alertas as $alertaGenerada) {
            $dispositivo = $alertaGenerada->dispositivo;
            $freezer = $dispositivo->freezer;
            $alerta = $alertaGenerada->alerta;

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

            // Generar Signed URL para que el usuario pueda resolver la alerta
            $urlResolucion = URL::signedRoute('alertas.resolver', ['alertaGenerada' => $alertaGenerada->id]);

            foreach ($users as $user) {
                Mail::to($user->email)
                    ->send(new AlertaTemperaturaMail(
                        $freezer, 
                        $dispositivo, 
                        $alerta, 
                        $urlResolucion, 
                        $alertaGenerada->fecha_y_hora
                    ));
            }

            // Cambiar estado a 1 (Enviado) si estaba en 0. Si ya estaba en 1, se queda en 1
            if ($alertaGenerada->estado == 0) {
                $alertaGenerada->update(['estado' => 1]);
            }
        }
    }
}
