<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuraciones_sistema', function (Blueprint $table) {
            if (!Schema::hasColumn('configuraciones_sistema', 'auto_resolucion_activa')) {
                $table->boolean('auto_resolucion_activa')->default(true)->after('envio_sms_activo');
            }
            if (!Schema::hasColumn('configuraciones_sistema', 'lecturas_para_auto_resolucion')) {
                $table->unsignedSmallInteger('lecturas_para_auto_resolucion')->default(5)->after('auto_resolucion_activa');
            }
        });
    }

    public function down(): void
    {
        Schema::table('configuraciones_sistema', function (Blueprint $table) {
            $table->dropColumn([
                'auto_resolucion_activa',
                'lecturas_para_auto_resolucion',
            ]);
        });
    }
};
