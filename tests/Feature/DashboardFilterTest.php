<?php

namespace Tests\Feature;

use App\Models\Alerta;
use App\Models\AlertaGenerada;
use App\Models\Dispositivo;
use App\Models\Freezer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_device_filter_applies_before_alert_count_and_pagination(): void
    {
        $user = User::factory()->create();
        $first = Dispositivo::create(['nombre' => 'Primero', 'freezer_id' => Freezer::create(['ubicacion' => 'Laboratorio'])->id]);
        $second = Dispositivo::create(['nombre' => 'Segundo', 'freezer_id' => Freezer::create(['ubicacion' => 'Depósito'])->id]);
        $type = Alerta::create(['tipo' => 'Temperatura']);
        $target = AlertaGenerada::create(['dispositivo_id' => $first->id, 'alerta_id' => $type->id, 'fecha_y_hora' => now()->subDays(2), 'estado' => 1]);
        for ($i = 0; $i < 12; $i++) {
            AlertaGenerada::create(['dispositivo_id' => $second->id, 'alerta_id' => $type->id, 'fecha_y_hora' => now()->subMinutes($i), 'estado' => 0]);
        }

        $this->actingAs($user)->get('/dashboard?dispositivo_id='.$first->id)
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('alertasSinResolverCount', 1)
                ->where('alertas.total', 1)
                ->has('alertas.data', 1)
                ->where('alertas.data.0.id', $target->id)
                ->where('alertas.data.0.dispositivo_id', $first->id));

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where('alertasSinResolverCount', 13)
                ->where('alertas.total', 13)
                ->has('alertas.data', 10));
    }

    public function test_unknown_device_filter_is_rejected(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/dashboard?dispositivo_id=9999')
            ->assertSessionHasErrors('dispositivo_id');
    }
}
