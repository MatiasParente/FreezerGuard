<?php

namespace Database\Seeders;

use App\Models\Laboratorio;
use App\Models\Sede;
use Illuminate\Database\Seeder;

class SedeSeeder extends Seeder
{
    public function run(): void
    {
        // --- Sede 1: UTEC ---
        $sedeUtec = Sede::firstOrCreate(['nombre' => 'UTEC - Fray Bentos']);
        Laboratorio::firstOrCreate(['sede_id' => $sedeUtec->id, 'nombre' => 'Laboratorio de Biotecnología']);
        Laboratorio::firstOrCreate(['sede_id' => $sedeUtec->id, 'nombre' => 'Laboratorio de Microbiología']);

        // --- Sede 2: CURE (UdelaR) ---
        $sedeCure = Sede::firstOrCreate(['nombre' => 'CURE - Maldonado']);
        Laboratorio::firstOrCreate(['sede_id' => $sedeCure->id, 'nombre' => 'Laboratorio de Bioquímica']);

        // --- Sede 3: IIBCE ---
        $sedeIibce = Sede::firstOrCreate(['nombre' => 'IIBCE - Montevideo']);
        Laboratorio::firstOrCreate(['sede_id' => $sedeIibce->id, 'nombre' => 'Laboratorio de Genómica']);
        Laboratorio::firstOrCreate(['sede_id' => $sedeIibce->id, 'nombre' => 'Laboratorio de Neurociencias']);
    }
}
