<?php

namespace Database\Seeders;

use App\Models\Freezer;
use App\Models\Muestra;
use App\Models\Sede;
use App\Models\User;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class MuestraSeeder extends Seeder
{
    public function run(): void
    {
        $sedeUtec = Sede::where('nombre', 'UTEC - Fray Bentos')->firstOrFail();
        $fA1      = Freezer::where('ubicacion', 'Freezer A1 - Biotecnología')->firstOrFail();
        $fA2      = Freezer::where('ubicacion', 'Freezer A2 - Biotecnología')->firstOrFail();
        $admin    = User::where('email', 'matiasparente2020@gmail.com')->firstOrFail();

        // Participantes
        $juan = Usuario::firstOrCreate(
            ['email' => 'juan.perez@estudiante.utec.edu.uy'],
            ['nombre' => 'Juan Pérez', 'telefono' => '598091111111']
        );
        $juan->sedes()->syncWithoutDetaching([$sedeUtec->id]);

        $maria = Usuario::firstOrCreate(
            ['email' => 'maria.gomez@estudiante.utec.edu.uy'],
            ['nombre' => 'María Gómez', 'telefono' => '598092222222']
        );
        $maria->sedes()->syncWithoutDetaching([$sedeUtec->id]);

        // Muestra 1 — solo estudiantes
        $m1 = Muestra::create([
            'freezer_id'         => $fA1->id,
            'titulo'             => 'Ensayo Biológico A - Cepas Resistentes',
            'descripcion'        => 'Evaluación de cepas bacterianas con resistencia térmica.',
            'cantidad'           => 50,
            'vencimiento'        => now()->addMonths(6),
            'temperatura_minima' => -25.0,
            'temperatura_maxima' => -15.0,
            'observaciones'      => 'Manipular con EPP nivel 2.',
            'fecha_inicio'       => now()->subDays(10),
        ]);
        $m1->usuarios()->attach([$juan->id, $maria->id]);

        // Muestra 2 — admin + un estudiante
        $m2 = Muestra::create([
            'freezer_id'         => $fA1->id,
            'titulo'             => 'Proteínas Recombinantes lote PR-2026-01',
            'descripcion'        => 'Proteínas para desarrollo de kits de diagnóstico rápido.',
            'cantidad'           => 20,
            'vencimiento'        => now()->addYear(),
            'temperatura_minima' => -20.0,
            'temperatura_maxima' => -15.0,
            'observaciones'      => 'Almacenar en alícuotas de 500 µL.',
            'fecha_inicio'       => now()->subDays(5),
        ]);
        $m2->users()->attach([$admin->id]);
        $m2->usuarios()->attach([$juan->id]);

        // Muestra 3 — solo admin
        $m3 = Muestra::create([
            'freezer_id'         => $fA2->id,
            'titulo'             => 'Muestra de Referencia (Control)',
            'descripcion'        => 'Muestra de control interno para auditorías.',
            'cantidad'           => 10,
            'vencimiento'        => now()->addYears(2),
            'temperatura_minima' => -20.0,
            'temperatura_maxima' => -10.0,
            'observaciones'      => 'Acceso restringido a administradores.',
            'fecha_inicio'       => now()->subWeek(),
        ]);
        $m3->users()->attach([$admin->id]);
    }
}
