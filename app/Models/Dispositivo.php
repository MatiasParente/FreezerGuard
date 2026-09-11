<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dispositivo extends Model
{
    protected $fillable = [
        'freezer_id',
        'nombre',
        'descripcion',
        'alerta_temperatura_activa',
        'alerta_bateria_activa',
        'alerta_vencimiento_activa',
        'alerta_inactividad_activa',
        'temp_min_default',
        'temp_max_default',
        'wifi_ssid',
        'wifi_password',
    ];

    protected $casts = [
        'alerta_temperatura_activa' => 'boolean',
        'alerta_bateria_activa' => 'boolean',
        'alerta_vencimiento_activa' => 'boolean',
        'alerta_inactividad_activa' => 'boolean',
        'temp_min_default' => 'float',
        'temp_max_default' => 'float',
    ];

    //obtener el freezer asociado con el dispositivo
    public function freezer(): BelongsTo
    {
        return $this->belongsTo(Freezer::class);
    }

    //obtener las alertas generadas por este dispositivo
    public function alertasGeneradas(): HasMany
    {
        return $this->hasMany(AlertaGenerada::class);
    }

    //obtener las mediciones de este dispositivo
    public function mediciones(): HasMany
    {
        return $this->hasMany(Medicion::class);
    }
}
