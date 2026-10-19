<?php

namespace Database\Seeders;

use App\Models\Freezer;
use App\Models\Laboratorio;
use Illuminate\Database\Seeder;

class FreezerSeeder extends Seeder
{
    public function run(): void
    {
        $lab = Laboratorio::whereHas('sede', fn ($q) => $q->where('nombre', 'UTEC - Fray Bentos'))
            ->where('nombre', 'Laboratorio de Biotecnología')
            ->firstOrFail();

        Freezer::updateOrCreate(
            ['ubicacion' => 'Freezer A1 - Biotecnología'],
            ['laboratorio_id' => $lab->id]
        );

        Freezer::updateOrCreate(
            ['ubicacion' => 'Freezer A2 - Biotecnología'],
            ['laboratorio_id' => $lab->id]
        );
    }
}
