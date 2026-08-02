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
                'codigo' => 101,
                'tipo' => 'Temperatura Fuera de Rango Superior',
                'descripcion' => 'La temperatura registrada supera el límite máximo permitido (Ej: > -10°C).',
            ],
            [
                'codigo' => 102,
                'tipo' => 'Temperatura Fuera de Rango Inferior',
                'descripcion' => 'La temperatura registrada es inferior al límite mínimo permitido (Ej: < -20°C).',
            ],
            [
                'codigo' => 201,
                'tipo' => 'Corte de Energía Eléctrica',
                'descripcion' => 'Se ha detectado una interrupción en el suministro de corriente (Corriente = false).',
            ],
            [
                'codigo' => 202,
                'tipo' => 'Restablecimiento de Energía Eléctrica',
                'descripcion' => 'El suministro de corriente ha sido restablecido (Corriente = true tras un corte).',
            ],
        ];

        foreach ($alertas as $alerta) {
            Alerta::updateOrCreate(
                ['codigo' => $alerta['codigo']],
                [
                    'tipo' => $alerta['tipo'],
                    'descripcion' => $alerta['descripcion'],
                ]
            );
        }
    }
}
