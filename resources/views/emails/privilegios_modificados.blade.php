<x-mail::message>
@if ($esPromocion)
# Asignación de Administrador General

Estimado/a **{{ $user->name }}**,

Te informamos que se te han asignado permisos de **Administrador General** en **{{ config('app.name') }}**.

Como Administrador General, ahora tenés acceso a:

- Gestión de todos los dispositivos y configuraciones del sistema
- Administración de usuarios y sedes
- Visualización de datos de todas las sedes
- Configuración de plantillas de alertas por correo y SMS

@else
# Modificación de Privilegios

Estimado/a **{{ $user->name }}**,

Te informamos que se te han **retirado** los permisos de **Administrador General** en **{{ config('app.name') }}**.

A partir de ahora, tu acceso estará limitado a las sedes que tengas asignadas.

@endif

Si tenés alguna consulta sobre este cambio, por favor contactá con la administración del sistema.

Atentamente,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
