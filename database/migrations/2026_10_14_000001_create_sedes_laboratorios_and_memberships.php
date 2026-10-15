<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sedes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->timestamps();
        });

        Schema::create('laboratorios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sede_id')->constrained('sedes')->restrictOnDelete();
            $table->string('nombre');
            $table->timestamps();
            $table->unique(['sede_id', 'nombre']);
        });

        Schema::table('freezers', function (Blueprint $table) {
            // Existing freezers must be assigned explicitly before this can be NOT NULL.
            $table->foreignId('laboratorio_id')->nullable()->constrained('laboratorios')->restrictOnDelete();
        });

        Schema::create('sede_user', function (Blueprint $table) {
            $table->foreignId('sede_id')->constrained('sedes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->primary(['sede_id', 'user_id']);
        });

        Schema::create('sede_usuario', function (Blueprint $table) {
            $table->foreignId('sede_id')->constrained('sedes')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->primary(['sede_id', 'usuario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sede_usuario');
        Schema::dropIfExists('sede_user');
        Schema::table('freezers', fn (Blueprint $table) => $table->dropConstrainedForeignId('laboratorio_id'));
        Schema::dropIfExists('laboratorios');
        Schema::dropIfExists('sedes');
    }
};
