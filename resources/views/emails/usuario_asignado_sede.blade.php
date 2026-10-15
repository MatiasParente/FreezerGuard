<x-mail::message>
# Asignación a Sede

Hola **{{ $user->name }}**,

Se te ha asignado a {{ count($sedes) === 1 ? 'la sede' : 'las sedes' }}:

@foreach ($sedes as $sede)
- **{{ $sede->nombre }}**
@endforeach

Esto significa que ahora tenés acceso a los freezers, muestras y alertas de {{ count($sedes) === 1 ? 'esta sede' : 'estas sedes' }}.

<x-mail::button :url="$loginUrl" color="primary">
Ir al Sistema
</x-mail::button>

Gracias,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
