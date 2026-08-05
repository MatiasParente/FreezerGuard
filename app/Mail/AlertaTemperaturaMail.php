<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlertaTemperaturaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $muestra;
    public $medicion;
    public $alerta;

    public function __construct($muestra, $medicion, $alerta)
    {
        $this->muestra = $muestra;
        $this->medicion = $medicion;
        $this->alerta = $alerta;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Alerta de Temperatura Crítica! - FreezerGuard',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.alerta_temperatura',
            with: [
                'muestra' => $this->muestra,
                'medicion' => $this->medicion,
                'alerta' => $this->alerta,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
