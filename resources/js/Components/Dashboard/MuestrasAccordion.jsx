import { useState } from 'react';
import { FlaskConical, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function MuestrasAccordion({ muestras = [], freezers = [], filters = {} }) {
    const [mostrarMuestras, setMostrarMuestras] = useState(true);

    const [filtroEstado, setFiltroEstado] = useState({
        'Vencida': true,
        'Por vencer': true,
        'Ok': true,
        'Sin Vencimiento': true,
    });

    const toggleFiltroEstado = (estado) => {
        setFiltroEstado(prev => ({ ...prev, [estado]: !prev[estado] }));
    };

    const handleFreezerFilterChange = (e) => {
        router.get(route(route().current()), { ...filters, freezer_id: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const colorEstado = (estado) => {
        switch (estado) {
            case 'Vencida': return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' };
            case 'Por vencer': return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' };
            case 'Ok': return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
        }
    };

    const muestrasFiltradas = muestras.filter(m => filtroEstado[m.estado_vencimiento]);

    return (
        <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/80 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMostrarMuestras(!mostrarMuestras)}>
                    <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-purple-600" /> Muestras por Vencer
                    </h3>
                </div>

                {/* Filtro desplegable por Freezer */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {freezers.length > 0 && (
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold">
                            <span>Freezer:</span>
                            <select
                                value={filters.freezer_id || ''}
                                onChange={handleFreezerFilterChange}
                                className="border-none py-0 pl-1 pr-6 text-xs font-bold text-slate-800 focus:ring-0 cursor-pointer bg-transparent"
                            >
                                <option value="">Todos</option>
                                {freezers.map(f => (
                                    <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button onClick={() => setMostrarMuestras(!mostrarMuestras)} className="text-slate-400 hover:text-slate-600">
                        {mostrarMuestras ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {mostrarMuestras && (
                <div className="p-6 border-t border-slate-100">
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button onClick={() => toggleFiltroEstado('Vencida')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!filtroEstado['Vencida'] ? 'opacity-40 grayscale' : 'ring-2 ring-red-200'} bg-red-100 text-red-800`}>Vencidas</button>
                        <button onClick={() => toggleFiltroEstado('Por vencer')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!filtroEstado['Por vencer'] ? 'opacity-40 grayscale' : 'ring-2 ring-yellow-200'} bg-yellow-100 text-yellow-800`}>Por vencer {'(<3 días)'}</button>
                        <button onClick={() => toggleFiltroEstado('Ok')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!filtroEstado['Ok'] ? 'opacity-40 grayscale' : 'ring-2 ring-green-200'} bg-green-100 text-green-800`}>Vigentes (+3 días)</button>
                    </div>
                    
                    {muestrasFiltradas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {muestrasFiltradas.map((m) => {
                                const color = colorEstado(m.estado_vencimiento);
                                return (
                                    <div key={m.id} className={`p-4 rounded-xl border ${color.border} ${color.bg} shadow-sm transition-all hover:shadow-md`}>
                                        <div className="flex items-start gap-3">
                                            <FlaskConical className={`w-5 h-5 mt-1 ${color.text}`} />
                                            <div>
                                                <h4 className={`font-semibold ${color.text}`}>{m.titulo}</h4>
                                                <p className={`text-sm mt-1 ${color.text} opacity-80`}>Vence: {m.vencimiento ? new Date(m.vencimiento).toLocaleDateString() : 'N/A'}</p>
                                                <p className={`text-xs mt-1 ${color.text} opacity-70`}>Temperatura: {m.temperatura_minima}°C a {m.temperatura_maxima}°C</p>
                                                <p className="text-[10px] mt-1 font-bold text-slate-500">{m.freezer?.ubicacion || 'Sin Freezer'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No hay muestras para mostrar con los filtros activos.</p>
                    )}
                </div>
            )}
        </div>
    );
}
