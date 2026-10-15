<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class UsuarioAsignadoSedeMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public Collection $sedes;

    public function __construct(User $user, Collection $sedes)
    {
        $this->user = $user;
        $this->sedes = $sedes;
    }

    public function envelope(): Envelope
    {
        $nombres = $this->sedes->pluck('nombre')->join(', ');

        return new Envelope(
            subject: "Asignación a Sede: {$nombres} - " . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.usuario_asignado_sede',
            with: [
                'user' => $this->user,
                'sedes' => $this->sedes,
                'loginUrl' => url('/login'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
