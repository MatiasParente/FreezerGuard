<?php

namespace App\Services;

use App\Models\Medicion;
use App\Models\Dispositivo;
use App\Models\Alerta;
use App\Models\AlertaGenerada;
use Carbon\Carbon;

class TelemetryService
{
    public function handleData(array $data): array
    {
        // Siempre usamos la hora oficial de Montevideo para evitar que timestamps desincronizados del ESP32 (ej: 1970) contaminen la BD
        $fechaYHora = now('America/Montevideo');

        $medicion = Medicion::create([
            'dispositivo_id' => $data['device_id'],
            'temperatura' => $data['temperature'],
            'bateria' => $data['bateria'] ?? false,
            'fecha_y_hora' => $fechaYHora,
        ]);

        $dispositivo = Dispositivo::with('freezer.muestras')->find($data['device_id']);
        $alertasGeneradas = [];

        // Verificar temperatura (respetando toggle)
        if ($dispositivo && $dispositivo->alerta_temperatura_activa) {
            $this->verificarTemperatura($medicion, $dispositivo, $alertasGeneradas);
        }

        // Verificar corriente (respetando toggle)
        if ($dispositivo && $dispositivo->alerta_bateria_activa && isset($data['bateria'])) {
            $this->verificarCorriente($medicion, $data['bateria'], $alertasGeneradas);
        }

        // Calcular configuración segura para enviar al ESP32
        $configuracionCalculada = $this->obtenerConfiguracionSegura($dispositivo);

        $message = empty($alertasGeneradas) 
            ? 'Medición guardada correctamente' 
            : 'Medición guardada. Se generaron ' . count($alertasGeneradas) . ' alerta(s).';

        return [
            'success' => true,
            'message' => $message,
            'data' => $medicion,
            'alertas' => $alertasGeneradas,
            'server_time' => $fechaYHora->toIso8601String(),
            'configuracion' => $configuracionCalculada,
        ];
    }

    public function verificarTemperatura(Medicion $medicion, Dispositivo $dispositivo, array &$alertasGeneradas)
    {
        $muestrasActivasConRango = collect();
        if ($dispositivo->freezer) {
            $muestrasActivasConRango = $dispositivo->freezer->muestras
                ->where('estado', 'activo')
                ->filter(fn($m) => !is_null($m->temperatura_minima) && !is_null($m->temperatura_maxima));
        }

        $temp = $medicion->temperatura;

        if ($muestrasActivasConRango->count() > 0) {
            // Verificar contra cada muestra individual
            foreach ($muestrasActivasConRango as $muestra) {
                if ($temp < $muestra->temperatura_minima || $temp > $muestra->temperatura_maxima) {
                    $tipoAlerta = $temp > $muestra->temperatura_maxima
                        ? 'Temperatura Fuera de Rango Superior'
                        : 'Temperatura Fuera de Rango Inferior';

                    $alerta = Alerta::where('tipo', $tipoAlerta)->first();

                    if ($alerta && $this->debeGenerarAlerta($medicion->dispositivo_id, $alerta->id)) {
                        $alertasGeneradas[] = $this->registrarAlerta($medicion, $alerta);
                    }
                }
            }
        } else {
            // Si no hay muestras activas con rango definido, evaluar contra los defaults del dispositivo
            $tempMin = $dispositivo->temp_min_default ?? -25.0;
            $tempMax = $dispositivo->temp_max_default ?? -10.0;

            if ($temp < $tempMin || $temp > $tempMax) {
                $tipoAlerta = $temp > $tempMax
                    ? 'Temperatura Fuera de Rango Superior'
                    : 'Temperatura Fuera de Rango Inferior';

                $alerta = Alerta::where('tipo', $tipoAlerta)->first();

                if ($alerta && $this->debeGenerarAlerta($medicion->dispositivo_id, $alerta->id)) {
                    $alertasGeneradas[] = $this->registrarAlerta($medicion, $alerta);
                }
            }
        }
    }

    public function verificarCorriente(Medicion $medicion, bool $bateria, array &$alertasGeneradas)
    {
        // bateria == true significa que hubo corte de corriente y está usando la batería
        if ($bateria) {
            $alerta = Alerta::where('tipo', 'Corte de Energía Eléctrica')->first();

            if ($alerta && $this->debeGenerarAlerta($medicion->dispositivo_id, $alerta->id)) {
                $alertasGeneradas[] = $this->registrarAlerta($medicion, $alerta);
            }
        }
    }

    private function obtenerConfiguracionSegura(?Dispositivo $dispositivo): array
    {
        if (!$dispositivo) {
            return [
                'temp_min' => -25.0,
                'temp_max' => -10.0,
                'wifi_ssid' => null,
                'wifi_password' => null,
            ];
        }

        $muestrasActivasConRango = collect();
        if ($dispositivo->freezer) {
            $muestrasActivasConRango = $dispositivo->freezer->muestras
                ->where('estado', 'activo')
                ->filter(fn($m) => !is_null($m->temperatura_minima) && !is_null($m->temperatura_maxima));
        }

        if ($muestrasActivasConRango->count() > 0) {
            // Para proteger todas las muestras: el mínimo más alto y el máximo más bajo
            $tempMin = $muestrasActivasConRango->max('temperatura_minima');
            $tempMax = $muestrasActivasConRango->min('temperatura_maxima');
        } else {
            $tempMin = $dispositivo->temp_min_default ?? -25.0;
            $tempMax = $dispositivo->temp_max_default ?? -10.0;
        }

        return [
            'temp_min' => (float)$tempMin,
            'temp_max' => (float)$tempMax,
            'alerta_temperatura_activa' => $dispositivo->alerta_temperatura_activa ? true : false,
            'alerta_bateria_activa' => $dispositivo->alerta_bateria_activa ? true : false,
            'wifi_ssid' => $dispositivo->wifi_ssid ?? "",
            'wifi_password' => $dispositivo->wifi_password ?? "",
        ];
    }

    private function debeGenerarAlerta($dispositivoId, $alertaId): bool
    {
        $alertaSinResolver = AlertaGenerada::where('dispositivo_id', $dispositivoId)
            ->where('alerta_id', $alertaId)
            ->where('estado', '<', 2)
            ->exists();

        return !$alertaSinResolver;
    }

    private function registrarAlerta(Medicion $medicion, $alerta)
    {
        return AlertaGenerada::create([
            'dispositivo_id' => $medicion->dispositivo_id,
            'alerta_id' => $alerta->id,
            'fecha_y_hora' => $medicion->fecha_y_hora,
            'estado' => 0,
        ]);
    }
}

