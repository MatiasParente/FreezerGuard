import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FlaskConical, Calendar, Thermometer, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { useState, Fragment } from 'react';

export default function muestras({ muestras, filters, freezers }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const toggleRow = (id) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const handleFilterChange = (e) => {
        router.get(route(route().current()), { ...filters, [e.target.name]: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Muestras Almacenadas
                </h2>
            }
        >
            <Head title="Muestras" />

            <div>
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Laboratorio (Freezer)</label>
                                    <select name="freezer_id" defaultValue={filters?.freezer_id || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">Todos</option>
                                        {freezers?.map(f => (
                                            <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Muestra</th>
                                            <th className="px-6 py-4">Dispositivo / Lab</th>
                                            <th className="px-6 py-4">Cantidad</th>
                                            <th className="px-6 py-4">Rango Temp.</th>
                                            <th className="px-6 py-4">Vencimiento</th>
                                            <th className="px-4 py-4 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {muestras.data.map((muestra) => (
                                            <Fragment key={muestra.id}>
                                                <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleRow(muestra.id)}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                                <FlaskConical className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{muestra.titulo}</div>
                                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{muestra.descripcion}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-400 font-medium">
                                                            {muestra.freezer?.dispositivo?.nombre || 'N/A'} • {muestra.freezer?.ubicacion || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {muestra.cantidad}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 text-gray-600">
                                                            <Thermometer className="w-4 h-4" /> {muestra.temperatura_minima}°C a {muestra.temperatura_maxima}°C
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {muestra.vencimiento ? (
                                                            <span className="inline-flex items-center gap-1 text-gray-600">
                                                                <Calendar className="w-4 h-4" /> {new Date(muestra.vencimiento).toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">Sin vencimiento</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-gray-400 w-10">
                                                        {expandedRows.includes(muestra.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(muestra.id) && (
                                                    <tr className="bg-gray-50/50">
                                                        <td colSpan="6" className="px-6 py-4 border-l-2 border-indigo-400">
                                                            <div className="text-sm">
                                                                <span className="font-medium text-gray-700 mr-2">Observación:</span>
                                                                <span className="text-gray-600">{muestra.observaciones || <span className="italic text-gray-400">Sin observación</span>}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                        {muestras.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No hay muestras registradas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                    <Pagination 
                            links={muestras.links} 
                            currentPage={muestras.current_page} 
                            lastPage={muestras.last_page} 
                        />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
