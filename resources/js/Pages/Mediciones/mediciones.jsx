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
                <h2 className="text-xl font-bold leading-tight text-slate-800 uppercase tracking-wider">
                    Historial de Mediciones
                </h2>
            }
        >
            <Head title="Mediciones" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 text-gray-900">
                            
                            {/* Filtros Toolbar */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 items-end">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Suministro Eléctrico</label>
                                    <select name="bateria" defaultValue={filters?.bateria || ''} onChange={handleFilterChange} className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer">
                                        <option value="">Todos</option>
                                        <option value="conectada">En Batería (Corte de Luz)</option>
                                        <option value="bateria">Corriente Eléctrica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Dispositivo</label>
                                    <select name="dispositivo_id" defaultValue={filters?.dispositivo_id || ''} onChange={handleFilterChange} className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer">
                                        <option value="">Todos los Dispositivos</option>
                                        {dispositivos?.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Temp. Mínima (°C)</label>
                                    <input type="number" step="0.1" name="min_temp" defaultValue={filters?.min_temp || ''} onBlur={handleFilterChange} onKeyDown={e => e.key === 'Enter' && handleFilterChange(e)} className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2" placeholder="Ej: -20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Temp. Máxima (°C)</label>
                                    <input type="number" step="0.1" name="max_temp" defaultValue={filters?.max_temp || ''} onBlur={handleFilterChange} onKeyDown={e => e.key === 'Enter' && handleFilterChange(e)} className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2" placeholder="Ej: -10" />
                                </div>
                            </div>

                            {/* Tabla de Mediciones */}
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full whitespace-nowrap text-left text-sm">
                                    <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Fecha y Hora</th>
                                            <th className="px-6 py-4">Dispositivo / Laboratorio</th>
                                            <th className="px-6 py-4">Temperatura</th>
                                            <th className="px-6 py-4">Corriente Eléctrica</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {mediciones.data.map((medicion) => (
                                            <tr key={medicion.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">
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
                                                    <button 
                                                        onClick={() => eliminarMedicion(medicion.id)} 
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-sm hover:scale-105" 
                                                        title="Eliminar permanentemente"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {mediciones.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
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
