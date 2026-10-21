<?php

namespace App\Http\Controllers;

use App\Models\{AlertaGenerada, ConfiguracionSistema, Freezer, Laboratorio, Muestra, Sede, User, Usuario};
use App\Services\AlertNotificationService;
use App\Support\SedeAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SedesController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('participante', ''));
        $participantes = Usuario::with('sedes:id,nombre')->orderBy('nombre');
        if ($search !== '') {
            $participantes->where(fn ($query) => $query
                ->where('nombre', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }
        return Inertia::render('Sedes/Index', [
            'sedes' => Sede::with('laboratorios.freezers')
                ->withCount(['users' => fn ($query) => $query->withTrashed(), 'usuarios'])
                ->orderBy('nombre')->get(),
            'freezersSinLaboratorio' => Freezer::whereNull('laboratorio_id')->get(['id', 'ubicacion']),
            'usuarios' => $participantes->paginate(10)->withQueryString(),
            'filtrosParticipantes' => ['participante' => $search],
            'seccionActiva' => $request->query('seccion') === 'participantes' ? 'participantes' : 'estructura',
            'alertasSinDestinatarios' => AlertaGenerada::where('estado', 0)
                ->with('dispositivo.freezer.laboratorio')
                ->get()
                ->filter(fn ($alerta) => !AlertNotificationService::obtenerDestinatarios($alerta->dispositivo))
                ->count(),
            'correoDesactivado' => !ConfiguracionSistema::getSolo()->envio_email_activo,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['nombre' => ['required', 'string', 'max:255', 'unique:sedes,nombre']]);
        Sede::create($data);
        return back()->with('success', 'Sede creada.');
    }

    public function update(Request $request, Sede $sede)
    {
        $data = $request->validate(['nombre' => ['required', 'string', 'max:255', Rule::unique('sedes', 'nombre')->ignore($sede->id)]]);
        $sede->update($data);
        return back()->with('success', 'Sede actualizada.');
    }

    public function destroy(Sede $sede)
    {
        DB::transaction(function () use ($sede) {
            $sede = Sede::whereKey($sede->id)->lockForUpdate()->firstOrFail();
            if ($sede->laboratorios()->exists()
                || DB::table('sede_user')->where('sede_id', $sede->id)->exists()
                || DB::table('sede_usuario')->where('sede_id', $sede->id)->exists()) {
                throw ValidationException::withMessages(['sede' => 'La sede todavía tiene laboratorios o personas asignadas. Reasígnalos antes de eliminarla.']);
            }
            $sede->delete();
        });

        return back()->with('success', 'Sede eliminada.');
    }

    public function storeLaboratorio(Request $request)
    {
        $data = $request->validate([
            'sede_id' => ['required', 'integer', 'exists:sedes,id'],
            'nombre' => ['required', 'string', 'max:255', Rule::unique('laboratorios', 'nombre')->where('sede_id', $request->sede_id)],
        ]);
        Laboratorio::create($data);
        return back()->with('success', 'Laboratorio creado.');
    }

    public function updateLaboratorio(Request $request, Laboratorio $laboratorio)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('laboratorios', 'nombre')->where('sede_id', $laboratorio->sede_id)->ignore($laboratorio->id)],
        ]);
        $laboratorio->update($data);
        return back()->with('success', 'Laboratorio actualizado.');
    }

    public function destroyLaboratorio(Laboratorio $laboratorio)
    {
        DB::transaction(function () use ($laboratorio) {
            $laboratorio = Laboratorio::whereKey($laboratorio->id)->lockForUpdate()->firstOrFail();
            if ($laboratorio->freezers()->exists()) {
                throw ValidationException::withMessages(['laboratorio' => 'El laboratorio tiene freezers. Reasígnalos antes de eliminarlo.']);
            }
            $laboratorio->delete();
        });

        return back()->with('success', 'Laboratorio eliminado.');
    }

    public function assignFreezer(Request $request, Freezer $freezer)
    {
        $data = $request->validate(['laboratorio_id' => ['required', 'integer', 'exists:laboratorios,id']]);
        $sedeId = Laboratorio::findOrFail($data['laboratorio_id'])->sede_id;
        if ($freezer->users()->withTrashed()->whereDoesntHave('sedes', fn ($sites) => $sites->where('sedes.id', $sedeId))->exists()) {
            throw ValidationException::withMessages(['laboratorio_id' => 'Hay responsables directos del freezer que no pertenecen a la nueva sede.']);
        }
        if (Muestra::where('freezer_id', $freezer->id)->where(function ($query) use ($sedeId) {
            $query->whereHas('users', fn ($people) => $people->withTrashed()->whereDoesntHave('sedes', fn ($sites) => $sites->where('sedes.id', $sedeId)))
                ->orWhereHas('usuarios', fn ($people) => $people->whereDoesntHave('sedes', fn ($sites) => $sites->where('sedes.id', $sedeId)));
        })->exists()) {
            throw ValidationException::withMessages(['laboratorio_id' => 'Hay participantes de muestras que no pertenecen a la nueva sede.']);
        }
        $freezer->update($data);
        return back()->with('success', 'Freezer asignado al laboratorio.');
    }

    public function storeParticipante(Request $request)
    {
        $email = $request->input('email');
        $request->merge(['email' => $email ? mb_strtolower(trim($email)) : null]);
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'email' => $this->participantEmailRules(),
            'telefono' => ['nullable', 'string', 'max:255'],
            'sede_ids' => ['required', 'array', 'min:1'],
            'sede_ids.*' => ['required', 'integer', 'distinct', 'exists:sedes,id'],
        ]);
        DB::transaction(function () use ($data) {
            $usuario = Usuario::create($data);
            $usuario->sedes()->sync($data['sede_ids']);
        });
        $response = back()->with('success', 'Participante creado.');
        return $this->warnIfLoginSharesEmail($response, $data['email'] ?? null);
    }

    public function updateParticipante(Request $request, Usuario $usuario)
    {
        $email = $request->input('email');
        $request->merge(['email' => $email ? mb_strtolower(trim($email)) : null]);
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'email' => $this->participantEmailRules($usuario),
            'telefono' => ['nullable', 'string', 'max:255'],
            'sede_ids' => ['required', 'array', 'min:1'],
            'sede_ids.*' => ['required', 'integer', 'distinct', 'exists:sedes,id'],
        ]);
        SedeAccess::validateSampleMembership($usuario, $data['sede_ids']);
        DB::transaction(function () use ($usuario, $data) {
            $usuario->update($data);
            $usuario->sedes()->sync($data['sede_ids']);
        });
        $response = back()->with('success', 'Participante actualizado.');
        return $this->warnIfLoginSharesEmail($response, $data['email'] ?? null);
    }

    private function participantEmailRules(?Usuario $ignore = null): array
    {
        return ['nullable', 'email', 'max:255', function ($attribute, $value, $fail) use ($ignore) {
            if (empty($value)) return;
            $query = Usuario::whereRaw('LOWER(email) = ?', [mb_strtolower($value)]);
            if ($ignore) {
                $query->where('id', '!=', $ignore->id);
            }
            if ($query->exists()) {
                $fail('Este correo ya pertenece a otro participante.');
            }
        }];
    }

    private function warnIfLoginSharesEmail($response, ?string $email)
    {
        if ($email && User::withTrashed()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            $response->with('warning', 'Este correo también pertenece a una cuenta de acceso. Se permitió porque son registros diferentes.');
        }

        return $response;
    }
}
