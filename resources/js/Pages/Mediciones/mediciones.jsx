import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Thermometer, Battery, BatteryFull } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function mediciones({ mediciones, filters, dispositivos }) {
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
                    Historial de Mediciones
                </h2>
            }
        >
            <Head title="Mediciones" />

            <div>
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Batería</label>
                                    <select name="bateria" defaultValue={filters?.bateria || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">Todos</option>
                                        <option value="conectada">Conectada</option>
                                        <option value="bateria">Batería</option>
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
                                            <th className="px-6 py-4">Dispositivo / Lab</th>
                                            <th className="px-6 py-4">Temperatura</th>
                                            <th className="px-6 py-4">Batería</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {mediciones.data.map((medicion) => (
                                            <tr key={medicion.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(medicion.fecha_y_hora).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400 font-medium">
                                                        {medicion.dispositivo?.nombre || 'N/A'} • {medicion.dispositivo?.freezer?.ubicacion || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                                                        <Thermometer className="w-4 h-4" /> {medicion.temperatura}°C
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {medicion.bateria ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600">
                                                            <BatteryFull className="w-4 h-4" /> Conectada
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-orange-600">
                                                            <Battery className="w-4 h-4" /> Batería
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {mediciones.data.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
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
