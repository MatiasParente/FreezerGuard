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

    //recibe los datos de la muestra, la medicion, la alerta y la bateria
    public function __construct($freezer, $dispositivo, $alerta, $urlResolucion, $fechaYHora)
    {
        $this->freezer = $freezer;
        $this->dispositivo = $dispositivo;
        $this->alerta = $alerta;
        $this->urlResolucion = $urlResolucion;
        $this->fechaYHora = $fechaYHora;
    }

    //definimos el sobre del email con el asunto
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Alerta Crítica! - FreezerGuard',
        );
    }

    //definimos el contenido del email con los datos de la muestra, la medicion, la alerta y la bateria
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.alerta_temperatura',
            with: [
                'freezer' => $this->freezer,
                'dispositivo' => $this->dispositivo,
                'alerta' => $this->alerta,
                'urlResolucion' => $this->urlResolucion,
                'fechaYHora' => $this->fechaYHora,
            ],
        );
    }

    //adjuntos
    public function attachments(): array
    {
        return [];
    }
}
