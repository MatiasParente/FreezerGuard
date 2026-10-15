<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sede_user', function (Blueprint $table) {
            $table->index('user_id', 'sede_user_user_id_index');
        });
        Schema::table('sede_usuario', function (Blueprint $table) {
            $table->index('usuario_id', 'sede_usuario_usuario_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('sede_user', function (Blueprint $table) {
            $table->dropIndex('sede_user_user_id_index');
        });
        Schema::table('sede_usuario', function (Blueprint $table) {
            $table->dropIndex('sede_usuario_usuario_id_index');
        });
    }
};
