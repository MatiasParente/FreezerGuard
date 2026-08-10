<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'matias.parente@estudiantes.utec.edu.uy'],
            [
                'name' => 'Matias Parente',
                'telefono' => '123456789',
                'id_telegram' => '123456',
                'password' => bcrypt('password123'),
            ]
        );
    }
}
