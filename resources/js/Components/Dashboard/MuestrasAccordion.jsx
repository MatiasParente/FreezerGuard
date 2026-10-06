import { useState } from 'react';
import { FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';

export default function MuestrasAccordion({ muestras = [] }) {
    const [mostrarMuestras, setMostrarMuestras] = useState(true);

    const [filtroEstado, setFiltroEstado] = useState({
        Vencida: true,
        'Por vencer': true,
        Ok: true,
        'Sin Vencimiento': true,
    });

    const toggleFiltroEstado = (estado) => {
        setFiltroEstado((prev) => ({ ...prev, [estado]: !prev[estado] }));
    };

    const colorEstado = (estado) => {
        switch (estado) {
            case 'Vencida':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-800',
                    border: 'border-red-200',
                };
            case 'Por vencer':
                return {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-800',
                    border: 'border-yellow-300',
                };
            case 'Ok':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-800',
                    border: 'border-green-200',
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-800',
                    border: 'border-gray-200',
                };
        }
    };

    const muestrasFiltradas = muestras.filter(
        (m) => filtroEstado[m.estado_vencimiento],
    );

    return (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/80 border-b border-slate-200 gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-indigo-600" />{' '}
                        Vencimiento de muestras
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label={
                            mostrarMuestras
                                ? 'Ocultar muestras'
                                : 'Mostrar muestras'
                        }
                        aria-expanded={mostrarMuestras}
                        aria-controls="sample-expiry"
                        onClick={() => setMostrarMuestras(!mostrarMuestras)}
                        className="text-slate-600 hover:text-slate-600"
                    >
                        {mostrarMuestras ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <div id="sample-expiry" hidden={!mostrarMuestras} className="p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        ['Vencida', 'Vencidas'],
                        ['Por vencer', 'Por vencer (hasta 3 días)'],
                        ['Ok', 'Vigentes (más de 3 días)'],
                        ['Sin Vencimiento', 'Sin vencimiento'],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={filtroEstado[key]}
                            onClick={() => toggleFiltroEstado(key)}
                            className={`fg-button border ${filtroEstado[key] ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-slate-300 bg-white text-slate-600'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {muestrasFiltradas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {muestrasFiltradas.map((m) => {
                            const color = colorEstado(m.estado_vencimiento);
                            return (
                                <div
                                    key={m.id}
                                    className={`p-4 rounded-xl border ${color.border} ${color.bg} shadow-sm transition-all `}
                                >
                                    <div className="flex items-start gap-3">
                                        <FlaskConical
                                            className={`w-5 h-5 mt-1 ${color.text}`}
                                        />
                                        <div>
                                            <h4
                                                className={`font-semibold break-words ${color.text}`}
                                            >
                                                {m.titulo}
                                            </h4>
                                            <p
                                                className={`mt-1 text-xs font-medium ${color.text}`}
                                            >
                                                {m.estado_vencimiento === 'Ok'
                                                    ? 'Vigente'
                                                    : m.estado_vencimiento}
                                            </p>
                                            <p
                                                className={`text-sm mt-1 ${color.text} `}
                                            >
                                                Vence:{' '}
                                                {m.vencimiento
                                                    ? new Date(
                                                          m.vencimiento,
                                                      ).toLocaleDateString()
                                                    : 'N/A'}
                                            </p>
                                            <p
                                                className={`text-xs mt-1 ${color.text} `}
                                            >
                                                Temperatura:{' '}
                                                {m.temperatura_minima}°C a{' '}
                                                {m.temperatura_maxima}°C
                                            </p>
                                            <p className="text-xs mt-1 font-bold text-slate-500">
                                                {m.freezer?.ubicacion ||
                                                    'Sin Freezer'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">
                        No hay muestras para mostrar con los filtros activos.
                    </p>
                )}
            </div>
        </div>
    );
}
