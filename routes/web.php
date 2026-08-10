<?php

use App\Http\Controllers\ProfileController;
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
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/alertas/resolver/{alertaGenerada}', function (\App\Models\AlertaGenerada $alertaGenerada) {
    if ($alertaGenerada->estado == 2) {
        return view('alertas.resuelta'); // O puedes crear una vista 'ya_resuelta' si prefieres algo distinto
    }

    $alertaGenerada->update([
        'estado' => 2,
        'fecha_y_hora_resuelto' => now(),
    ]);

    return view('alertas.resuelta');
})->name('alertas.resolver')->middleware('signed');
