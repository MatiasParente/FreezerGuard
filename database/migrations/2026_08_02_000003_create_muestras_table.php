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
            $table->foreignId('freezer_id')->nullable()->constrained('freezers')->cascadeOnDelete();
            $table->string('titulo')->nullable();
            $table->text('descripcion')->nullable();
            $table->float('cantidad')->nullable();
            $table->dateTime('vencimiento')->nullable();
            $table->decimal('temperatura_minima', 5, 2)->nullable();
            $table->decimal('temperatura_maxima', 5, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->dateTime('fecha_inicio')->nullable();
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
