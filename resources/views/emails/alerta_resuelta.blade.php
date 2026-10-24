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

@if($esAutoResolucion ?? false)
---

**⚠️ ATENCIÓN — Resolución automática**

Esta alerta fue resuelta de forma **automática** por el sistema al detectar que las condiciones volvieron a la normalidad durante varias lecturas consecutivas.

**Se recomienda encarecidamente realizar una revisión manual del dispositivo y del freezer** para descartar posibles fallas intermitentes o falsos positivos. Una inspección física puede prevenir incidentes futuros.

> Si el problema persiste o se repite con frecuencia, considere revisar las conexiones eléctricas, el estado del sensor de temperatura y la señal del módulo celular.

---
@endif

El monitoreo continúa activo normalmente.

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
