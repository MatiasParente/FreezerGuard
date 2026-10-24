<?php

namespace App\Console\Commands;

use App\Models\Medicion;
use App\Models\AlertaGenerada;
use App\Models\HistorialMuestra;
use App\Models\ConfiguracionSistema;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PurgeMediciones extends Command
{
    protected $signature = 'app:purge-mediciones
                            {--force : Ejecutar sin confirmación}
                            {--ignore-schedule : Ejecutar sin verificar la hora configurada}';

    protected $description = 'Purga periódica: elimina mediciones antiguas, historial de muestras eliminadas, y alertas resueltas antiguas según configuración del sistema';

    public function handle(): int
    {
        $config = ConfiguracionSistema::getSolo();

        // ── Verificar si la purga está habilitada ──
        if (!$config->purga_automatica_activa) {
            $this->info('⏸ La purga automática está desactivada en la configuración del sistema.');
            return self::SUCCESS;
        }

        // ── Verificar la hora configurada (salvo que se pase --ignore-schedule) ──
        if (!$this->option('ignore-schedule')) {
            $horaConfigurada = $config->purga_hora ?? '03:00';
            $horaActual = now()->format('H');
            $horaConf = \Carbon\Carbon::createFromFormat('H:i', $horaConfigurada)->format('H');

            if ($horaActual !== $horaConf) {
                // No es la hora configurada, salir silenciosamente
                return self::SUCCESS;
            }
        }

        $dias = (int)($config->purga_dias_antiguedad ?? 30);
        $limite = now()->subDays($dias);

        $this->info("━━━ Purga de datos anteriores a {$limite->toDateTimeString()} ({$dias} días) ━━━");
        $this->newLine();

        $totalGeneral = 0;

        // ═══════════════════════════════════════════════════════════════
        // 1. MEDICIONES ANTIGUAS (ventana rodante de N días)
        // ═══════════════════════════════════════════════════════════════
        $cantidadMediciones = Medicion::where('fecha_y_hora', '<', $limite)->count();

        if ($cantidadMediciones === 0) {
            $this->info("✓ Mediciones: No hay registros anteriores a {$limite->toDateTimeString()}.");
        } else {
            $this->info("⟐ Mediciones: Se encontraron {$cantidadMediciones} registros antiguos.");

            if (!$this->option('force') && !$this->confirm("¿Eliminar {$cantidadMediciones} mediciones?")) {
                $this->info('  → Omitido por el usuario.');
            } else {
                $borradas = $this->borrarEnLotes(
                    fn() => Medicion::where('fecha_y_hora', '<', $limite)->limit(1000)->delete()
                );
                $totalGeneral += $borradas;
                $this->info("  ✓ Se eliminaron {$borradas} mediciones antiguas.");
            }
        }

        $this->newLine();

        // ═══════════════════════════════════════════════════════════════
        // 2. HISTORIAL DE MUESTRAS ELIMINADAS
        //    Se elimina el historial de logs de muestras que ya fueron eliminadas
        //    (muestra_id = null por hard-delete, o muestra inexistente)
        //    cuyo registro de historial es más antiguo que el límite.
        // ═══════════════════════════════════════════════════════════════
        $historialHuerfano = HistorialMuestra::where('fecha', '<', $limite)
            ->where(function ($query) {
                // Muestras que fueron hard-deleted (muestra_id es null)
                $query->whereNull('muestra_id')
                    // O cuya muestra ya no existe en la BD
                    ->orWhereDoesntHave('muestra');
            })
            ->count();

        if ($historialHuerfano === 0) {
            $this->info("✓ Historial de muestras: No hay registros huérfanos o antiguos para purgar.");
        } else {
            $this->info("⟐ Historial de muestras: Se encontraron {$historialHuerfano} registros de muestras eliminadas.");

            if (!$this->option('force') && !$this->confirm("¿Eliminar {$historialHuerfano} registros de historial?")) {
                $this->info('  → Omitido por el usuario.');
            } else {
                $borrados = $this->borrarEnLotes(
                    fn() => HistorialMuestra::where('fecha', '<', $limite)
                        ->where(function ($query) {
                            $query->whereNull('muestra_id')
                                ->orWhereDoesntHave('muestra');
                        })
                        ->limit(1000)
                        ->delete()
                );
                $totalGeneral += $borrados;
                $this->info("  ✓ Se eliminaron {$borrados} registros de historial de muestras eliminadas.");
            }
        }

        $this->newLine();

        // ═══════════════════════════════════════════════════════════════
        // 3. ALERTAS RESUELTAS ANTIGUAS (ventana rodante de N días)
        //    Solo elimina alertas ya resueltas (estado = 2) cuya fecha de
        //    creación sea anterior al límite.
        // ═══════════════════════════════════════════════════════════════
        $cantidadAlertas = AlertaGenerada::where('estado', 2)
            ->where('fecha_y_hora', '<', $limite)
            ->count();

        if ($cantidadAlertas === 0) {
            $this->info("✓ Alertas resueltas: No hay registros antiguos para purgar.");
        } else {
            $this->info("⟐ Alertas resueltas: Se encontraron {$cantidadAlertas} alertas resueltas antiguas.");

            if (!$this->option('force') && !$this->confirm("¿Eliminar {$cantidadAlertas} alertas resueltas?")) {
                $this->info('  → Omitido por el usuario.');
            } else {
                $borradas = $this->borrarEnLotes(
                    fn() => AlertaGenerada::where('estado', 2)
                        ->where('fecha_y_hora', '<', $limite)
                        ->limit(1000)
                        ->delete()
                );
                $totalGeneral += $borradas;
                $this->info("  ✓ Se eliminaron {$borradas} alertas resueltas antiguas.");
            }
        }

        $this->newLine();
        $this->info("━━━ Purga completada: {$totalGeneral} registros eliminados en total ━━━");

        Log::info('Purga periódica de datos completada', [
            'total_eliminados' => $totalGeneral,
            'dias_antiguedad' => $dias,
            'limite_fecha' => $limite->toDateTimeString(),
        ]);

        return self::SUCCESS;
    }

    /**
     * Borra registros en lotes de 1000 para no bloquear la BD.
     */
    private function borrarEnLotes(callable $deleteQuery): int
    {
        $totalBorrado = 0;
        do {
            $borrados = $deleteQuery();
            $totalBorrado += $borrados;

            if ($borrados > 0) {
                $this->output->write(".");
            }
        } while ($borrados > 0);

        $this->newLine();
        return $totalBorrado;
    }
}
