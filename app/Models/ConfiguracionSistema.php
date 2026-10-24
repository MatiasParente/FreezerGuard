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
        'auto_resolucion_activa',
        'lecturas_para_auto_resolucion',
        'purga_automatica_activa',
        'purga_dias_antiguedad',
        'purga_hora',
        'plantilla_email_asunto',
        'plantilla_email_cuerpo',
        'plantilla_sms_cuerpo',
        'plantilla_sms_resuelta',
    ];

    protected $casts = [
        'intervalo_correos' => 'integer',
        'envio_email_activo' => 'boolean',
        'envio_sms_activo' => 'boolean',
        'auto_resolucion_activa' => 'boolean',
        'lecturas_para_auto_resolucion' => 'integer',
        'purga_automatica_activa' => 'boolean',
        'purga_dias_antiguedad' => 'integer',
    ];

    public static function getSolo()
    {
        return static::firstOrCreate([], [
            'intervalo_correos' => 1,
            'email_default' => null,
            'envio_email_activo' => true,
            'envio_sms_activo' => true,
            'auto_resolucion_activa' => true,
            'lecturas_para_auto_resolucion' => 5,
            'purga_automatica_activa' => true,
            'purga_dias_antiguedad' => 30,
            'purga_hora' => '03:00',
            'plantilla_email_asunto' => '¡Alerta Crítica! - FreezerGuard',
            'plantilla_email_cuerpo' => "Se ha detectado una anomalía crítica en el laboratorio ({tipo_alerta} en {dispositivo}). Temperatura: {temperatura} °C. Fecha: {fecha}.",
            'plantilla_sms_cuerpo' => "ALERTA FREEZERGUARD: Se detectó {tipo_alerta} en {dispositivo}. Temp: {temperatura} C. Fecha: {fecha}",
            'plantilla_sms_resuelta' => "AVISO FREEZERGUARD: Alerta {tipo_alerta} en {dispositivo} ha sido RESUELTA. Temp: {temperatura} C. Fecha: {fecha}",
        ]);
    }
}
