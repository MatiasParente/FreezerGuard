<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Alerta;

class AlertaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $alertas = [
            [
                'tipo' => 'Temperatura Fuera de Rango Superior',
                'descripcion' => 'La temperatura registrada supera el límite máximo permitido (Ej: > -10°C).',
            ],
            [
                'tipo' => 'Temperatura Fuera de Rango Inferior',
                'descripcion' => 'La temperatura registrada es inferior al límite mínimo permitido (Ej: < -20°C).',
            ],
            [
                'tipo' => 'Corte de Energía Eléctrica',
                'descripcion' => 'Se ha detectado una interrupción en el suministro de corriente (Corriente = false).',
            ],
            [
                'tipo' => 'Restablecimiento de Energía Eléctrica',
                'descripcion' => 'El suministro de corriente ha sido restablecido (Corriente = true tras un corte).',
            ],
            [
                'tipo' => 'Muestra Vencida',
                'descripcion' => 'Una o más muestras activas han superado su fecha límite de vencimiento.',
            ],
            [
                'tipo' => 'Dispositivo Inactivo',
                'descripcion' => 'El dispositivo ha dejado de enviar mediciones por un período prolongado.',
            ],
        ];

        foreach ($alertas as $alerta) {
            Alerta::updateOrCreate(
                ['tipo' => $alerta['tipo']],
                [
                    'descripcion' => $alerta['descripcion'],
                ]
            );
        }
    }
}
