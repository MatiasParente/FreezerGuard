import { Cpu, RefreshCw, Trash2 } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { router } from '@inertiajs/react';

export default function HistorialDispositivosTable({ dispositivosInactivos = { data: [], links: [] } }) {
    
    const handleRestore = (id, nombre) => {
        if (confirm(`¿Deseas restaurar el dispositivo "${nombre}" a la lista de activos?`)) {
            router.post(route('configuración.dispositivo.restore', id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleForceDelete = (id, nombre) => {
        if (confirm(`¿Estás seguro de eliminar definitivamente el dispositivo "${nombre}"? Se borrarán permanentemente sus mediciones y registros.`)) {
            router.delete(route('configuración.dispositivo.forceDelete', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div>
            <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                <div className="p-6 text-gray-900">
                    <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-900">
                        <strong>Los dispositivos inactivos no procesan alertas.</strong>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Dispositivo Inactivo</th>
                                    <th className="px-6 py-4">Laboratorio</th>
                                    <th className="px-6 py-4">Fecha Desactivación</th>
                                    <th className="px-6 py-4 text-right">Acciones de Historial</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dispositivosInactivos.data.map((dispositivo) => (
                                    <tr key={dispositivo.id} className="hover:bg-gray-50 transition-colors bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 text-slate-500 rounded-lg">
                                                    <Cpu className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-700 line-through">{dispositivo.nombre}</span>
                                                    <span className="text-xs text-slate-400">{dispositivo.descripcion || 'Sin descripción'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {dispositivo.freezer?.ubicacion || 'Sin asignar'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                            {dispositivo.deleted_at ? new Date(dispositivo.deleted_at).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => handleRestore(dispositivo.id, dispositivo.nombre)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleForceDelete(dispositivo.id, dispositivo.nombre)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {dispositivosInactivos.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No hay dispositivos inactivos en el historial.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
            <Pagination
                links={dispositivosInactivos.links}
                currentPage={dispositivosInactivos.current_page}
                lastPage={dispositivosInactivos.last_page}
            />
        </div>
    );
}
