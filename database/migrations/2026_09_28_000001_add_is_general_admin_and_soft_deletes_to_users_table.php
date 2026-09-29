<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_general_admin')) {
                $table->boolean('is_general_admin')->default(false)->after('password');
            }
            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Set matiasparente2020@gmail.com as general admin
        $targetEmail = 'matiasparente2020@gmail.com';
        $user = DB::table('users')->where('email', $targetEmail)->first();

        if ($user) {
            DB::table('users')->where('id', $user->id)->update([
                'is_general_admin' => true,
            ]);
        } else {
            DB::table('users')->insert([
                'name' => 'Matías Parente',
                'email' => $targetEmail,
                'password' => Hash::make('password123'),
                'is_general_admin' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_general_admin')) {
                $table->dropColumn('is_general_admin');
            }
            if (Schema::hasColumn('users', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
