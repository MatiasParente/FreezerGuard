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

    //obtener el dispositivo del freezer
    public function dispositivo()
    {
        return $this->hasOne(Dispositivo::class);
    }

    //obtener los usuarios (admins) que son parte del freezer
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
