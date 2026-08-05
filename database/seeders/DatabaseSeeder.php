<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            FreezerSeeder::class,
            MuestraSeeder::class,
            AlertaSeeder::class,
            DispositivoSeeder::class,
            MedicionSeeder::class,
        ]);
    }
}
