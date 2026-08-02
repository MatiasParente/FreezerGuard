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
        Schema::create('muestras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freezer_id')->constrained('freezers')->cascadeOnDelete();
            $table->string('titulo');
            $table->string('descripcion')->nullable();
            $table->integer('lote')->nullable();
            $table->integer('cantidad')->nullable();
            $table->date('vencimiento')->nullable();
            $table->float('temperatura_minima')->nullable();
            $table->float('temperatura_maxima')->nullable();
            $table->string('observacion')->nullable();
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('muestras');
    }
};
