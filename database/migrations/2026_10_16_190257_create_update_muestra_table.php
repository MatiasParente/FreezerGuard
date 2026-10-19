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
        Schema::create('update_muestra', function (Blueprint $table) {
            $table->id();
            $table->foreignId('muestra_id')->nullable()->constrained('muestras')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('freezer_id')->nullable()->constrained('freezers')->nullOnDelete();
            $table->string('nombre_muestra')->nullable();
            $table->decimal('temp_min_old', 5, 2)->nullable();
            $table->decimal('temp_max_old', 5, 2)->nullable();
            $table->decimal('temp_min_new', 5, 2)->nullable();
            $table->decimal('temp_max_new', 5, 2)->nullable();
            $table->dateTime('fecha')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('update_muestra');
    }
};
