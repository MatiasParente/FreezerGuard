<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Orden de ejecución:
     *   1. SedeSeeder      → crea sedes y laboratorios
     *   2. UserSeeder      → crea usuarios admin y los asocia a sedes
     *   3. FreezerSeeder   → crea freezers asignados a laboratorios
     *   4. AlertaSeeder    → crea los tipos de alertas del sistema
     *   5. DispositivoSeeder → crea un ESP32 por freezer
     *   6. MuestraSeeder   → crea muestras y participantes (Usuarios)
     *   7. MedicionSeeder  → genera historial de mediciones por dispositivo
     */
    public function run(): void
    {
        $this->call([
            SedeSeeder::class,
            UserSeeder::class,
            FreezerSeeder::class,
            AlertaSeeder::class,
            DispositivoSeeder::class,
            MuestraSeeder::class,
            MedicionSeeder::class,
        ]);
    }
}
