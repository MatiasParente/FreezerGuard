<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UpdateMuestra extends Model
{
    protected $table = 'update_muestra';
    public $timestamps = false;

    protected $fillable = [
       'muestra_id',
       'user_id',
       'freezer_id',
       'nombre_muestra',
       'temp_min_old',
       'temp_max_old',
       'temp_min_new',
       'temp_max_new',
       'fecha'
    ];

    protected $casts = [
        'fecha' => 'datetime'
    ];

    public function muestra(): BelongsTo
    {
        return $this->belongsTo(Muestra::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

     public function freezer(): BelongsTo
    {
        return $this->belongsTo(Freezer::class);
    }

    //
}
