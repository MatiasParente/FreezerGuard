<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Freezer;
use App\Models\Laboratorio;

class FreezerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lab = Laboratorio::where('nombre', 'Laboratorio demo')->firstOrFail();
        Freezer::updateOrCreate(
            ['ubicacion' => 'Laboratorio Principal'],
            ['laboratorio_id' => $lab->id]
        );

        Freezer::updateOrCreate(
            ['ubicacion' => 'Depósito de Muestras 2'],
            ['laboratorio_id' => $lab->id]
        );
    }
}
