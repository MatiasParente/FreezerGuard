<?php

namespace Database\Seeders;

use App\Models\{Laboratorio, Sede};
use Illuminate\Database\Seeder;

class SedeSeeder extends Seeder
{
    public function run(): void
    {
        $sede = Sede::firstOrCreate(['nombre' => 'Sede demo']);
        Laboratorio::firstOrCreate(['sede_id' => $sede->id, 'nombre' => 'Laboratorio demo']);
    }
}
