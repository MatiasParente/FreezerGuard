<x-mail::message>
# Notificación de Reactivación de Cuenta

Estimado/a **{{ $user->name }}**,

Te informamos que tu cuenta de administrador en **{{ config('app.name') }}** (`{{ $user->email }}`) ha sido reactivada exitosamente por un Administrador General.

Ya puedes volver a ingresar al sistema utilizando tus credenciales habituales.

Atentamente,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
