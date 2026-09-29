<x-mail::message>
# Notificación de Eliminación Definitiva

Estimado/a **{{ $user->name }}**,

Te informamos que tu cuenta de administrador en **{{ config('app.name') }}** (`{{ $user->email }}`) ha sido eliminada permanentemente del sistema.

Todos tus registros de acceso han sido removidos del sistema.

Atentamente,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
