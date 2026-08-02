<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    // If the table doesn't have timestamps, we disable them
    public $timestamps = false;

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
