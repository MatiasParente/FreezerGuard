<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use App\Mail\NuevoUsuarioCreadoMail;
use App\Mail\PasswordResetAdminMail;
use App\Mail\UsuarioDesactivadoMail;
use App\Mail\UsuarioRestauradoMail;
use App\Mail\UsuarioEliminadoDefinitivoMail;
use Tests\TestCase;

class UsuariosTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_general_admin_cannot_access_usuarios_page(): void
    {
        $user = User::factory()->create(['is_general_admin' => false]);

        $response = $this->actingAs($user)->get('/usuarios');

        $response->assertStatus(403);
    }

    public function test_general_admin_can_access_usuarios_page(): void
    {
        $admin = User::factory()->create(['is_general_admin' => true]);

        $response = $this->actingAs($admin)->get('/usuarios');

        $response->assertOk();
    }

    public function test_general_admin_can_create_new_user_and_send_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_general_admin' => true]);

        $response = $this->actingAs($admin)->post('/usuarios', [
            'name' => 'Nuevo Admin',
            'email' => 'nuevoadmin@example.com',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Nuevo Admin',
            'email' => 'nuevoadmin@example.com',
            'is_general_admin' => false,
        ]);

        Mail::assertSent(NuevoUsuarioCreadoMail::class);
    }

    public function test_general_admin_can_reset_password_for_user(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_general_admin' => true]);
        $targetUser = User::factory()->create(['is_general_admin' => false]);

        $response = $this->actingAs($admin)->post("/usuarios/{$targetUser->id}/reset-password");

        $response->assertRedirect();

        Mail::assertSent(PasswordResetAdminMail::class);
    }

    public function test_general_admin_can_soft_delete_restore_and_force_delete_user_with_emails(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_general_admin' => true]);
        $targetUser = User::factory()->create(['is_general_admin' => false]);

        // Soft Delete
        $response = $this->actingAs($admin)->delete("/usuarios/{$targetUser->id}");
        $response->assertRedirect();
        $this->assertSoftDeleted($targetUser);
        Mail::assertSent(UsuarioDesactivadoMail::class);

        // Restore
        $responseRestore = $this->actingAs($admin)->post("/usuarios/{$targetUser->id}/restore");
        $responseRestore->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'deleted_at' => null,
        ]);
        Mail::assertSent(UsuarioRestauradoMail::class);

        // Force Delete
        $targetUser->delete(); // soft delete again to test force delete
        $responseForce = $this->actingAs($admin)->delete("/usuarios/{$targetUser->id}/force-delete");
        $responseForce->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
        Mail::assertSent(UsuarioEliminadoDefinitivoMail::class);
    }
}
