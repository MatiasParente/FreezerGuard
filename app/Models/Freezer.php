<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Freezer extends Model
{
    protected $fillable = [
        'ubicacion',
    ];

    //obtener las muestras del freezer
    public function muestras(): HasMany
    {
        return $this->hasMany(Muestra::class);
    }

    //obtener los dispositivos del freezer
    public function dispositivos(): HasMany
    {
        return $this->hasMany(Dispositivo::class);
    }

    //obtener los usuarios (admins) asignados al freezer
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
