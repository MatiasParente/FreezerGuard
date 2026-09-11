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
            $table->boolean('alerta_temperatura_activa')->default(true);
            $table->boolean('alerta_bateria_activa')->default(true);
            $table->boolean('alerta_vencimiento_activa')->default(true);
            $table->boolean('alerta_inactividad_activa')->default(false);
            $table->decimal('temp_min_default', 5, 2)->default(-25.0);
            $table->decimal('temp_max_default', 5, 2)->default(-10.0);
            $table->string('wifi_ssid')->nullable();
            $table->string('wifi_password')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dispositivos', function (Blueprint $table) {
            $table->dropColumn([
                'alerta_temperatura_activa',
                'alerta_bateria_activa',
                'alerta_vencimiento_activa',
                'alerta_inactividad_activa',
                'temp_min_default',
                'temp_max_default',
                'wifi_ssid',
                'wifi_password',
            ]);
        });
    }
};
