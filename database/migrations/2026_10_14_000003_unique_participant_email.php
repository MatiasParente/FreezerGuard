<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('usuarios')
            ->selectRaw('LOWER(TRIM(email)) AS normalized_email')
            ->groupByRaw('LOWER(TRIM(email))')
            ->havingRaw('COUNT(*) > 1')
            ->exists();

        if ($duplicates) {
            throw new RuntimeException('Hay participantes con correos repetidos. Revisarlos antes de crear la restricción única.');
        }

        if (DB::getDriverName() === 'sqlite') {
            DB::statement('CREATE UNIQUE INDEX usuarios_email_normalized_unique ON usuarios (LOWER(TRIM(email)))');
        } else {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->unique('email', 'usuarios_email_unique');
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('DROP INDEX usuarios_email_normalized_unique');
        } else {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->dropUnique('usuarios_email_unique');
            });
        }
    }
};
