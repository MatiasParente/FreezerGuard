import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';
import TopMetricCards from '@/Components/Dashboard/TopMetricCards';
import RealtimeChart from '@/Components/Dashboard/RealtimeChart';
import MuestrasAccordion from '@/Components/Dashboard/MuestrasAccordion';
import AlertasAccordion from '@/Components/Dashboard/AlertasAccordion';

export default function Dashboard({
    muestras = [],
    dispositivosConEstado = [],
    ultimasMediciones = [],
    alertasSinResolverCount = 0,
    alertas = { data: [], links: [], current_page: 1, last_page: 1 },
    freezers = [],
    configuracionSistema = {},
    filters = {},
}) {
    const selectedDeviceId = filters?.dispositivo_id || '';
    const [filtering, setFiltering] = useState(false);

    // Telemetry polling in background (every 4 seconds for fast config and status sync)
    useEffect(() => {
        if (filtering) return;
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible' && !document.hidden) {
                router.reload({
                    only: [
                        'ultimasMediciones',
                        'dispositivosConEstado',
                        'alertasSinResolverCount',
                        'configuracionSistema',
                        'alertas',
                        'muestras',
                    ],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [filtering]);

    const handleDeviceFilterChange = (e) => {
        router.get(
            route('dashboard'),
            { ...filters, dispositivo_id: e.target.value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setFiltering(true),
                onFinish: () => setFiltering(false),
            },
        );
    };

    const selectedDeviceObj = dispositivosConEstado.find(
        (d) => String(d.id) === String(selectedDeviceId),
    );

    const filteredMediciones = selectedDeviceId
        ? ultimasMediciones.filter(
              (m) =>
                  String(m.dispositivo_id || m.dispositivo?.id) ===
                  String(selectedDeviceId),
          )
        : ultimasMediciones;

    const filteredMuestras = selectedDeviceId
        ? muestras.filter(
              (m) =>
                  String(
                      m.freezer?.dispositivo?.id || m.freezer?.dispositivo_id,
                  ) === String(selectedDeviceId),
          )
        : muestras;

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-semibold leading-tight text-slate-900 tracking-tight">
                    Resumen de monitoreo
                </h1>
            }
        >
            <Head title="Resumen" />
            <div className="w-full">
                <div className="fg-page">
                    {/* Selector Global de Dispositivo */}
                    {dispositivosConEstado.length > 0 && (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                    <Cpu className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {selectedDeviceObj
                                            ? `Inspeccionando: ${selectedDeviceObj.nombre} (${selectedDeviceObj.freezer_ubicacion})`
                                            : 'Inspeccionar Dispositivo'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedDeviceObj
                                            ? 'Lecturas, alertas y muestras de este dispositivo.'
                                            : 'Lecturas, alertas y muestras de todos los dispositivos.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <select
                                    id="dashboard-device"
                                    aria-label="Dispositivo a monitorear"
                                    aria-describedby="dashboard-filter-status"
                                    disabled={filtering}
                                    value={selectedDeviceId}
                                    onChange={handleDeviceFilterChange}
                                    className="w-full md:w-64 border-slate-300 rounded-lg shadow-sm text-xs font-bold text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer"
                                >
                                    <option value="">
                                        Todos los Dispositivos
                                    </option>
                                    {dispositivosConEstado.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nombre} ({d.freezer_ubicacion})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <p
                        id="dashboard-filter-status"
                        role="status"
                        className="sr-only"
                    >
                        {filtering
                            ? 'Actualizando filtro…'
                            : 'Filtro actualizado'}
                    </p>
                    {/* Estado de dispositivos */}
                    <TopMetricCards
                        dispositivosConEstado={dispositivosConEstado}
                        alertasSinResolverCount={alertasSinResolverCount}
                        configuracionSistema={configuracionSistema}
                        selectedDeviceId={selectedDeviceId || null}
                    />

                    {/* Acordeón Alertas Recientes */}
                    <AlertasAccordion
                        alertas={alertas}
                        alertasSinResolverCount={alertasSinResolverCount}
                    />

                    {/* Gráfico en Tiempo Real */}
                    <RealtimeChart ultimasMediciones={filteredMediciones} />

                    {/* Acordeón Muestras por Vencer */}
                    <MuestrasAccordion
                        muestras={filteredMuestras}
                        freezers={freezers}
                        filters={filters}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
