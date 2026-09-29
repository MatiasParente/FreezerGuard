import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Edit2, ChevronDown, ChevronUp, Trash2, Thermometer } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import ObservacionModal from '@/Components/Alertas/ObservacionModal';
import { useState, Fragment } from 'react';

export default function alertas({ alertas, filters, dispositivos, tipos }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [editingAlerta, setEditingAlerta] = useState(null);

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

    const eliminarAlerta = (id, e) => {
        e.stopPropagation();
        if (confirm("¿Estás seguro de que deseas eliminar permanentemente esta alerta?")) {
            router.delete(route('alertas.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const getDuracion = (inicio, fin) => {
        if (!inicio || !fin) return 'N/A';
        const diffMs = new Date(fin) - new Date(inicio);
        const diffMins = Math.round(diffMs / 60000);
        if (diffMins < 60) return `${diffMins} min`;
        const diffHrs = Math.floor(diffMins / 60);
        const remMins = diffMins % 60;
        return `${diffHrs}h ${remMins}m`;
    };

    const isTempAlert = (alerta) => {
        const tipoNombre = (alerta.alerta?.tipo || '').toLowerCase();
        return tipoNombre.includes('temperatura');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 uppercase tracking-wider">
                    Alertas Generadas
                </h2>
            }
        >
            <Head title="Alertas" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 items-end">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Estado</label>
                                    <select name="estado" defaultValue={filters?.estado || ''} onChange={handleFilterChange} className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer">
                                        <option value="">Todos los Estados</option>
                                        <option value="1">Pendiente</option>
                                        <option value="2">Resuelta</option>
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
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tipo de Alerta</label>
                                    <select name="tipo" defaultValue={filters?.tipo || ''} onChange={handleFilterChange} className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer">
                                        <option value="">Todos los Tipos</option>
                                        {tipos?.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Estado</th>
                                            <th className="px-4 py-3">Fecha y Hora</th>
                                            <th className="px-4 py-3">Tipo de Alerta</th>
                                            <th className="px-4 py-3">Dispositivo / Laboratorio</th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                            <th className="px-3 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {alertas.data.map((alerta) => (
                                            <Fragment key={alerta.id}>
                                                <tr 
                                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                    onClick={() => toggleRow(alerta.id)}
                                                >
                                                    <td className="px-4 py-3">
                                                        {alerta.estado === 2 ? (
                                                            <div className="flex flex-col items-start gap-1">
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200">
                                                                    <CheckCircle2 className="w-4 h-4" /> Resuelta
                                                                </span>
                                                                <span className="text-xs text-slate-500 ml-1">
                                                                    {alerta.fecha_y_hora_resuelto ? new Date(alerta.fecha_y_hora_resuelto).toLocaleString() : new Date(alerta.updated_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-red-600 bg-red-50 border border-red-200">
                                                                <AlertCircle className="w-4 h-4 animate-pulse" /> Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                                        {new Date(alerta.fecha_y_hora).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-normal">
                                                        {alerta.alerta?.tipo || 'Desconocido'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-slate-500 font-medium whitespace-normal">
                                                            {alerta.dispositivo?.nombre || 'N/A'} • {alerta.dispositivo?.freezer?.ubicacion || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => setEditingAlerta(alerta)} 
                                                                className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-all shadow-sm hover:scale-105"
                                                                title="Editar Observación de Alerta"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => eliminarAlerta(alerta.id, e)} 
                                                                className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-sm hover:scale-105"
                                                                title="Eliminar Alerta"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-400 w-10">
                                                        {expandedRows.includes(alerta.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(alerta.id) && (
                                                    <tr className="bg-slate-50/70">
                                                        <td colSpan="6" className="px-6 py-4 border-l-4 border-indigo-500 whitespace-normal">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm whitespace-normal break-words">
                                                                <div>
                                                                    <span className="font-semibold text-slate-800 block mb-1">Muestras Afectadas:</span>
                                                                    {alerta.dispositivo?.freezer?.muestras?.filter(m => m.estado === 'activo').length > 0 ? (
                                                                        <ul className="list-disc pl-5 text-slate-600 space-y-1">
                                                                            {alerta.dispositivo.freezer.muestras.filter(m => m.estado === 'activo').map(m => (
                                                                                <li key={m.id} className="mb-2">
                                                                                    <span className="font-medium text-slate-800 break-words">{m.titulo}</span>
                                                                                    <div className="text-xs mt-1 break-words">
                                                                                        <span className="font-semibold text-slate-700">Docentes: </span> 
                                                                                        {m.users?.length ? m.users.map(u => u.name).join(', ') : 'Ninguno'}
                                                                                    </div>
                                                                                    <div className="text-xs break-words">
                                                                                        <span className="font-semibold text-slate-700">Alumnos: </span> 
                                                                                        {m.usuarios?.length ? m.usuarios.map(u => u.nombre).join(', ') : 'Ninguno'}
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <span className="text-slate-400 italic">Ninguna muestra activa</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-slate-800 block mb-1">Duración del evento:</span>
                                                                    <span className="text-slate-700 font-medium block mb-3">
                                                                        {alerta.estado === 2 ? getDuracion(alerta.fecha_y_hora, alerta.fecha_y_hora_resuelto || alerta.updated_at) : 'En progreso...'}
                                                                    </span>

                                                                    <span className="font-semibold text-slate-800 block mb-1">Temp. Origen:</span>
                                                                    {isTempAlert(alerta) && alerta.temperatura_origen !== null ? (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200">
                                                                            <Thermometer className="w-3.5 h-3.5 text-indigo-500" />
                                                                            {Number(alerta.temperatura_origen).toFixed(2)} °C
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-slate-400 text-xs font-medium">N/A</span>
                                                                    )}
                                                                </div>
                                                                <div className="whitespace-normal break-words">
                                                                    <span className="font-semibold text-slate-800 block mb-1">Observación:</span>
                                                                    <p className="text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{alerta.observacion || <span className="italic text-slate-400">Sin observación</span>}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                        {alertas.data.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                                                    No hay alertas generadas registradas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                        
                    </div>
                    <Pagination 
                        links={alertas.links} 
                        currentPage={alertas.current_page} 
                        lastPage={alertas.last_page} 
                    />
                </div>
                
            </div>

            {/* modal de Observación */}
            <ObservacionModal 
                isOpen={editingAlerta !== null}
                onClose={() => setEditingAlerta(null)}
                alerta={editingAlerta}
            />
        </AuthenticatedLayout>
    );
}
