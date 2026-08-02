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
            ['email' => 'admin@freezerguard.com'],
            [
                'name' => 'Administrador',
                'telefono' => '123456789',
                'password' => bcrypt('password123'),
            ]
        );
    }
}
