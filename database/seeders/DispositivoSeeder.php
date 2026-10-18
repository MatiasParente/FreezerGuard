<?php

namespace Database\Seeders;

use App\Models\Dispositivo;
use App\Models\Freezer;
use Illuminate\Database\Seeder;

class DispositivoSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'Freezer A1 - Biotecnología' => 'ESP32-UTEC-BIO-01',
            'Freezer A2 - Biotecnología' => 'ESP32-UTEC-BIO-02',
        ];

        foreach ($map as $ubicacion => $nombre) {
            $freezer = Freezer::where('ubicacion', $ubicacion)->firstOrFail();

            Dispositivo::updateOrCreate(
                ['freezer_id' => $freezer->id],
                [
                    'nombre'      => $nombre,
                    'descripcion' => 'Monitor de temperatura ESP32 con módulo A7670G',
                ]
            );
        }
    }
}