<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    //si la tabla no tiene timestamps, los deshabilitamos
    public $timestamps = false;

    //campos que se pueden llenar
    protected $fillable = [
        'nombre',
        'email',
        'telefono',
    ];

    //obtener las muestras asociadas con el usuario
    public function muestras()
    {
        return $this->belongsToMany(Muestra::class);
    }
}
