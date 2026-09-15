import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Thermometer, Zap, Battery, Trash2 } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function mediciones({ mediciones, filters, dispositivos }) {
    const handleFilterChange = (e) => {
        router.get(route(route().current()), { ...filters, [e.target.name]: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const eliminarMedicion = (id) => {
        if (confirm("¿Estás seguro de que deseas eliminar permanentemente esta medición?")) {
            router.delete(route('mediciones.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Historial de Mediciones
                </h2>
            }
        >
            <Head title="Mediciones" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Suministro Eléctrico</label>
                                    <select name="bateria" defaultValue={filters?.bateria || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">Todos</option>
                                        <option value="conectada">En Batería (Corte de Luz)</option>
                                        <option value="bateria">Corriente Eléctrica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dispositivo</label>
                                    <select name="dispositivo_id" defaultValue={filters?.dispositivo_id || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">Todos</option>
                                        {dispositivos?.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temp. Mínima (°C)</label>
                                    <input type="number" step="0.1" name="min_temp" defaultValue={filters?.min_temp || ''} onBlur={handleFilterChange} onKeyDown={e => e.key === 'Enter' && handleFilterChange(e)} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ej: -20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temp. Máxima (°C)</label>
                                    <input type="number" step="0.1" name="max_temp" defaultValue={filters?.max_temp || ''} onBlur={handleFilterChange} onKeyDown={e => e.key === 'Enter' && handleFilterChange(e)} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ej: -10" />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Fecha y Hora</th>
                                            <th className="px-6 py-4">Dispositivo / Laboratorio</th>
                                            <th className="px-6 py-4">Temperatura</th>
                                            <th className="px-6 py-4">Corriente Eléctrica</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {mediciones.data.map((medicion) => (
                                            <tr key={medicion.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                                    {new Date(medicion.fecha_y_hora).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-500 font-medium">
                                                        {medicion.dispositivo?.nombre || 'N/A'} • {medicion.dispositivo?.freezer?.ubicacion || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-600 px-2.5 py-1 rounded">
                                                        <Thermometer className="w-4 h-4 text-indigo-600" /> {Number(medicion.temperatura).toFixed(2)} °C
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {!medicion.bateria ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            <Zap className="w-3.5 h-3.5 text-emerald-600" /> Corriente Eléctrica
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                                            <Battery className="w-3.5 h-3.5 text-red-600" /> En Batería (Corte Luz)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => eliminarMedicion(medicion.id)} className="text-red-600 bg-red-100 hover:text-red-900 p-1 rounded-lg" title="Eliminar permanentemente">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {mediciones.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No hay mediciones registradas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                    <Pagination
                        links={mediciones.links}
                        currentPage={mediciones.current_page}
                        lastPage={mediciones.last_page}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
