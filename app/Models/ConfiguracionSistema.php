<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionSistema extends Model
{
    protected $table = 'configuraciones_sistema';

    protected $fillable = [
        'intervalo_correos',
        'plantilla_email_asunto',
        'plantilla_email_cuerpo',
    ];

    protected $casts = [
        'intervalo_correos' => 'integer',
    ];

    public static function getSolo()
    {
        return static::firstOrCreate([], [
            'intervalo_correos' => 1,
            'plantilla_email_asunto' => '¡Alerta Crítica! - FreezerGuard',
            'plantilla_email_cuerpo' => "Se ha detectado una anomalía crítica en el laboratorio. Por favor revise el estado del freezer y de las muestras inmediatamente.",
        ]);
    }
}
