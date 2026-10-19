<?php

namespace Database\Seeders;

use App\Models\Sede;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $sedeUtec  = Sede::where('nombre', 'UTEC - Fray Bentos')->firstOrFail();
        $sedeCure  = Sede::where('nombre', 'CURE - Maldonado')->firstOrFail();
        $sedeIibce = Sede::where('nombre', 'IIBCE - Montevideo')->firstOrFail();

        // --- Admin general (ya creado por la migración, lo actualizamos/completamos) ---
        $adminGeneral = User::updateOrCreate(
            ['email' => 'matiasparente2020@gmail.com'],
            [
                'name'             => 'Matías Parente',
                'telefono'         => '598099123456',
                'id_telegram'      => '123456789',
                'password'         => bcrypt('password123'),
                'is_general_admin' => true,
            ]
        );
        // El admin general tiene acceso a todas las sedes
        $adminGeneral->sedes()->syncWithoutDetaching([
            $sedeUtec->id,
            $sedeCure->id,
            $sedeIibce->id,
        ]);

        // --- Admin de sede UTEC ---
        $adminUtec = User::updateOrCreate(
            ['email' => 'matias.parente@estudiantes.utec.edu.uy'],
            [
                'name'        => 'Matias Parente (UTEC)',
                'telefono'    => '598091111111',
                'id_telegram' => '111111111',
                'password'    => bcrypt('password123'),
            ]
        );
        $adminUtec->sedes()->syncWithoutDetaching([$sedeUtec->id]);

        // --- Admin de sede CURE ---
        $adminCure = User::updateOrCreate(
            ['email' => 'admin.cure@udelar.edu.uy'],
            [
                'name'        => 'Ana García',
                'telefono'    => '598092222222',
                'id_telegram' => '222222222',
                'password'    => bcrypt('password123'),
            ]
        );
        $adminCure->sedes()->syncWithoutDetaching([$sedeCure->id]);

        // --- Admin de sede IIBCE ---
        $adminIibce = User::updateOrCreate(
            ['email' => 'admin.iibce@pasteur.edu.uy'],
            [
                'name'        => 'Carlos Rodríguez',
                'telefono'    => '598093333333',
                'id_telegram' => '333333333',
                'password'    => bcrypt('password123'),
            ]
        );
        $adminIibce->sedes()->syncWithoutDetaching([$sedeIibce->id]);
    }
}
