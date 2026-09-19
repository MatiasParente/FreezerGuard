<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionSistema extends Model
{
    protected $table = 'configuraciones_sistema';

    protected $fillable = [
        'intervalo_correos',
        'email_default',
        'envio_email_activo',
        'envio_sms_activo',
        'plantilla_email_asunto',
        'plantilla_email_cuerpo',
        'plantilla_sms_cuerpo',
        'plantilla_sms_resuelta',
    ];

    protected $casts = [
        'intervalo_correos' => 'integer',
        'envio_email_activo' => 'boolean',
        'envio_sms_activo' => 'boolean',
    ];

    public static function getSolo()
    {
        return static::firstOrCreate([], [
            'intervalo_correos' => 1,
            'email_default' => null,
            'envio_email_activo' => true,
            'envio_sms_activo' => true,
            'plantilla_email_asunto' => '¡Alerta Crítica! - FreezerGuard',
            'plantilla_email_cuerpo' => "Se ha detectado una anomalía crítica en el laboratorio ({tipo_alerta} en {dispositivo}). Temperatura: {temperatura} °C. Fecha: {fecha}.",
            'plantilla_sms_cuerpo' => "ALERTA FREEZERGUARD: Se detectó {tipo_alerta} en {dispositivo}. Temp: {temperatura} C. Fecha: {fecha}",
            'plantilla_sms_resuelta' => "AVISO FREEZERGUARD: Alerta {tipo_alerta} en {dispositivo} ha sido RESUELTA. Temp: {temperatura} C. Fecha: {fecha}",
        ]);
    }
}
