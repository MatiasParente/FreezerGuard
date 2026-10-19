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
        Schema::create('historial_muestra', function (Blueprint $table) {
            $table->id();
            $table->foreignId('muestra_id')->nullable()->constrained('muestras')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('freezer_id')->nullable()->constrained('freezers')->nullOnDelete();
            $table->string('nombre_muestra')->nullable();
            $table->enum('accion', ['Ingreso', 'Retiro','Eliminacion'])->default('ingreso')->nullable();
            $table->dateTime('fecha')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_muestra');
    }
};
