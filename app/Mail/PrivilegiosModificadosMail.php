<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PrivilegiosModificadosMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public bool $esPromocion;

    public function __construct(User $user, bool $esPromocion)
    {
        $this->user = $user;
        $this->esPromocion = $esPromocion;
    }

    public function envelope(): Envelope
    {
        $subject = $this->esPromocion
            ? 'Notificación: Has sido designado Administrador General - FreezerGuard'
            : 'Notificación: Cambio en tus privilegios de administración - FreezerGuard';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.privilegios_modificados',
            with: [
                'user' => $this->user,
                'esPromocion' => $this->esPromocion,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
