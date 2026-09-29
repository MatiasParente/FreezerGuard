<x-mail::message>
# ¡Bienvenido a {{ config('app.name') }}!

Se ha creado exitosamente tu cuenta de administrador en el sistema.

**Detalles de tu cuenta:**
- **Usuario / Nombre:** {{ $user->name }}
- **Correo Electrónico:** {{ $user->email }}
- **Contraseña Temporal:** `{{ $plainPassword }}`

Por razones de seguridad, te recomendamos ingresar al sistema y cambiar tu contraseña desde tu perfil.

Gracias,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
