<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispositivoAlerta extends Pivot
{
    protected $table = 'dispositivo_alerta';

    public $incrementing = true;

    protected $fillable = [
        'dispositivo_id',
        'alerta_id',
        'fecha_y_hora',
    ];

    protected $casts = [
        'fecha_y_hora' => 'datetime',
    ];

    /**
     * Get the dispositivo associated with the log.
     */
    public function dispositivo(): BelongsTo
    {
        return $this->belongsTo(Dispositivo::class);
    }

    /**
     * Get the alerta associated with the log.
     */
    public function alerta(): BelongsTo
    {
        return $this->belongsTo(Alerta::class);
    }
}
