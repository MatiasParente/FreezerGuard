<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Medicion extends Model
{
    protected $table = 'mediciones';

    protected $fillable = [
        'dispositivo_id',
        'temperatura',
        'fecha_y_hora',
    ];

    protected $casts = [
        'fecha_y_hora' => 'datetime',
    ];

    /**
     * Get the dispositivo associated with this medicion.
     */
    public function dispositivo(): BelongsTo
    {
        return $this->belongsTo(Dispositivo::class);
    }
}
