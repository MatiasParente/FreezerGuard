<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlertaResueltaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $freezer;
    public $dispositivo;
    public $alerta;
    public $fechaYHoraResueluta;
    public $temperatura;
    public $observacion;
    public $cuerpoRenderizado;
    public $asuntoRenderizado;

    public function __construct($freezer, $dispositivo, $alerta, $fechaYHoraResueluta = null, $temperatura = null, $observacion = null)
    {
        $this->freezer = $freezer;
        $this->dispositivo = $dispositivo;
        $this->alerta = $alerta;
        $this->fechaYHoraResueluta = $fechaYHoraResueluta ?? now();
        $this->temperatura = $temperatura;
        $this->observacion = $observacion ?? 'Resuelto por el usuario';
        $this->evaluarPlantilla();
    }

    private function evaluarPlantilla()
    {
        $fechaStr = $this->fechaYHoraResueluta 
            ? (is_string($this->fechaYHoraResueluta) ? $this->fechaYHoraResueluta : $this->fechaYHoraResueluta->format('d/m/Y H:i:s')) 
            : now()->format('d/m/Y H:i:s');

        $dispositivoNombre = $this->dispositivo->nombre ?? 'Desconocido';
        $tipoAlerta = $this->alerta->tipo ?? 'Anomalía';
        $tempStr = $this->temperatura !== null ? number_format((float)$this->temperatura, 2) : 'N/A';

        $this->asuntoRenderizado = "¡Alerta Resuelta! - {$tipoAlerta} en {$dispositivoNombre}";
        $this->cuerpoRenderizado = "Confirmación: La alerta '{$tipoAlerta}' registrada en el dispositivo '{$dispositivoNombre}' ha sido RESUELTA con éxito. Fecha de resolución: {$fechaStr}. Temperatura actual: {$tempStr} °C. Nota: {$this->observacion}.";
    }

    public function envelope(): Envelope
    {
        $this->evaluarPlantilla();
        return new Envelope(
            subject: $this->asuntoRenderizado,
        );
    }

    public function content(): Content
    {
        $this->evaluarPlantilla();
        return new Content(
            markdown: 'emails.alerta_resuelta',
            with: [
                'freezer' => $this->freezer,
                'dispositivo' => $this->dispositivo,
                'alerta' => $this->alerta,
                'fechaYHoraResueluta' => $this->fechaYHoraResueluta,
                'observacion' => $this->observacion,
                'cuerpoRenderizado' => $this->cuerpoRenderizado,
                'asuntoRenderizado' => $this->asuntoRenderizado,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
