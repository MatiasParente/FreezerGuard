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
        'bateria',
        'fecha_y_hora',
    ];

    protected $casts = [
        'fecha_y_hora' => 'datetime',
        'bateria' => 'boolean',
    ];

    //relacion que une la medicion con el dispositivo
    public function dispositivo(): BelongsTo
    {
        return $this->belongsTo(Dispositivo::class);
    }
}
