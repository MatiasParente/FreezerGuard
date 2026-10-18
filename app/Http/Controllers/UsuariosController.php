<?php

namespace App\Http\Controllers;

use App\Mail\NuevoUsuarioCreadoMail;
use App\Mail\PasswordResetAdminMail;
use App\Mail\PrivilegiosModificadosMail;
use App\Mail\UsuarioAsignadoSedeMail;
use App\Mail\UsuarioDesactivadoMail;
use App\Mail\UsuarioRestauradoMail;
use App\Mail\UsuarioEliminadoDefinitivoMail;
use App\Models\User;
use App\Models\Sede;
use App\Support\SedeAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UsuariosController extends Controller
{
    public function index(Request $request): Response
    {
        $estado = $request->input('estado', 'activo');
        $search = trim($request->input('search', ''));

        $query = User::query();

        if ($estado === 'inactivo') {
            $query->onlyTrashed();
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $usuarios = $query->latest($estado === 'inactivo' ? 'deleted_at' : 'created_at')
            ->with('sedes:id,nombre')
            ->paginate(10)
            ->withQueryString();

        $totalActivos = User::count();
        $totalInactivos = User::onlyTrashed()->count();

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
            'filters' => [
                'estado' => $estado,
                'search' => $search,
            ],
            'totalActivos' => $totalActivos,
            'totalInactivos' => $totalInactivos,
            'sedes' => Sede::orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'sede_ids' => ['required', 'array', 'min:1'],
            'sede_ids.*' => ['required', 'integer', 'distinct', 'exists:sedes,id'],
        ], [
            'name.required' => 'El nombre de usuario es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingrese un correo electrónico válido.',
            'email.unique' => 'Este correo electrónico ya se encuentra registrado.',
        ]);

        // Generar contraseña aleatoria de 8 caracteres
        $plainPassword = Str::password(8, letters: true, numbers: true, symbols: false);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($plainPassword),
            'is_general_admin' => false,
        ]);
        $user->sedes()->sync($request->input('sede_ids'));

        // Enviar mail con las credenciales
        try {
            Mail::to($user->email)->send(new NuevoUsuarioCreadoMail($user, $plainPassword));
        } catch (\Exception $e) {
            return redirect()->back()->with('warning', 'Usuario creado correctamente, pero no se pudo enviar el correo de credenciales: ' . $e->getMessage());
        }

        // Enviar mail de asignación a sedes
        try {
            $sedesAsignadas = Sede::whereIn('id', $request->input('sede_ids'))->get();
            if ($sedesAsignadas->isNotEmpty()) {
                Mail::to($user->email)->send(new UsuarioAsignadoSedeMail($user, $sedesAsignadas));
            }
        } catch (\Exception $e) {
            // No interrumpir el flujo si falla el correo de sedes
        }

        return redirect()->back()->with('success', "Usuario {$user->name} creado correctamente. Se envió la contraseña de 8 caracteres a {$user->email}.");
    }

    public function updateSedes(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'sede_ids' => ['required', 'array', 'min:1'],
            'sede_ids.*' => ['required', 'integer', 'distinct', 'exists:sedes,id'],
        ]);
        SedeAccess::validateSampleMembership($user, $data['sede_ids']);

        $sedesAntes = $user->sedes()->pluck('sedes.id')->all();
        $sedesNuevasIds = array_diff($data['sede_ids'], $sedesAntes);

        $user->sedes()->sync($data['sede_ids']);

        // Enviar mail solo por las sedes nuevas
        if (!empty($sedesNuevasIds)) {
            try {
                $sedesNuevas = Sede::whereIn('id', $sedesNuevasIds)->get();
                if ($sedesNuevas->isNotEmpty()) {
                    Mail::to($user->email)->send(new UsuarioAsignadoSedeMail($user, $sedesNuevas));
                }
            } catch (\Exception $e) {
                return back()->with('warning', 'Sedes actualizadas, pero no se pudo enviar la notificación por correo.');
            }
        }

        return back()->with('success', 'Sedes asignadas al usuario.');
    }

    public function resetPassword(Request $request, string $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        // Generar contraseña aleatoria de 8 caracteres
        $plainPassword = Str::password(8, letters: true, numbers: true, symbols: false);

        $user->update([
            'password' => Hash::make($plainPassword),
        ]);

        // Enviar mail con la nueva contraseña
        try {
            Mail::to($user->email)->send(new PasswordResetAdminMail($user, $plainPassword));
        } catch (\Exception $e) {
            return redirect()->back()->with('warning', 'Contraseña actualizada, pero no se pudo enviar el correo: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', "Contraseña restablecida con éxito para {$user->name}. Se envió la nueva clave a {$user->email}.");
    }

    public function toggleAdmin(Request $request, string $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        if ($user->id === $request->user()->id) {
            return redirect()->back()->withErrors(['error' => 'No puedes cambiar tu propio rango de Administrador General.']);
        }

        $nuevoRol = !$user->is_general_admin;
        $user->update(['is_general_admin' => $nuevoRol]);

        // Enviar email notificando el cambio de privilegios
        try {
            Mail::to($user->email)->send(new PrivilegiosModificadosMail($user, $nuevoRol));
        } catch (\Exception $e) {
            $mensaje = $nuevoRol
                ? "Se le han asignado permisos de Administrador General a {$user->name}, pero no se pudo enviar la notificación por correo."
                : "Se le han retirado los permisos de Administrador General a {$user->name}, pero no se pudo enviar la notificación por correo.";
            return redirect()->back()->with('warning', $mensaje);
        }

        $mensaje = $nuevoRol
            ? "Se le han asignado permisos de Administrador General a {$user->name} y se le ha notificado por correo."
            : "Se le han retirado los permisos de Administrador General a {$user->name} y se le ha notificado por correo.";

        return redirect()->back()->with('success', $mensaje);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return redirect()->back()->withErrors(['error' => 'No puedes desactivar tu propia cuenta de administrador.']);
        }

        $user->delete();

        // Enviar mail de aviso por baja/desactivación
        try {
            Mail::to($user->email)->send(new UsuarioDesactivadoMail($user));
        } catch (\Exception $e) {
            return redirect()->back()->with('warning', "Usuario {$user->name} desactivado, pero no se pudo enviar la notificación por correo.");
        }

        return redirect()->back()->with('success', "El usuario {$user->name} ha sido desactivado y se le ha notificado por correo.");
    }

    public function restore(string $id): RedirectResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        // Enviar mail de aviso por reactivación/restauración
        try {
            Mail::to($user->email)->send(new UsuarioRestauradoMail($user));
        } catch (\Exception $e) {
            return redirect()->back()->with('warning', "Usuario {$user->name} restaurado, pero no se pudo enviar la notificación por correo.");
        }

        return redirect()->back()->with('success', "El usuario {$user->name} ha sido restaurado exitosamente y se le ha notificado por correo.");
    }

    public function forceDelete(Request $request, string $id): RedirectResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);

        if ($user->id === $request->user()->id) {
            return redirect()->back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta.']);
        }

        $userName = $user->name;
        $userEmail = $user->email;

        try {
            Mail::to($userEmail)->send(new UsuarioEliminadoDefinitivoMail($user));
        } catch (\Exception $e) {
            // Continuar con la eliminación
        }

        $user->forceDelete();

        return redirect()->back()->with('success', "El usuario {$userName} ha sido eliminado permanentemente de la base de datos y se le notificó por correo.");
    }
}
