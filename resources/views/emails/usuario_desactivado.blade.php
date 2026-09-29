<x-mail::message>
# Notificación de Desactivación de Cuenta

Estimado/a **{{ $user->name }}**,

Te informamos que tu cuenta en **{{ config('app.name') }}** (`{{ $user->email }}`) ha sido dada de baja por un Administrador General.

Si crees que esto es un error, por favor, ponte en contacto con la administración del sistema.

Atentamente,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
