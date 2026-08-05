<x-mail::message>
# ¡Alerta Crítica de Temperatura!

Se ha detectado una anomalía en la temperatura de una de sus muestras.

**Muestra afectada:** {{ $muestra->titulo }}
**Temperatura Actual:** {{ $medicion->temperatura }} °C
**Rango Permitido:** {{ $muestra->temperatura_minima }} °C a {{ $muestra->temperatura_maxima }} °C
**Fecha y Hora:** {{ $medicion->fecha_y_hora->format('d/m/Y H:i:s') }}
**Tipo de Alerta:** {{ $alerta->tipo }}

{{ $alerta->descripcion }}

Por favor, revise el dispositivo **{{ $medicion->dispositivo->nombre ?? 'Desconocido' }}** inmediatamente para evitar la pérdida de la muestra.

<x-mail::button :url="config('app.url')">
Revisar Sistema
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
