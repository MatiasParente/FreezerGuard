<?php

namespace Database\Seeders;

use App\Models\Dispositivo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MedicionSeeder extends Seeder
{
    public function run(): void
    {
        $dispositivos = Dispositivo::all();

        $temperaturas = [
            'ESP32-UTEC-BIO-01' => -20.0,
            'ESP32-UTEC-BIO-02' => -18.5,
        ];

        foreach ($dispositivos as $dispositivo) {
            $base = $temperaturas[$dispositivo->nombre] ?? -20.0;

            DB::table('mediciones')->insert([
                'dispositivo_id' => $dispositivo->id,
                'temperatura'    => $base,
                'bateria'        => true,
                'modem_ok'       => true,
                'fecha_y_hora'   => now()->toDateTimeString(),
                'created_at'     => now()->toDateTimeString(),
                'updated_at'     => now()->toDateTimeString(),
            ]);
        }
    }
}