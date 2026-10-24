<?php

namespace App\Services;

use App\Models\AlertaGenerada;
use App\Models\Alerta;
use App\Models\Dispositivo;
use App\Models\Muestra;
use App\Models\Medicion;
use App\Models\User;
use App\Models\ConfiguracionSistema;
use App\Mail\AlertaTemperaturaMail;
use App\Mail\AlertaResueltaMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;

class AlertNotificationService
{
    /**
     * Obtenemos la lista consolidada de destinatarios de correo para una alerta/dispositivo.
     */
    public static function obtenerDestinatarios(?Dispositivo $dispositivo): array
    {
        $config = ConfiguracionSistema::getSolo();
        $emails = collect();

        $freezer = $dispositivo?->freezer;
        if ($freezer) {
            $sedeId = $freezer->laboratorio?->sede_id;
            // Admins/docentes del freezer
            foreach ($freezer->users as $u) {
                if ($sedeId && $u->sedes()->whereKey($sedeId)->exists() && !empty($u->email)) $emails->push($u->email);
            }

            // Docentes asignados a las muestras activas del freezer (NO participantes/estudiantes)
            foreach ($freezer->muestras as $muestra) {
                if ($muestra->estado !== 'activo') continue;
                foreach ($muestra->users as $u) {
                    if ($sedeId && $u->sedes()->whereKey($sedeId)->exists() && !empty($u->email)) $emails->push($u->email);
                }
            }
        }

        // Correo por defecto configurado globalmente
        if (!empty($config->email_default)) {
            $emails->push($config->email_default);
        }

        // Limpiar espacios y quitar duplicados
        $emails = $emails->map(fn($e) => trim($e))->filter()->unique()->values();

        return $emails->toArray();
    }

    //Enviar mail de alerta inicial (Estado 0 -> 1) a todos los destinatarios consolidados en un solo correo.
    public static function enviarNotificacionAlerta(AlertaGenerada $alertaGenerada): void
    {
        if ($alertaGenerada->estado !== 0) return;

        $config = ConfiguracionSistema::getSolo();

        if (!$config->envio_email_activo) {
            return;
        }

        $dispositivo = $alertaGenerada->dispositivo;
        if (!$dispositivo) return;

        $freezer = $dispositivo->freezer;
        $alerta = $alertaGenerada->alerta;

        $destinatarios = self::obtenerDestinatarios($dispositivo);
        if (empty($destinatarios)) {
            Log::warning('Alerta pendiente sin destinatarios de correo', [
                'alerta_generada_id' => $alertaGenerada->id,
                'dispositivo_id' => $dispositivo->id,
                'freezer_sin_laboratorio' => $freezer && !$freezer->laboratorio_id,
                'respaldo_global_configurado' => !empty($config->email_default),
            ]);
            return;
        }

        // Firma firmada para resolución vía link
        $rutaRelativa = URL::signedRoute('alertas.resolver', ['alertaGenerada' => $alertaGenerada->id], null, false);
        $urlResolucion = rtrim(config('app.url'), '/') . $rutaRelativa;

        $ultimaMedicion = $dispositivo->mediciones()->latest('fecha_y_hora')->first();

        // Reservar la transición antes de encolar: dos workers pueden haber leído el mismo estado 0.
        if (AlertaGenerada::whereKey($alertaGenerada->id)->where('estado', 0)->update(['estado' => 1]) === 0) return;
        $alertaGenerada->estado = 1;

        try {
            Mail::to($destinatarios)->queue(new AlertaTemperaturaMail(
                $freezer,
                $dispositivo,
                $alerta,
                $urlResolucion,
                $alertaGenerada->fecha_y_hora,
                $ultimaMedicion?->temperatura
            ));
        } catch (\Throwable $e) {
            AlertaGenerada::whereKey($alertaGenerada->id)->where('estado', 1)->update(['estado' => 0]);
            $alertaGenerada->estado = 0;
            throw $e;
        }
    }

    /**
     * Re-enviar emails de alertas que ya fueron enviadas (estado 1) pero siguen sin resolver.
     * Se re-envía si han pasado al menos `intervalo_correos` minutos desde el último envío.
     * Usa `updated_at` como marcador del último envío.
     */
    public static function reenviarNotificacionesPendientes(): void
    {
        $config = ConfiguracionSistema::getSolo();

        if (!$config->envio_email_activo) {
            return;
        }

        $intervaloMinutos = (int)($config->intervalo_correos ?? 1);
        $limiteReenvio = now()->subMinutes($intervaloMinutos);

        // Buscar alertas en estado 1 (ya enviadas) cuyo último envío fue hace más de intervalo_correos minutos
        $alertasPendientes = AlertaGenerada::with(['dispositivo.freezer', 'dispositivo.mediciones', 'alerta'])
            ->where('estado', 1)
            ->where('updated_at', '<=', $limiteReenvio)
            ->get();

        foreach ($alertasPendientes as $alertaGenerada) {
            $dispositivo = $alertaGenerada->dispositivo;
            if (!$dispositivo) continue;

            $freezer = $dispositivo->freezer;
            $alerta = $alertaGenerada->alerta;
            if (!$alerta) continue;

            $destinatarios = self::obtenerDestinatarios($dispositivo);
            if (empty($destinatarios)) continue;

            $rutaRelativa = URL::signedRoute('alertas.resolver', ['alertaGenerada' => $alertaGenerada->id], null, false);
            $urlResolucion = rtrim(config('app.url'), '/') . $rutaRelativa;

            $ultimaMedicion = $dispositivo->mediciones()->latest('fecha_y_hora')->first();

            try {
                Mail::to($destinatarios)->queue(new AlertaTemperaturaMail(
                    $freezer,
                    $dispositivo,
                    $alerta,
                    $urlResolucion,
                    $alertaGenerada->fecha_y_hora,
                    $ultimaMedicion?->temperatura
                ));

                // Actualizar updated_at para marcar el momento del re-envío
                $alertaGenerada->touch();

                Log::info('Re-envío de alerta programado', [
                    'alerta_generada_id' => $alertaGenerada->id,
                    'tipo' => $alerta->tipo,
                    'dispositivo' => $dispositivo->nombre,
                    'intervalo_minutos' => $intervaloMinutos,
                ]);
            } catch (\Throwable $e) {
                Log::error('Error al re-enviar alerta', [
                    'alerta_generada_id' => $alertaGenerada->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    // Enviar mail de confirmación al resolver una alerta
    public static function resolverAlertaYNotificar(AlertaGenerada $alertaGenerada, string $observacion = 'Resuelto'): void
    {
        $ahora = now('America/Montevideo');

        $alertaGenerada->update([
            'estado' => 2,
            'fecha_y_hora_resuelto' => $ahora,
            'observacion' => $observacion,
        ]);

        $config = ConfiguracionSistema::getSolo();
        if (!$config->envio_email_activo) {
            return;
        }

        $dispositivo = $alertaGenerada->dispositivo;
        if (!$dispositivo) return;

        $freezer = $dispositivo->freezer;
        $alerta = $alertaGenerada->alerta;

        $destinatarios = self::obtenerDestinatarios($dispositivo);
        if (empty($destinatarios)) return;

        $ultimaMedicion = $dispositivo->mediciones()->latest('fecha_y_hora')->first();

        Mail::to($destinatarios)->queue(new AlertaResueltaMail(
            $freezer,
            $dispositivo,
            $alerta,
            $ahora,
            $ultimaMedicion?->temperatura,
            $observacion
        ));
    }

    /**
     * Evaluar auto-resolución de alertas pendientes basándose en N lecturas consecutivas positivas.
     *
     * En lugar de usar una ventana temporal de 5 minutos, ahora se toman las últimas N mediciones
     * (configurado en lecturas_para_auto_resolucion, default 5) y se verifica que TODAS
     * cumplan las condiciones de normalidad para el tipo de alerta.
     *
     * Solo se ejecuta si auto_resolucion_activa está habilitado en la configuración del sistema.
     */
    public static function procesarAutoResoluciones(?int $dispositivoId = null): void
    {
        $config = ConfiguracionSistema::getSolo();

        // Si la auto-resolución está desactivada, no hacer nada
        if (!$config->auto_resolucion_activa) {
            return;
        }

        $lecturasNecesarias = (int)($config->lecturas_para_auto_resolucion ?? 5);
        $ahora = now('America/Montevideo');

        $query = AlertaGenerada::with(['dispositivo.freezer.muestras', 'alerta'])
            ->where('estado', '<', 2);

        if ($dispositivoId) {
            $query->where('dispositivo_id', $dispositivoId);
        }

        $alertasPendientes = $query->get();

        foreach ($alertasPendientes as $alertaGenerada) {
            $dispositivo = $alertaGenerada->dispositivo;
            $alerta = $alertaGenerada->alerta;
            if (!$dispositivo || !$alerta) continue;

            $tipo = $alerta->tipo;

            // Obtener las últimas N mediciones POSTERIORES a la creación de la alerta
            $ultimasMediciones = Medicion::where('dispositivo_id', $dispositivo->id)
                ->where('fecha_y_hora', '>', $alertaGenerada->fecha_y_hora)
                ->orderBy('fecha_y_hora', 'desc')
                ->limit($lecturasNecesarias)
                ->get();

            // Si no hay suficientes lecturas posteriores a la alerta, no se puede auto-resolver
            if ($ultimasMediciones->count() < $lecturasNecesarias) {
                // Excepción: Muestra Vencida no depende de mediciones
                if ($tipo !== 'Muestra Vencida') {
                    continue;
                }
            }

            // 1. Corte de Energía Eléctrica
            if ($tipo === 'Corte de Energía Eléctrica') {
                // Las N últimas mediciones deben indicar que NO hay corte (bateria == false)
                $huboCorteEnUltimas = $ultimasMediciones->contains('bateria', true);
                $todasTempEnRango = self::validarTemperaturaEnRango($dispositivo, $ultimasMediciones);

                if (!$huboCorteEnUltimas && $todasTempEnRango) {
                    self::resolverAlertaYNotificar(
                        $alertaGenerada,
                        "Resuelto automáticamente: Red eléctrica restaurada y temperatura normal durante {$lecturasNecesarias} lecturas consecutivas. Se recomienda revisar el dispositivo para prevenir fallas futuras."
                    );
                }
            }

            // 2. Temperatura Fuera de Rango (Superior o Inferior)
            elseif ($tipo === 'Temperatura Fuera de Rango Superior' || $tipo === 'Temperatura Fuera de Rango Inferior') {
                $todasTempEnRango = self::validarTemperaturaEnRango($dispositivo, $ultimasMediciones);

                if ($todasTempEnRango) {
                    self::resolverAlertaYNotificar(
                        $alertaGenerada,
                        "Resuelto automáticamente: Temperatura dentro del rango normal durante {$lecturasNecesarias} lecturas consecutivas. Se recomienda revisar el dispositivo para prevenir fallas futuras."
                    );
                }
            }

            // 3. Dispositivo Inactivo
            elseif ($tipo === 'Dispositivo Inactivo') {
                // Para inactividad: basta con que el dispositivo haya vuelto a transmitir
                // (que existan mediciones posteriores a la alerta y la última esté dentro del umbral)
                $ultimaMedicion = Medicion::where('dispositivo_id', $dispositivo->id)
                    ->latest('fecha_y_hora')
                    ->first();

                if ($ultimaMedicion && Carbon::parse($ultimaMedicion->fecha_y_hora)->gt(Carbon::parse($alertaGenerada->fecha_y_hora))) {
                    $minutosInactividad = (int)($dispositivo->minutos_inactividad ?? 30);
                    $limiteReciente = $ahora->copy()->subMinutes($minutosInactividad);

                    if (Carbon::parse($ultimaMedicion->fecha_y_hora)->gte($limiteReciente)) {
                        self::resolverAlertaYNotificar(
                            $alertaGenerada,
                            "Resuelto automáticamente: El dispositivo volvió a transmitir telemetría correctamente. Se recomienda revisar el dispositivo para prevenir fallas futuras."
                        );
                    }
                }
            }

            // 4. Muestra Vencida
            elseif ($tipo === 'Muestra Vencida') {
                // Verificar si aún existen muestras activas vencidas para el freezer/dispositivo
                $hayMuestrasVencidas = false;
                if ($dispositivo->freezer) {
                    $hayMuestrasVencidas = Muestra::where('freezer_id', $dispositivo->freezer_id)
                        ->where('estado', 'activo')
                        ->whereNotNull('vencimiento')
                        ->where('vencimiento', '<=', $ahora)
                        ->exists();
                }

                if (!$hayMuestrasVencidas) {
                    self::resolverAlertaYNotificar(
                        $alertaGenerada,
                        'Resuelto automáticamente: La muestra vencida fue eliminada, desactivada o actualizada con nueva fecha de vencimiento.'
                    );
                }
            }

            // 5. Fallo de Módulo SMS
            elseif ($tipo === 'Fallo de Módulo SMS') {
                // Las N últimas mediciones deben tener modem_ok == true
                $huboFalloModemEnUltimas = $ultimasMediciones->contains('modem_ok', false);

                if (!$huboFalloModemEnUltimas) {
                    self::resolverAlertaYNotificar(
                        $alertaGenerada,
                        "Resuelto automáticamente: El módulo celular reanudó su operación normal durante {$lecturasNecesarias} lecturas consecutivas. Se recomienda revisar el dispositivo para prevenir fallas futuras."
                    );
                }
            }
        }
    }

    // Auxiliar para comprobar si todas las mediciones de una colección están en el rango térmico seguro.
    private static function validarTemperaturaEnRango(Dispositivo $dispositivo, $mediciones): bool
    {
        $muestrasActivasConRango = collect();
        if ($dispositivo->freezer) {
            $muestrasActivasConRango = $dispositivo->freezer->muestras
                ->where('estado', 'activo')
                ->filter(fn($m) => !is_null($m->temperatura_minima) && !is_null($m->temperatura_maxima));
        }

        foreach ($mediciones as $medicion) {
            $temp = $medicion->temperatura;

            if ($muestrasActivasConRango->count() > 0) {
                foreach ($muestrasActivasConRango as $muestra) {
                    if ($temp < $muestra->temperatura_minima || $temp > $muestra->temperatura_maxima) {
                        return false;
                    }
                }
            } else {
                $tempMin = $dispositivo->temp_min_default ?? -25.0;
                $tempMax = $dispositivo->temp_max_default ?? -10.0;
                if ($temp < $tempMin || $temp > $tempMax) {
                    return false;
                }
            }
        }

        return true;
    }
}
