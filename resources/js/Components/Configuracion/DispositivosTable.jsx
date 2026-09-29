import { Cpu, Settings, Plus, Clock, Trash2, History, RotateCcw } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import DeleteDispositivoModal from '@/Components/Configuracion/DeleteDispositivoModal';
import RestoreDispositivoModal from '@/Components/Configuracion/RestoreDispositivoModal';
import ForceDeleteDispositivoModal from '@/Components/Configuracion/ForceDeleteDispositivoModal';

export default function DispositivosTable({ 
    dispositivos = { data: [], links: [] }, 
    filters = {}, 
    freezers = [], 
    onOpenAddModal, 
    onOpenEditModal
}) {
    const isInactiveMode = filters?.estado === 'inactivo';

    // Estados para modales de confirmación
    const [deletingDispositivo, setDeletingDispositivo] = useState(null);
    const [restoringDispositivo, setRestoringDispositivo] = useState(null);
    const [forceDeletingDispositivo, setForceDeletingDispositivo] = useState(null);

    const handleFilterChange = (e) => {
        router.get(route(route().current()), { ...filters, [e.target.name]: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const toggleInactiveMode = () => {
        const nextEstado = isInactiveMode ? 'activo' : 'inactivo';
        router.get(route(route().current()), { ...filters, estado: nextEstado }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSoftDelete = (dispositivo) => {
        setDeletingDispositivo(dispositivo);
    };

    const handleRestore = (dispositivo) => {
        setRestoringDispositivo(dispositivo);
    };

    const handleForceDelete = (dispositivo) => {
        setForceDeletingDispositivo(dispositivo);
    };

    return (
        <div>
            <div className="overflow-hidden bg-white sm:rounded-xl">
                <div className="p-6 text-slate-900">
                    
                    {/* Barra Superior de filtros y botones */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="w-full sm:w-64">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Laboratorio (Freezer)</label>
                            <select 
                                name="freezer_id" 
                                value={filters?.freezer_id || ''} 
                                onChange={handleFilterChange} 
                                className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer"
                            >
                                <option value="">Todos los laboratorios</option>
                                {freezers?.map(f => (
                                    <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                ))}
                            </select>
                        </div>

                        {/* Botones principales */}
                        <div className="flex items-center gap-2">
                            {!isInactiveMode ? (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={onOpenAddModal} 
                                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar dispositivo
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        onClick={toggleInactiveMode} 
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <History className="w-4 h-4" /> Historial inactivos
                                    </button>
                                </>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={toggleInactiveMode} 
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <History className="w-4 h-4" /> Ver dispositivos activos
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabla de Dispositivos */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                        <table className="w-full whitespace-nowrap text-left text-sm text-slate-600">
                            <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">{isInactiveMode ? 'Dispositivo Inactivo / Laboratorio' : 'Dispositivo / Laboratorio'}</th>
                                    <th className="px-6 py-4">Intervalo telemetría</th>
                                    <th className="px-6 py-4">{isInactiveMode ? 'Fecha Desactivación' : 'Alertas Activas'}</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {dispositivos.data.map((dispositivo) => (
                                    <tr key={dispositivo.id} className={`hover:bg-slate-50 transition-colors ${isInactiveMode ? 'bg-slate-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isInactiveMode ? 'text-slate-400' : 'text-indigo-700'}`}>
                                                    <Cpu className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-semibold ${isInactiveMode ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                                                        {dispositivo.nombre}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{dispositivo.freezer?.ubicacion || 'No asignado'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            <span className="inline-flex items-center gap-1 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                Cada {dispositivo.intervalo_telemetria ?? 5} seg
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!isInactiveMode ? (
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
                                            ) : (
                                                <span className="text-xs font-mono text-slate-500">
                                                    {dispositivo.deleted_at ? new Date(dispositivo.deleted_at).toLocaleString() : 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {!isInactiveMode ? (
                                                    <>
                                                        <button 
                                                            onClick={() => onOpenEditModal(dispositivo)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-all shadow-sm hover:scale-105"
                                                            title="Configurar Parámetros"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleSoftDelete(dispositivo)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-sm hover:scale-105"
                                                            title="Desactivar Dispositivo"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleRestore(dispositivo)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all shadow-sm hover:scale-105"
                                                            title="Restaurar Dispositivo"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleForceDelete(dispositivo)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-sm hover:scale-105"
                                                            title="Eliminar permanentemente"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {dispositivos.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                            {isInactiveMode ? 'No hay dispositivos inactivos en el historial.' : 'No hay dispositivos activos registrados.'}
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

            {/* Modales de Confirmación */}
            <DeleteDispositivoModal 
                isOpen={deletingDispositivo !== null}
                onClose={() => setDeletingDispositivo(null)}
                dispositivo={deletingDispositivo}
            />

            <RestoreDispositivoModal 
                isOpen={restoringDispositivo !== null}
                onClose={() => setRestoringDispositivo(null)}
                dispositivo={restoringDispositivo}
            />

            <ForceDeleteDispositivoModal 
                isOpen={forceDeletingDispositivo !== null}
                onClose={() => setForceDeletingDispositivo(null)}
                dispositivo={forceDeletingDispositivo}
            />
        </div>
    );
}
