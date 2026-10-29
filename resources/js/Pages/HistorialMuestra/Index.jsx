import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { History, Calendar, User, FlaskConical, Tag } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function Index({ updates, filters, freezers }) {

    const handleFilterChange = (e) => {
        router.get(
            route(route().current()),
            { ...filters, [e.target.name]: e.target.value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Helper para formatear badges según el tipo de acción
    const getAccionBadge = (accion) => {
        const accionLower = (accion || '').toLowerCase();
        
        if (accionLower === 'ingreso') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Ingreso
                </span>
            );
        } else if (accionLower === 'retiro') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Retiro
                </span>
            );
        } else if (accionLower === 'eliminacion' || accionLower === 'eliminación') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Eliminación
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {accion || 'Registro'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    Historial de Auditoría de Muestras
                </h2>
            }
        >
            <Head title="Historial de Muestras" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 text-gray-900">
                            
                            {/* Toolbar de Filtro */}
                            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="w-full sm:w-72">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Filtrar por Laboratorio / Freezer
                                    </label>
                                    <select
                                        name="freezer_id"
                                        defaultValue={filters?.freezer_id || ''}
                                        onChange={handleFilterChange}
                                        className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer"
                                    >
                                        <option value="">Todos los Laboratorios</option>
                                        {freezers?.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.ubicacion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tabla de Historial */}
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Muestra</th>
                                            <th className="px-4 py-3">Dispositivo / Laboratorio</th>
                                            <th className="px-4 py-3">Acción</th>
                                            <th className="px-4 py-3">Usuario Responsable</th>
                                            <th className="px-4 py-3">Fecha y Hora</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {updates.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                
                                                {/* Nombre Muestra */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 text-indigo-600 bg-indigo-50 rounded-lg">
                                                            <FlaskConical className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 break-words">
                                                                {item.nombre_muestra || item.muestra?.titulo || 'Muestra sin nombre'}
                                                            </div>
                                                            {item.muestra_id ? (
                                                                <div className="text-xs text-slate-400">ID Muestra: #{item.muestra_id}</div>
                                                            ) : (
                                                                <div className="text-xs text-slate-400 italic">Muestra eliminada</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Dispositivo / Laboratorio */}
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-slate-600 font-medium whitespace-normal block">
                                                        {item.freezer?.dispositivo?.nombre ? (
                                                            <>
                                                                <span className="font-semibold text-slate-800">{item.freezer.dispositivo.nombre}</span>
                                                                <span className="text-slate-400"> — </span>
                                                            </>
                                                        ) : null}
                                                        {item.freezer?.ubicacion || 'N/A'}
                                                    </span>
                                                </td>

                                                {/* Acción Realizada */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {getAccionBadge(item.accion)}
                                                </td>

                                                {/* Usuario Responsable */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                        {item.user?.name || 'Sistema'}
                                                    </span>
                                                </td>

                                                {/* Fecha y Hora */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 text-slate-600 text-xs font-medium">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {item.fecha ? new Date(item.fecha).toLocaleString() : 'N/A'}
                                                    </span>
                                                </td>

                                            </tr>
                                        ))}

                                        {updates.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                                    No hay registros de historial en este laboratorio.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>

                    {/* Paginación */}
                    <Pagination 
                        links={updates.links} 
                        currentPage={updates.current_page} 
                        lastPage={updates.last_page} 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}