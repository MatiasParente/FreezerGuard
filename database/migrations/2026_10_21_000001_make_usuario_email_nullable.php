<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Quitar la restricción unique anterior (si existe)
        if (DB::getDriverName() === 'sqlite') {
            // SQLite: recrear sin el índice unique — el framework no soporta dropIndex condicional
            try {
                DB::statement('DROP INDEX usuarios_email_normalized_unique');
            } catch (\Throwable $e) {
                // ya no existía
            }
        } else {
            Schema::table('usuarios', function (Blueprint $table) {
                try {
                    $table->dropUnique('usuarios_email_unique');
                } catch (\Throwable $e) {
                    // ya no existía
                }
            });
        }

        // Hacer la columna nullable
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });

        // Recrear unique solo para valores no nulos (solo MySQL/Postgres lo necesitan)
        if (DB::getDriverName() !== 'sqlite') {
            // En MySQL un unique normal ya ignora NULLs por definición del estándar
            Schema::table('usuarios', function (Blueprint $table) {
                $table->unique('email', 'usuarios_email_unique');
            });
        } else {
            DB::statement('CREATE UNIQUE INDEX usuarios_email_nullable_unique ON usuarios (email) WHERE email IS NOT NULL');
        }
    }

    public function down(): void
    {
        // Quitar unique
        if (DB::getDriverName() === 'sqlite') {
            try {
                DB::statement('DROP INDEX usuarios_email_nullable_unique');
            } catch (\Throwable $e) {}
        } else {
            Schema::table('usuarios', function (Blueprint $table) {
                try { $table->dropUnique('usuarios_email_unique'); } catch (\Throwable $e) {}
            });
        }

        // Restaurar email NOT NULL
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });

        // Recrear unique original
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('CREATE UNIQUE INDEX usuarios_email_normalized_unique ON usuarios (LOWER(TRIM(email)))');
        } else {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->unique('email', 'usuarios_email_unique');
            });
        }
    }
};
