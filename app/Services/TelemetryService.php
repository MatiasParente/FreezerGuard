<?php

namespace App\Services;
use App\Models\Medicion;

class TelemetryService
{
    public function handleData(array $data): array
    {
        $medicion = Medicion::create([
            'dispositivo_id' => $data['device_id'],
            'temperatura' => $data['temperature'],
            'bateria' => $data['bateria'] ?? false,
            'fecha_y_hora' => $data['timestamp'],
        ]);

        $alertasGeneradas = [];

        //verificar temperatura
        $this->verificarTemperatura($medicion, $alertasGeneradas);

        //verificar corriente
        if (isset($data['bateria'])) {
            $this->verificarCorriente($medicion, $data['bateria'], $alertasGeneradas);
        }

        $message = empty($alertasGeneradas) 
            ? 'Medición guardada correctamente' 
            : 'Medición guardada. Se generaron ' . count($alertasGeneradas) . ' alerta(s).';

        return [
            'success' => true,
            'message' => $message,
            'data' => $medicion,
            'alertas' => $alertasGeneradas,
        ];
    }

    public function verificarTemperatura(Medicion $medicion, array &$alertasGeneradas)
    {
        $muestras = $medicion
            ->dispositivo
            ->freezer
            ->muestras;

        foreach($muestras as $muestra)
        {
            $temp = $medicion->temperatura;

            if (
                $temp < $muestra->temperatura_minima ||
                $temp > $muestra->temperatura_maxima
            ) {
                //Determinar el tipo de alerta
                $tipoAlerta = $temp > $muestra->temperatura_maxima
                    ? 'Temperatura Fuera de Rango Superior'
                    : 'Temperatura Fuera de Rango Inferior';

                $alerta = \App\Models\Alerta::where('tipo', $tipoAlerta)->first();

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
            $alerta = \App\Models\Alerta::where('tipo', 'Corte de Energía Eléctrica')->first();

            if ($alerta && $this->debeGenerarAlerta($medicion->dispositivo_id, $alerta->id)) {
                $alertasGeneradas[] = $this->registrarAlerta($medicion, $alerta);
            }
        }
    }

    private function debeGenerarAlerta($dispositivoId, $alertaId): bool
    {
        // Verificar si ya existe una alerta de este tipo para este dispositivo que NO esté resuelta (estado < 2)
        $alertaSinResolver = \App\Models\AlertaGenerada::where('dispositivo_id', $dispositivoId)
            ->where('alerta_id', $alertaId)
            ->where('estado', '<', 2)
            ->exists();

        return !$alertaSinResolver;
    }

    private function registrarAlerta(Medicion $medicion, $alerta)
    {
        // Crear registro en alertas_generadas con estado = 0 (No enviado)
        // El envío se manejará con una tarea programada (Cron Job)
        return \App\Models\AlertaGenerada::create([
            'dispositivo_id' => $medicion->dispositivo_id,
            'alerta_id' => $alerta->id,
            'fecha_y_hora' => $medicion->fecha_y_hora,
            'estado' => 0,
        ]);
    }
}
