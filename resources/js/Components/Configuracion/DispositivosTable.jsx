import { Cpu, Settings, Plus, Clock, CheckCircle2, XCircle, Wifi, Trash2, History } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { router } from '@inertiajs/react';

export default function DispositivosTable({ 
    dispositivos = { data: [], links: [] }, 
    filters = {}, 
    freezers = [], 
    onOpenAddModal, 
    onOpenEditModal,
    verInactivos = false,
    onToggleInactivos
}) {
    const handleFilterChange = (e) => {
        router.get(route(route().current()), { ...filters, [e.target.name]: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSoftDelete = (dispositivo) => {
        if (confirm(`¿Estás seguro de mover el dispositivo "${dispositivo.nombre}" al historial de inactivos?`)) {
            router.delete(route('configuracion.dispositivo.destroy', dispositivo.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div>
            <div className="overflow-hidden bg-white sm:rounded-xl border border-gray-100">
                <div className="p-6 text-gray-900">
                    
                    {/* Barra Superior de Control */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Laboratorio (Freezer)</label>
                            <select name="freezer_id" defaultValue={filters?.freezer_id || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Todos</option>
                                {freezers?.map(f => (
                                    <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                ))}
                            </select>
                        </div>

                        {/* Botones: Agregar (AZUL) e Historial Inactivos (NEUTRO) */}
                        <div className="flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={onOpenAddModal} 
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Agregar Dispositivo
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={onToggleInactivos} 
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold border shadow-sm transition-colors ${
                                    verInactivos 
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <History className="w-4 h-4" /> 
                                {verInactivos ? 'Ver Dispositivos Activos' : 'Historial Inactivos'}
                            </button>
                        </div>
                    </div>

                    {/* Tabla de Dispositivos */}
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Dispositivo / Laboratorio</th>
                                    <th className="px-6 py-4">Intervalo Telemetría</th>
                                    <th className="px-6 py-4">Alertas Activas</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dispositivos.data.map((dispositivo) => (
                                    <tr key={dispositivo.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 text-indigo-700 rounded-lg">
                                                    <Cpu className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{dispositivo.nombre}</span>
                                                    <span className="text-xs text-slate-400">{dispositivo.freezer?.ubicacion || 'No asignado'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            <span className="inline-flex items-center gap-1 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                Cada {dispositivo.intervalo_telemetria ?? 5} seg
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {dispositivo.alerta_temperatura_activa && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded border border-red-100">Temp</span>
                                                )}
                                                {dispositivo.alerta_bateria_activa && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded border border-amber-100">Batería</span>
                                                )}
                                                {dispositivo.alerta_vencimiento_activa && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded border border-purple-100">Vencimiento</span>
                                                )}
                                                {dispositivo.alerta_inactividad_activa && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-100">Inactividad</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button 
                                                    onClick={() => onOpenEditModal(dispositivo)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                                    title="Configurar Parámetros"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSoftDelete(dispositivo)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                    title="Mover a inactivos (Desactivar)"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {dispositivos.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No hay dispositivos activos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
            <Pagination
                links={dispositivos.links}
                currentPage={dispositivos.current_page}
                lastPage={dispositivos.last_page}
            />
        </div>
    );
}
