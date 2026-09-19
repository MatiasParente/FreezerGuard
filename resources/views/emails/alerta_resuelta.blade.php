<x-mail::message>
# {{ $asuntoRenderizado ?? '¡Alerta Resuelta!' }}

{!! nl2br(e($cuerpoRenderizado)) !!}

<x-mail::panel>
**Estado:** Resuelto  
**Dispositivo:** {{ $dispositivo->nombre ?? 'N/D' }}  
**Ubicación:** {{ $freezer->ubicacion ?? 'N/D' }}  
**Fecha de Resolución:** {{ $fechaYHoraResueluta ? (is_string($fechaYHoraResueluta) ? $fechaYHoraResueluta : $fechaYHoraResueluta->format('d/m/Y H:i:s')) : 'N/D' }}  
**Nota:** {{ $observacion ?? 'Normalizado' }}
</x-mail::panel>

El monitoreo continúa activo normalmente.

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
