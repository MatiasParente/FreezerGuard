<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sede extends Model
{
    protected $fillable = ['nombre'];

    public function laboratorios()
    {
        return $this->hasMany(Laboratorio::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class);
    }
}
