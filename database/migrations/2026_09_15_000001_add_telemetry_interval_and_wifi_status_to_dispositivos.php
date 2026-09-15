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
        Schema::table('dispositivos', function (Blueprint $table) {
            $table->integer('intervalo_telemetria')->default(5); // en segundos
            $table->integer('wifi_status')->default(0); // 0 = sin cambios, 1 = exito, 2 = error
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dispositivos', function (Blueprint $table) {
            $table->dropColumn(['intervalo_telemetria', 'wifi_status']);
        });
    }
};
