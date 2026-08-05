<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Muestra;
use App\Models\User;
use App\Models\Usuario;
use App\Models\Freezer;

class MuestraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::first(); 
        $freezer1 = Freezer::where('ubicacion', 'Laboratorio Principal')->first();
        
        //crear un par de estudiatnes
        $estudiante1 = Usuario::firstOrCreate(
            ['email' => 'juan.perez@estudiante.com'],
            ['nombre' => 'Juan Perez', 'telefono' => '11111111']
        );
        
        $estudiante2 = Usuario::firstOrCreate(
            ['email' => 'maria.gomez@estudiante.com'],
            ['nombre' => 'Maria Gomez', 'telefono' => '22222222']
        );

        //crear una muestra solo para estudiantes (Admin no asignado)
        $muestra1 = Muestra::create([
            'freezer_id' => $freezer1->id,
            'titulo' => 'Ensayo Biológico A (Solo Estudiantes)',
            'descripcion' => 'Ensayo biológico de cepas tipo A para evaluación de resistencia térmica.',
            'cantidad' => 50,
            'vencimiento' => now()->addMonths(6),
            'temperatura_minima' => -25.0,
            'temperatura_maxima' => -15.0,
            'observaciones' => 'Manipular con equipo de protección nivel 2.',
            'fecha_inicio' => now(),
        ]);
        
        $muestra1->usuarios()->attach([$estudiante1->id, $estudiante2->id]);

        //crear una muestra solo para admin(sin estudiantes)
        $muestra2 = Muestra::create([
            'freezer_id' => $freezer1->id,
            'titulo' => 'Muestra de Referencia (Solo Admin)',
            'descripcion' => 'Muestra de control y referencia para auditorías internas.',
            'cantidad' => 10,
            'vencimiento' => now()->addYears(2),
            'temperatura_minima' => -30.0,
            'temperatura_maxima' => -20.0,
            'observaciones' => 'Acceso restringido únicamente para personal administrador.',
            'fecha_inicio' => now()->subDays(2),
        ]);

        $muestra2->users()->attach([$admin->id]);

        //crear una muestra para un grupo mixto(Admin + Estudiantes)
        $muestra3 = Muestra::create([
            'freezer_id' => $freezer1->id,
            'titulo' => 'Proyecto Final (Grupo Mixto)',
            'descripcion' => 'Proyecto final de biotecnología sobre conservación a largo plazo.',
            'cantidad' => 120,
            'vencimiento' => now()->addMonths(3),
            'temperatura_minima' => -22.0,
            'temperatura_maxima' => -18.0,
            'observaciones' => 'Revisar estado de congelación semanalmente.',
            'fecha_inicio' => now()->subWeek(),
        ]);
        
        $muestra3->users()->attach([$admin->id]);
        $muestra3->usuarios()->attach([$estudiante1->id]);
    }
}
