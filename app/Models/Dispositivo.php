<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dispositivo extends Model
{
    protected $fillable = [
        'freezer_id',
        'temperatura',
        'corriente',
        'fecha_y_hora',
    ];

    protected $casts = [
        'fecha_y_hora' => 'datetime',
        'corriente' => 'boolean',
    ];

    //obtener el freezer asociado con el dispositivo
    public function freezer(): BelongsTo
    {
        return $this->belongsTo(Freezer::class);
    }

    //obtener las alertas generadas por este dispositivo
    public function alertas()
    {
        return $this->belongsToMany(Alerta::class, 'dispositivo_alerta')
                    ->withPivot('fecha_y_hora')
                    ->withTimestamps();
    }

    //obtener los registros de dispositivo_alerta para el dispositivo
    public function dispositivoAlertas(): HasMany
    {
        return $this->hasMany(DispositivoAlerta::class);
    }
}
