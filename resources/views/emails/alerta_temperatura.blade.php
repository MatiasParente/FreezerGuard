<x-mail::message>
# {{ $asuntoRenderizado ?? '¡Alerta Crítica Detectada!' }}

{!! nl2br(e($cuerpoRenderizado)) !!}

<x-mail::button :url="$urlResolucion" color="success">
Marcar como Resuelto
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
