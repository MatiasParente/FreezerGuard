<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dispositivo extends Model
{
    protected $fillable = [
        'freezer_id',
        'nombre',
        'descripcion',
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
