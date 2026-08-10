<x-mail::message>
# ¡Alerta Crítica Detectada!

Se ha detectado una anomalía en su sistema.

**Freezer afectado:** {{ $freezer->ubicacion ?? 'Desconocido' }}<br>
**Dispositivo:** {{ $dispositivo->nombre ?? 'Desconocido' }}<br>
**Fecha y Hora:** {{ $fechaYHora->format('d/m/Y H:i:s') }}<br>
**Tipo de Alerta:** {{ $alerta->tipo }}<br>

{{ $alerta->descripcion }}

Por favor, revise el congelador inmediatamente para evitar la pérdida de las muestras.

Una vez que el problema haya sido solucionado, haga clic en el siguiente botón para marcar la alerta como RESUELTA y detener los envíos automáticos:

<x-mail::button :url="$urlResolucion" color="success">
Marcar como Resuelto
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
