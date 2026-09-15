import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { FlaskConical, Calendar, Thermometer, ChevronDown, ChevronUp, AlertCircle, Plus, History, Edit, Trash2, RefreshCw } from 'lucide-react';
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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {isHistorial ? 'Historial de Muestras (Inactivas)' : 'Muestras Almacenadas'}
                </h2>
            }
        >
            <Head title="Muestras" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            
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
                                <div className="flex gap-2">
                                    {!isHistorial ? (
                                        <>
                                            <button onClick={openCreateModal} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 gap-2">
                                                <Plus className="w-4 h-4" /> Agregar Muestra
                                            </button>
                                            <Link href={route('muestras.muestras', { estado: 'inactivo' })} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                                <History className="w-4 h-4 mr-2" /> Ver Historial
                                            </Link>
                                        </>
                                    ) : (
                                        <Link href={route('muestras.muestras', { estado: 'activo' })} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                            Volver a Activas
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Muestra</th>
                                            <th className="px-6 py-4">Dispositivo / Laboratorio</th>
                                            <th className="px-6 py-4">Cantidad</th>
                                            <th className="px-6 py-4">Rango Temp.</th>
                                            <th className="px-6 py-4">Vencimiento</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                            <th className="px-4 py-4 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {muestras.data.map((muestra) => (
                                            <Fragment key={muestra.id}>
                                                <tr className={`hover:bg-gray-50 transition-colors cursor-pointer ${muestra.has_active_alert ? 'bg-red-50 hover:bg-red-100' : ''}`} onClick={() => toggleRow(muestra.id)}>
                                                    <td className="px-6 py-4">
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
                                                        <span className="inline-flex items-center gap-1 text-indigo-700">
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
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={(e) => openEditModal(muestra, e)} className="text-blue-600 hover:text-blue-900 p-1" title="Modificar">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            {muestra.estado === 'activo' ? (
                                                                <button onClick={(e) => toggleEstado(muestra, 'inactivo', e)} className="text-yellow-600 hover:text-yellow-900 p-1" title="Mover a inactivos (Historial)">
                                                                    <History className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button onClick={(e) => toggleEstado(muestra, 'activo', e)} className="text-green-600 hover:text-green-900 p-1" title="Recuperar a activos">
                                                                        <RefreshCw className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={(e) => eliminarMuestra(muestra.id, e)} className="text-red-600 hover:text-red-900 p-1" title="Eliminar permanentemente">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-gray-400 w-10">
                                                        {expandedRows.includes(muestra.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(muestra.id) && (
                                                    <tr className="bg-gray-50/50">
                                                        <td colSpan="7" className="px-6 py-4 border-l-2 border-indigo-400">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <span className="font-semibold text-gray-700 block mb-1">Docentes Responsables:</span>
                                                                    {muestra.users && muestra.users.length > 0 ? (
                                                                        <ul className="list-disc pl-5 text-gray-600">
                                                                            {muestra.users.map(u => <li key={u.id}>{u.name} ({u.email})</li>)}
                                                                        </ul>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">No asignados</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-gray-700 block mb-1">Alumnos Asignados:</span>
                                                                    {muestra.usuarios && muestra.usuarios.length > 0 ? (
                                                                        <ul className="list-disc pl-5 text-gray-600">
                                                                            {muestra.usuarios.map(u => <li key={u.id}>{u.nombre}</li>)}
                                                                        </ul>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">No asignados</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-gray-700 block mb-1">Observaciones:</span>
                                                                    <span className="text-gray-600">{muestra.observaciones || <span className="italic text-gray-400">Sin observación</span>}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                        {muestras.data.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
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
