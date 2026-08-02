<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Alerta extends Model
{
    protected $fillable = [
        'codigo',
        'tipo',
        'descripcion',
    ];

    //obtener los dispositivos que desencadenaron esta alerta
    public function dispositivos()
    {
        return $this->belongsToMany(Dispositivo::class, 'dispositivo_alerta')
                    ->withPivot('fecha_y_hora')
                    ->withTimestamps();
    }

    //obtener los registros de dispositivo_alerta para la alerta
    public function dispositivoAlertas(): HasMany
    {
        return $this->hasMany(DispositivoAlerta::class);
    }
}
