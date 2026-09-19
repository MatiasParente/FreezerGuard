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
            if (!Schema::hasColumn('dispositivos', 'alerta_modem_activa')) {
                $table->boolean('alerta_modem_activa')->default(true)->after('alerta_inactividad_activa');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dispositivos', function (Blueprint $table) {
            if (Schema::hasColumn('dispositivos', 'alerta_modem_activa')) {
                $table->dropColumn('alerta_modem_activa');
            }
        });
    }
};
