<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Sede;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'matias.parente@estudiantes.utec.edu.uy'],
            [
                'name' => 'Matias Parente',
                'telefono' => '123456789',
                'id_telegram' => '123456',
                'password' => bcrypt('password123'),
            ]
        );
        $user->sedes()->syncWithoutDetaching(Sede::where('nombre', 'Sede demo')->firstOrFail()->id);
    }
}
