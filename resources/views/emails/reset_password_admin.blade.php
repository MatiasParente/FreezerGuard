<x-mail::message>
# Restablecimiento de Contraseña

Un Administrador General ha generado una nueva contraseña para tu cuenta en **{{ config('app.name') }}**.

**Tus nuevas credenciales:**
- **Correo Electrónico:** {{ $user->email }}
- **Nueva Contraseña:** `{{ $plainPassword }}`

Te recomendamos iniciar sesión y actualizar tu contraseña desde la sección Perfil.

Gracias,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
