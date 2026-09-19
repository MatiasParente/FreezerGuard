<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MedicionesController;
use App\Http\Controllers\MuestrasController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\AlertasController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::controller(DashboardController::class)->middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', 'index')->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::controller(MedicionesController::class)->group(function () {
    Route::get('/mediciones', 'index')->name('mediciones.mediciones');
    Route::get('/mediciones/{medicion}', 'show')->name('mediciones.show');
    Route::delete('/mediciones/{medicion}', 'destroy')->name('mediciones.destroy');
});

Route::controller(MuestrasController::class)->group(function () {
    Route::get('/muestras', 'index')->name('muestras.muestras');
    Route::post('/muestras', 'store')->name('muestras.store');
    Route::put('/muestras/{muestra}', 'update')->name('muestras.update');
    Route::delete('/muestras/{muestra}', 'destroy')->name('muestras.destroy');
    Route::get('/muestras/{muestra}', 'show')->name('muestras.show');
});

Route::controller(ConfiguracionController::class)->group(function () {
    Route::get('/configuracion', 'index')->name('configuracion.configuracion');
    Route::get('/configuración', 'index'); // Alias for legacy/browser URL with accent
    Route::post('/configuracion/dispositivo', 'storeDispositivo')->name('configuracion.dispositivo.store');
    Route::put('/configuracion/dispositivo/{dispositivo}', 'updateDispositivo')->name('configuracion.dispositivo.update');
    Route::delete('/configuracion/dispositivo/{dispositivo}', 'destroyDispositivo')->name('configuracion.dispositivo.destroy');
    Route::post('/configuracion/dispositivo/{id}/restore', 'restoreDispositivo')->name('configuracion.dispositivo.restore');
    Route::delete('/configuracion/dispositivo/{id}/force', 'forceDeleteDispositivo')->name('configuracion.dispositivo.forceDelete');
    Route::put('/configuracion/sistema', 'updateSistemaConfig')->name('configuracion.sistema.update');
    Route::get('/configuracion/{configuracion}', 'show')->name('configuracion.show');
});

Route::controller(AlertasController::class)->group(function () {
    Route::get('/alertas', 'index')->name('alertas.alertas');
    Route::get('/alertas/{alerta}', 'show')->name('alertas.show');
    Route::put('/alertas/{alertaGenerada}', 'update')->name('alertas.update');
    Route::delete('/alertas/{alertaGenerada}', 'destroy')->name('alertas.destroy');
});

require __DIR__.'/auth.php';

Route::get('/alertas/resolver/{alertaGenerada}', function (\App\Models\AlertaGenerada $alertaGenerada) {
    if ($alertaGenerada->estado == 2) {
        return view('alertas.resuelta');
    }

    \App\Services\AlertNotificationService::resolverAlertaYNotificar(
        $alertaGenerada,
        'Resuelto manualmente por el usuario a través de enlace firmado de correo.'
    );

    return view('alertas.resuelta');
})->name('alertas.resolver')->middleware('signed:relative');
