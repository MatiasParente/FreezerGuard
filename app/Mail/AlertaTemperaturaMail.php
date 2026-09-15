<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

//esta es para preparar el mail para enviar cuando haya una alerta de temperatura
class AlertaTemperaturaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $freezer;
    public $dispositivo;
    public $alerta;
    public $urlResolucion;
    public $fechaYHora;
    public $temperatura;
    public $cuerpoRenderizado;
    public $asuntoRenderizado;

    public function __construct($freezer, $dispositivo, $alerta, $urlResolucion, $fechaYHora, $temperatura = null)
    {
        $this->freezer = $freezer;
        $this->dispositivo = $dispositivo;
        $this->alerta = $alerta;
        $this->urlResolucion = $urlResolucion;
        $this->fechaYHora = $fechaYHora;
        $this->temperatura = $temperatura;
        $this->evaluarPlantilla();
    }

    private function evaluarPlantilla()
    {
        $config = \App\Models\ConfiguracionSistema::getSolo();
        
        $fechaStr = $this->fechaYHora 
            ? (is_string($this->fechaYHora) ? $this->fechaYHora : $this->fechaYHora->format('d/m/Y H:i:s')) 
            : now()->format('d/m/Y H:i:s');

        $remplazos = [
            '{dispositivo}' => $this->dispositivo->nombre ?? 'Desconocido',
            '{freezer}' => $this->freezer->ubicacion ?? 'Desconocido',
            '{tipo_alerta}' => $this->alerta->tipo ?? 'Anomalía',
            '{temperatura}' => $this->temperatura !== null ? number_format((float)$this->temperatura, 2) : 'N/A',
            '{fecha}' => $fechaStr,
        ];

        $this->asuntoRenderizado = strtr($config->plantilla_email_asunto, $remplazos);
        $this->cuerpoRenderizado = strtr($config->plantilla_email_cuerpo, $remplazos);
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
            markdown: 'emails.alerta_temperatura',
            with: [
                'freezer' => $this->freezer,
                'dispositivo' => $this->dispositivo,
                'alerta' => $this->alerta,
                'urlResolucion' => $this->urlResolucion,
                'fechaYHora' => $this->fechaYHora,
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
