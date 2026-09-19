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
        Schema::table('configuraciones_sistema', function (Blueprint $table) {
            if (!Schema::hasColumn('configuraciones_sistema', 'email_default')) {
                $table->string('email_default')->nullable()->after('intervalo_correos');
            }
            if (!Schema::hasColumn('configuraciones_sistema', 'envio_email_activo')) {
                $table->boolean('envio_email_activo')->default(true)->after('email_default');
            }
            if (!Schema::hasColumn('configuraciones_sistema', 'envio_sms_activo')) {
                $table->boolean('envio_sms_activo')->default(true)->after('envio_email_activo');
            }
            if (!Schema::hasColumn('configuraciones_sistema', 'plantilla_sms_cuerpo')) {
                $table->text('plantilla_sms_cuerpo')->nullable()->after('plantilla_email_cuerpo');
            }
        });

        Schema::table('dispositivos', function (Blueprint $table) {
            if (!Schema::hasColumn('dispositivos', 'alerta_modem_activa')) {
                $table->boolean('alerta_modem_activa')->default(true)->after('alerta_inactividad_activa');
            }
            if (!Schema::hasColumn('dispositivos', 'telefonos_sms')) {
                $table->text('telefonos_sms')->nullable()->after('wifi_password');
            }
            if (!Schema::hasColumn('dispositivos', 'sim_pin')) {
                $table->string('sim_pin', 10)->nullable()->after('telefonos_sms');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuraciones_sistema', function (Blueprint $table) {
            $table->dropColumn([
                'email_default',
                'envio_email_activo',
                'envio_sms_activo',
                'plantilla_sms_cuerpo',
            ]);
        });

        Schema::table('dispositivos', function (Blueprint $table) {
            $table->dropColumn([
                'alerta_modem_activa',
                'telefonos_sms',
                'sim_pin',
            ]);
        });
    }
};
