<?php

namespace App\Console\Commands;

use App\Models\Medicion;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PurgeMediciones extends Command
{
    protected $signature = 'app:purge-mediciones
                            {--days=30 : Borrar mediciones más antiguas que esta cantidad de días}
                            {--force : Ejecutar sin confirmación}';

    protected $description = 'Eliminar mediciones antiguas de la base de datos para evitar acumulación excesiva';

    public function handle(): int
    {
        $dias = (int) $this->option('days');
        $limite = now()->subDays($dias);

        $cantidad = Medicion::where('fecha_y_hora', '<', $limite)->count();

        if ($cantidad === 0) {
            $this->info("No hay mediciones anteriores a {$limite->toDateTimeString()}. Nada que purgar.");
            return self::SUCCESS;
        }

        $this->info("Se encontraron {$cantidad} mediciones anteriores a {$limite->toDateTimeString()}.");

        if (!$this->option('force') && !$this->confirm("¿Deseas eliminar {$cantidad} mediciones?")) {
            $this->info('Operación cancelada.');
            return self::SUCCESS;
        }

        // Borrar en lotes para no bloquear la base de datos
        $totalBorrado = 0;
        do {
            $borrados = Medicion::where('fecha_y_hora', '<', $limite)
                ->limit(1000)
                ->delete();
            $totalBorrado += $borrados;

            if ($borrados > 0) {
                $this->output->write(".");
            }
        } while ($borrados > 0);

        $this->newLine();
        $this->info("Se eliminaron {$totalBorrado} mediciones antiguas.");

        Log::info('Purga mensual de mediciones completada', [
            'mediciones_eliminadas' => $totalBorrado,
            'limite_fecha' => $limite->toDateTimeString(),
        ]);

        return self::SUCCESS;
    }
}
