<?php

namespace App\Mail;

use App\Models\Muestra;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocenteAsignadoMuestraMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public Muestra $muestra;

    public function __construct(User $user, Muestra $muestra)
    {
        $this->user = $user;
        $this->muestra = $muestra;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Asignación a Muestra: {$this->muestra->titulo} - " . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.docente_asignado_muestra',
            with: [
                'user' => $this->user,
                'muestra' => $this->muestra->load('freezer'),
                'loginUrl' => url('/login'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
