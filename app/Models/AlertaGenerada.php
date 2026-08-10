<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

//es para tener un registro de las alertas generadas
class AlertaGenerada extends Model
{
    protected $table = 'alertas_generadas';
    //campos que se pueden llenar
    protected $fillable = [
        'dispositivo_id',
        'alerta_id',
        'fecha_y_hora',
        'estado',
        'fecha_y_hora_resuelto',
        'observacion',
    ];
    //cast para que la fecha y hora sea un datetime y la bateria sea un booleano
    protected $casts = [
        'fecha_y_hora' => 'datetime',
    ];

    //relacion que une la alerta generada con el dispositivo que genero la alerta
    public function dispositivo(): BelongsTo
    {
        return $this->belongsTo(Dispositivo::class);
    }

    //relacion que une la alerta generada con la alerta para saber a que tipo de alerta pertenece
    public function alerta(): BelongsTo
    {
        return $this->belongsTo(Alerta::class);
    }
}
