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
            'fecha_y_hora' => $data['timestamp'],
        ]);

        $alertasGeneradas = [];

        //verificar temperatura
        $this->verificarTemperatura($medicion, $alertasGeneradas);

        //verificar corriente
        if (isset($data['corriente_activa'])) {
            $this->verificarCorriente($medicion, $data['corriente_activa'], $alertasGeneradas);
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

                if ($alerta && $this->debeEnviarAlerta($medicion->dispositivo_id, $alerta->id)) {
                    $alertasGeneradas[] = $this->registrarYEnviarAlerta($medicion, $alerta, $muestra);
                }
            }
        }
    }

    public function verificarCorriente(Medicion $medicion, bool $corrienteActiva, array &$alertasGeneradas)
    {
        if (!$corrienteActiva) {
            $alerta = \App\Models\Alerta::where('tipo', 'Corte de Energía Eléctrica')->first();
            
            // Asumimos que notificamos sobre cualquier muestra en ese freezer, tomamos la primera
            $muestra = $medicion->dispositivo->freezer->muestras->first();

            if ($alerta && $muestra && $this->debeEnviarAlerta($medicion->dispositivo_id, $alerta->id)) {
                $alertasGeneradas[] = $this->registrarYEnviarAlerta($medicion, $alerta, $muestra);
            }
        }
    }

    private function debeEnviarAlerta($dispositivoId, $alertaId): bool
    {
        // Verificar si ya se envió esta misma alerta para este dispositivo en la última hora
        $alertaExiste = \App\Models\AlertaGenerada::where('dispositivo_id', $dispositivoId)
            ->where('alerta_id', $alertaId)
            ->where('fecha_y_hora', '>=', now()->subHour())
            ->exists();

        return !$alertaExiste;
    }

    private function registrarYEnviarAlerta(Medicion $medicion, $alerta, $muestra)
    {
        // Crear registro en alertas_generadas
        $alertaGenerada = \App\Models\AlertaGenerada::create([
            'dispositivo_id' => $medicion->dispositivo_id,
            'alerta_id' => $alerta->id,
            'fecha_y_hora' => $medicion->fecha_y_hora,
        ]);

        // Enviar correo a los administradores de la muestra
        $users = $muestra->users; // Administradores asignados a la muestra

        foreach ($users as $user) {
            \Illuminate\Support\Facades\Mail::to($user->email)
                ->send(new \App\Mail\AlertaTemperaturaMail($muestra, $medicion, $alerta));
        }

        return $alertaGenerada;
    }
}
