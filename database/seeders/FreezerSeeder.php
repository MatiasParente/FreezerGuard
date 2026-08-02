<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Freezer;

class FreezerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Freezer::updateOrCreate(
            ['ubicacion' => 'Laboratorio Principal'],
            []
        );

        Freezer::updateOrCreate(
            ['ubicacion' => 'Depósito de Muestras 2'],
            []
        );
    }
}
