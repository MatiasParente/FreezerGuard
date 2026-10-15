<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class SedeAccess
{
    public static function scope(Builder $query, User $user, string $laboratorioRelation = 'laboratorio'): Builder
    {
        if ($user->is_general_admin) {
            return $query;
        }

        return $query->whereHas($laboratorioRelation, fn (Builder $lab) =>
            $lab->whereIn('sede_id', $user->sedes()->select('sedes.id'))
        );
    }

    public static function find(Builder $query, User $user, string $relation, int $id)
    {
        return self::scope($query, $user, $relation)->findOrFail($id);
    }

    public static function validateSampleMembership($person, array $siteIds): void
    {
        if ($person->muestras()->whereHas('freezer.laboratorio', fn (Builder $lab) => $lab->whereNotIn('sede_id', $siteIds))->exists()) {
            throw ValidationException::withMessages(['sede_ids' => 'La persona tiene muestras asignadas en una sede que se intenta quitar.']);
        }
        if ($person instanceof User && $person->freezers()->whereHas('laboratorio', fn (Builder $lab) => $lab->whereNotIn('sede_id', $siteIds))->exists()) {
            throw ValidationException::withMessages(['sede_ids' => 'La persona es responsable de freezers en una sede que se intenta quitar.']);
        }
    }
}
