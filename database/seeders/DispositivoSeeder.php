<?php

namespace Database\Seeders;

use App\Models\Dispositivo;
use App\Models\Freezer;
use Illuminate\Database\Seeder;

class DispositivoSeeder extends Seeder
{
    public function run(): void
    {
        $freezers = Freezer::all();

        foreach ($freezers as $freezer) {

            Dispositivo::updateOrCreate(
                [
                    'freezer_id' => $freezer->id
                ],
                [
                    'nombre' => 'Dispositivo '.$freezer->id,
                    'descripcion' => 'ESP32 Monitor de temperatura',
                ]
            );

        }
    }
}