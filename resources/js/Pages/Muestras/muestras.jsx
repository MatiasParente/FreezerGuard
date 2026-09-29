import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { FlaskConical, Calendar, Thermometer, ChevronDown, ChevronUp, AlertCircle, Plus, History, Edit, Trash2, RefreshCw, RotateCcw } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import MuestraFormModal from '@/Components/Muestras/MuestraFormModal';
import { useState, Fragment } from 'react';

export default function muestras({ muestras, filters, freezers, users, usuarios }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMuestra, setEditingMuestra] = useState(null);

    const isHistorial = filters?.estado === 'inactivo';

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

    const openCreateModal = () => {
        setEditingMuestra(null);
        setIsModalOpen(true);
    };

    const openEditModal = (muestra, e) => {
        e.stopPropagation();
        setEditingMuestra(muestra);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMuestra(null);
    };

    const toggleEstado = (muestra, nuevoEstado, e) => {
        e.stopPropagation();
        router.put(route('muestras.update', muestra.id), {
            ...muestra,
            vencimiento: muestra.vencimiento ? muestra.vencimiento.split('T')[0] : null,
            usuarios_ids: muestra.usuarios ? muestra.usuarios.map(u => u.id) : [],
            users_ids: muestra.users ? muestra.users.map(u => u.id) : [],
            estado: nuevoEstado
        }, {
            preserveScroll: true,
        });
    };

    const eliminarMuestra = (id, e) => {
        e.stopPropagation();
        if (confirm("¿Estás seguro de que deseas eliminar permanentemente esta muestra?")) {
            router.delete(route('muestras.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 uppercase tracking-wider">
                    {isHistorial ? 'Historial de Muestras (Inactivas)' : 'Muestras Almacenadas'}
                </h2>
            }
        >
            <Head title="Muestras" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 text-gray-900">
                            
                            {/* Toolbar de Filtro y Botones */}
                            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="w-full sm:w-64">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Laboratorio (Freezer)</label>
                                    <select name="freezer_id" defaultValue={filters?.freezer_id || ''} onChange={handleFilterChange} className="w-full border-slate-300 rounded-lg shadow-sm text-xs font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-2 cursor-pointer">
                                        <option value="">Todos los Laboratorios</option>
                                        {freezers?.map(f => (
                                            <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {!isHistorial ? (
                                        <>
                                            <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest shadow-sm transition ease-in-out duration-150">
                                                <Plus className="w-4 h-4" /> Agregar Muestra
                                            </button>
                                            <Link href={route('muestras.muestras', { estado: 'inactivo' })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                                <History className="w-4 h-4" /> Historial Inactivas
                                            </Link>
                                        </>
                                    ) : (
                                        <Link href={route('muestras.muestras', { estado: 'activo' })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                            <History className="w-4 h-4" /> Ver Activas
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Muestra</th>
                                            <th className="px-4 py-3">Dispositivo / Laboratorio</th>
                                            <th className="px-4 py-3">Cantidad</th>
                                            <th className="px-4 py-3">Rango Temp.</th>
                                            <th className="px-4 py-3">Vencimiento</th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                            <th className="px-3 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {muestras.data.map((muestra) => (
                                            <Fragment key={muestra.id}>
                                                <tr className={`hover:bg-slate-50 transition-colors cursor-pointer ${muestra.has_active_alert ? 'bg-red-50/70 hover:bg-red-100/70' : ''}`} onClick={() => toggleRow(muestra.id)}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {muestra.has_active_alert ? (
                                                                <div className="p-2 bg-red-100 text-red-600 rounded-lg animate-pulse" title="¡Alerta activa en el dispositivo!">
                                                                    <AlertCircle className="w-5 h-5" />
                                                                </div>
                                                            ) : (
                                                                <div className="p-2 text-indigo-600 rounded-lg">
                                                                    <FlaskConical className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-semibold text-slate-900 break-words">{muestra.titulo}</div>
                                                                <div className="text-xs text-slate-500 truncate max-w-[200px]">{muestra.descripcion}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-slate-500 font-medium whitespace-normal">
                                                            {muestra.freezer?.dispositivo?.nombre || 'N/A'} • {muestra.freezer?.ubicacion || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-900">
                                                        {muestra.cantidad}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1 text-indigo-700 font-mono text-xs font-semibold">
                                                            <Thermometer className="w-4 h-4 text-indigo-500" /> {muestra.temperatura_minima}°C a {muestra.temperatura_maxima}°C
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {muestra.vencimiento ? (
                                                            <span className="inline-flex items-center gap-1 text-slate-600 text-xs font-medium">
                                                                <Calendar className="w-4 h-4 text-slate-400" /> {new Date(muestra.vencimiento).toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">Sin vencimiento</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={(e) => openEditModal(muestra, e)} 
                                                                className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-all shadow-sm hover:scale-105" 
                                                                title="Modificar Muestra"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            {muestra.estado === 'activo' ? (
                                                                <button 
                                                                    onClick={(e) => toggleEstado(muestra, 'inactivo', e)} 
                                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-all shadow-sm hover:scale-105" 
                                                                    title="Inhabilitar muestra"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button 
                                                                        onClick={(e) => toggleEstado(muestra, 'activo', e)} 
                                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all shadow-sm hover:scale-105" 
                                                                        title="Restaurar muestra"
                                                                    >
                                                                        <RotateCcw className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => eliminarMuestra(muestra.id, e)} 
                                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-sm hover:scale-105" 
                                                                        title="Eliminar permanentemente"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-400 w-10">
                                                        {expandedRows.includes(muestra.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(muestra.id) && (
                                                    <tr className="bg-slate-50/50">
                                                        <td colSpan="7" className="px-6 py-4 border-l-4 border-indigo-500 whitespace-normal">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm whitespace-normal break-words">
                                                                <div>
                                                                    <span className="font-semibold text-slate-700 block mb-1">Docentes Responsables:</span>
                                                                    {muestra.users && muestra.users.length > 0 ? (
                                                                        <ul className="list-disc pl-5 text-slate-600 space-y-1">
                                                                            {muestra.users.map(u => <li key={u.id} className="break-words">{u.name} ({u.email})</li>)}
                                                                        </ul>
                                                                    ) : (
                                                                        <span className="text-slate-400 italic">No asignados</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-slate-700 block mb-1">Alumnos Asignados:</span>
                                                                    {muestra.usuarios && muestra.usuarios.length > 0 ? (
                                                                        <ul className="list-disc pl-5 text-slate-600 space-y-1">
                                                                            {muestra.usuarios.map(u => <li key={u.id} className="break-words">{u.nombre}</li>)}
                                                                        </ul>
                                                                    ) : (
                                                                        <span className="text-slate-400 italic">No asignados</span>
                                                                    )}
                                                                </div>
                                                                <div className="whitespace-normal break-words">
                                                                    <span className="font-semibold text-slate-700 block mb-1">Observaciones:</span>
                                                                    <p className="text-slate-600 whitespace-pre-wrap break-words leading-relaxed">{muestra.observaciones || <span className="italic text-slate-400">Sin observación</span>}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                        {muestras.data.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                                                    No hay muestras registradas en este estado.
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

            {/* Modal de Muestra Form desacoplado */}
            <MuestraFormModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                editingMuestra={editingMuestra}
                freezers={freezers}
                users={users}
                usuarios={usuarios}
            />
        </AuthenticatedLayout>
    );
}
