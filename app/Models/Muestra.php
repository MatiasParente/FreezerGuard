<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Muestra extends Model
{
    protected $fillable = [
        'freezer_id',
        'titulo',
        'descripcion',
        'cantidad',
        'vencimiento',
        'temperatura_minima',
        'temperatura_maxima',
        'observaciones',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'vencimiento' => 'datetime',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    //obtener los usuarios (admins) que son parte de esta muestra
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    //obtener los usuarios (estudiantes) que son parte de esta muestra
    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class);
    }

    //obtener el freezer asociado con la muestra
    public function freezer(): BelongsTo
    {
        return $this->belongsTo(Freezer::class);
    }
}
