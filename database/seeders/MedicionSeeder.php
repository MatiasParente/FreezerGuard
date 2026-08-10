<?php

namespace Database\Seeders;

use App\Models\Dispositivo;
use App\Models\Medicion;
use Illuminate\Database\Seeder;

class MedicionSeeder extends Seeder
{
    public function run(): void
    {
        $dispositivos = Dispositivo::all();

        foreach ($dispositivos as $dispositivo) {

            Medicion::create([
                'dispositivo_id' => $dispositivo->id,
                'temperatura' => -18.5,
                'bateria' => false,
                'fecha_y_hora' => now(),
            ]);

        }
    }
}