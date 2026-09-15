import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
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
    filters = {}
}) {

    // Telemetry polling in background without blocking link navigation
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible' && !document.hidden) {
                router.reload({ 
                    only: ['ultimasMediciones', 'dispositivosConEstado', 'alertasSinResolverCount'], 
                    preserveState: true, 
                    preserveScroll: true,
                    replace: true 
                });
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Panel de Control Principal</h2>}>
            <Head title="Resumen Dashboard" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    
                    {/* 1. Tarjetas Superiores Compactas con Selector de Dispositivo */}
                    <TopMetricCards 
                        dispositivosConEstado={dispositivosConEstado} 
                        alertasSinResolverCount={alertasSinResolverCount} 
                    />

                    {/* 2. Gráfico en Tiempo Real con Opciones 5/30/100 */}
                    <RealtimeChart ultimasMediciones={ultimasMediciones} />

                    {/* 3. Acordeón Muestras por Vencer con Filtro por Freezer */}
                    <MuestrasAccordion 
                        muestras={muestras} 
                        freezers={freezers} 
                        filters={filters} 
                    />

                    {/* 4. Acordeón Alertas Recientes */}
                    <AlertasAccordion 
                        alertas={alertas} 
                        alertasSinResolverCount={alertasSinResolverCount} 
                    />

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
