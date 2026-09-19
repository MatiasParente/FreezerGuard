<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dispositivo extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'freezer_id',
        'nombre',
        'descripcion',
        'alerta_temperatura_activa',
        'alerta_bateria_activa',
        'alerta_vencimiento_activa',
        'alerta_inactividad_activa',
        'alerta_modem_activa',
        'minutos_inactividad',
        'temp_min_default',
        'temp_max_default',
        'wifi_ssid',
        'wifi_password',
        'intervalo_telemetria',
        'wifi_status',
        'telefonos_sms',
        'sim_pin',
    ];

    protected $casts = [
        'alerta_temperatura_activa' => 'boolean',
        'alerta_bateria_activa' => 'boolean',
        'alerta_vencimiento_activa' => 'boolean',
        'alerta_inactividad_activa' => 'boolean',
        'alerta_modem_activa' => 'boolean',
        'minutos_inactividad' => 'integer',
        'temp_min_default' => 'float',
        'temp_max_default' => 'float',
        'intervalo_telemetria' => 'integer',
        'wifi_status' => 'integer',
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
