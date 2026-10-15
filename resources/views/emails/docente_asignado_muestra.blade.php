<x-mail::message>
# Asignación a Muestra

Hola **{{ $user->name }}**,

Se te ha asignado como responsable de la muestra **{{ $muestra->titulo }}**.

**Detalles de la muestra:**
- **Título:** {{ $muestra->titulo }}
- **Freezer:** {{ $muestra->freezer->ubicacion ?? 'N/D' }}
@if($muestra->temperatura_minima !== null && $muestra->temperatura_maxima !== null)
- **Rango Térmico:** {{ $muestra->temperatura_minima }} °C a {{ $muestra->temperatura_maxima }} °C
@endif
@if($muestra->vencimiento)
- **Vencimiento:** {{ $muestra->vencimiento->format('d/m/Y') }}
@endif

Recibirás notificaciones automáticas si se detecta alguna anomalía que pueda afectar esta muestra.

<x-mail::button :url="$loginUrl" color="primary">
Ir al Sistema
</x-mail::button>

Gracias,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
