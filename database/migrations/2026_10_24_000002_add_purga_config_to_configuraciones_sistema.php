<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuraciones_sistema', function (Blueprint $table) {
            if (!Schema::hasColumn('configuraciones_sistema', 'purga_automatica_activa')) {
                $table->boolean('purga_automatica_activa')->default(true)->after('lecturas_para_auto_resolucion');
            }
            if (!Schema::hasColumn('configuraciones_sistema', 'purga_dias_antiguedad')) {
                $table->unsignedSmallInteger('purga_dias_antiguedad')->default(30)->after('purga_automatica_activa');
            }
            if (!Schema::hasColumn('configuraciones_sistema', 'purga_hora')) {
                $table->string('purga_hora', 5)->default('03:00')->after('purga_dias_antiguedad');
            }
        });
    }

    public function down(): void
    {
        Schema::table('configuraciones_sistema', function (Blueprint $table) {
            $table->dropColumn([
                'purga_automatica_activa',
                'purga_dias_antiguedad',
                'purga_hora',
            ]);
        });
    }
};
