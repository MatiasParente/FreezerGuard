<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\DocenteAsignadoMuestraMail;
use App\Models\Muestra;
use App\Models\Freezer;
use App\Models\User;
use App\Models\Usuario;
use App\Support\SedeAccess;
use Illuminate\Validation\ValidationException;

class MuestrasController extends Controller
{
    public function index(Request $request)
    {
        $query = SedeAccess::scope(Muestra::with(['freezer.laboratorio', 'freezer.dispositivo.alertasGeneradas' => function ($q) {
            $q->where('estado', 1); // 1 = Pendiente
        }, 'users', 'usuarios']), $request->user(), 'freezer.laboratorio');

        if ($request->filled('freezer_id')) {
            $query->where('freezer_id', $request->freezer_id);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        } else {
            // Por defecto mostrar activos
            $query->where('estado', 'activo');
        }

        $muestras = $query->orderBy('fecha_inicio', 'desc')->paginate(10)->withQueryString();

        $muestrasCollection = collect($muestras->items())->map(function ($muestra) {
            $hasAlert = false;
            if ($muestra->freezer && $muestra->freezer->dispositivo) {
                if ($muestra->freezer->dispositivo->alertasGeneradas->count() > 0) {
                    $hasAlert = true;
                }
            }
            $muestra->has_active_alert = $hasAlert;
            return $muestra;
        })->sortByDesc('has_active_alert')->values();

        $muestras->setCollection($muestrasCollection);

        return Inertia::render('Muestras/muestras', [
            'muestras' => $muestras,
            'filters' => $request->only(['freezer_id', 'estado']),
            'freezers' => SedeAccess::scope(Freezer::select('id', 'ubicacion', 'laboratorio_id')->with(['laboratorio.sede', 'dispositivo:id,freezer_id,nombre']), $request->user())->orderBy('ubicacion')->get(),
            'users' => $request->user()->is_general_admin ? User::with('sedes:id')->select('id', 'name', 'email')->get() : User::with('sedes:id')->whereHas('sedes', fn ($q) => $q->whereIn('sedes.id', $request->user()->sedes()->select('sedes.id')))->select('id', 'name', 'email')->get(),
            'usuarios' => $request->user()->is_general_admin ? Usuario::with('sedes:id')->select('id', 'nombre', 'email')->get() : Usuario::with('sedes:id')->whereHas('sedes', fn ($q) => $q->whereIn('sedes.id', $request->user()->sedes()->select('sedes.id')))->select('id', 'nombre', 'email')->get(),
        ]);
    }

    public function show(Request $request, Muestra $muestra)
    {
        $muestra = SedeAccess::find(Muestra::query(), $request->user(), 'freezer.laboratorio', $muestra->id);
        $muestra->load(['freezer.dispositivo', 'users', 'usuarios']);

        return Inertia::render('Muestras/show', [
            'muestra' => $muestra,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cantidad' => 'nullable|numeric',
            'vencimiento' => 'nullable|date',
            'temperatura_minima' => 'nullable|numeric',
            'temperatura_maxima' => 'nullable|numeric',
            'observaciones' => 'nullable|string',
            'freezer_id' => 'required|exists:freezers,id',
            'usuarios_ids' => 'array',
            'usuarios_ids.*' => 'exists:usuarios,id',
            'users_ids' => 'array',
            'users_ids.*' => 'exists:users,id',
        ]);

        $this->validateAssignments($request, $validated);
        $validated['temperatura_minima'] = $validated['temperatura_minima'] ?? -25.0;
        $validated['temperatura_maxima'] = $validated['temperatura_maxima'] ?? -10.0;
        $validated['estado'] = 'activo';
        $validated['fecha_inicio'] = now();

        // Si no hay docentes asignados, asignar el usuario actual por defecto
        if (empty($validated['users_ids'])) {
            $validated['users_ids'] = $request->user()->is_general_admin ? [] : [$request->user()->id];
        }

        $muestra = Muestra::create($validated);

        if (!empty($validated['usuarios_ids'])) {
            $muestra->usuarios()->attach($validated['usuarios_ids']);
        }
        if (!empty($validated['users_ids'])) {
            $muestra->users()->attach($validated['users_ids']);
        }

        // Enviar mail a los docentes asignados
        $this->notificarDocentesAsignados($muestra, $validated['users_ids'] ?? []);

        return redirect()->back()->with('success', 'Muestra creada exitosamente.');
    }

    public function update(Request $request, Muestra $muestra)
    {
        $muestra = SedeAccess::find(Muestra::query(), $request->user(), 'freezer.laboratorio', $muestra->id);
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cantidad' => 'nullable|numeric',
            'vencimiento' => 'nullable|date',
            'temperatura_minima' => 'nullable|numeric',
            'temperatura_maxima' => 'nullable|numeric',
            'observaciones' => 'nullable|string',
            'freezer_id' => 'required|exists:freezers,id',
            'estado' => 'required|in:activo,inactivo',
            'usuarios_ids' => 'array',
            'usuarios_ids.*' => 'exists:usuarios,id',
            'users_ids' => 'array',
            'users_ids.*' => 'exists:users,id',
        ]);

        $this->validateAssignments($request, array_merge($validated, [
            'users_ids' => $validated['users_ids'] ?? $muestra->users()->withTrashed()->pluck('users.id')->all(),
            'usuarios_ids' => $validated['usuarios_ids'] ?? $muestra->usuarios()->pluck('usuarios.id')->all(),
        ]));
        $docentesAntes = $muestra->users()->withTrashed()->pluck('users.id')->all();

        $muestra->update($validated);

        if (isset($validated['usuarios_ids'])) {
            $muestra->usuarios()->sync($validated['usuarios_ids']);
        }
        if (isset($validated['users_ids'])) {
            $muestra->users()->sync($validated['users_ids']);
            // Enviar mail solo a los docentes nuevos
            $docentesNuevosIds = array_diff($validated['users_ids'], $docentesAntes);
            $this->notificarDocentesAsignados($muestra, $docentesNuevosIds);
        }

        return redirect()->back()->with('success', 'Muestra actualizada exitosamente.');
    }

    public function destroy(Request $request, Muestra $muestra)
    {
        $muestra = SedeAccess::find(Muestra::query(), $request->user(), 'freezer.laboratorio', $muestra->id);
        if ($muestra->estado !== 'inactivo') {
            return redirect()->back()->with('error', 'Solo se pueden eliminar muestras inactivas.');
        }

        $muestra->delete();
        return redirect()->back()->with('success', 'Muestra eliminada permanentemente.');
    }

    private function validateAssignments(Request $request, array $data): void
    {
        $freezer = SedeAccess::scope(Freezer::with('laboratorio'), $request->user())->find($data['freezer_id']);
        if (!$freezer?->laboratorio) {
            throw ValidationException::withMessages(['freezer_id' => 'El freezer debe pertenecer a un laboratorio de una sede permitida.']);
        }
        $sedeId = $freezer->laboratorio->sede_id;
        $userIds = $data['users_ids'] ?? ($request->isMethod('post') && !$request->user()->is_general_admin ? [$request->user()->id] : []);
        if ($userIds && User::withTrashed()->whereIn('id', $userIds)->whereDoesntHave('sedes', fn ($q) => $q->where('sedes.id', $sedeId))->exists()) {
            throw ValidationException::withMessages(['users_ids' => 'Los usuarios deben pertenecer a la sede del freezer.']);
        }
        if (!empty($data['usuarios_ids']) && Usuario::whereIn('id', $data['usuarios_ids'])->whereDoesntHave('sedes', fn ($q) => $q->where('sedes.id', $sedeId))->exists()) {
            throw ValidationException::withMessages(['usuarios_ids' => 'Los participantes deben pertenecer a la sede del freezer.']);
        }
    }

    private function notificarDocentesAsignados(Muestra $muestra, array $userIds): void
    {
        if (empty($userIds)) {
            return;
        }

        $docentes = User::whereIn('id', $userIds)->get();
        $muestra->load('freezer');

        foreach ($docentes as $docente) {
            try {
                Mail::to($docente->email)->send(new DocenteAsignadoMuestraMail($docente, $muestra));
            } catch (\Exception $e) {
            }
        }
    }
}
