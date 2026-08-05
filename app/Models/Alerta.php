<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Alerta extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'tipo',
        'descripcion',
    ];

    //obtener las alertas generadas asociadas a este tipo
    public function alertasGeneradas(): HasMany
    {
        return $this->hasMany(AlertaGenerada::class);
    }
}
