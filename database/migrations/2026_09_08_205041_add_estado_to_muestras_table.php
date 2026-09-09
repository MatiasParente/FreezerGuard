<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('muestras', function (Blueprint $table) {
            if (!Schema::hasColumn('muestras', 'estado')) {
                $table->enum('estado', ['activo', 'inactivo'])->default('activo')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('muestras', function (Blueprint $table) {
            if (Schema::hasColumn('muestras', 'estado')) {
                $table->dropColumn('estado');
            }
        });
    }
};
