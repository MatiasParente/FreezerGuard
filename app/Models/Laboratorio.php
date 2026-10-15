<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Laboratorio extends Model
{
    protected $fillable = ['nombre', 'sede_id'];

    public function sede()
    {
        return $this->belongsTo(Sede::class);
    }

    public function freezers()
    {
        return $this->hasMany(Freezer::class);
    }
}
