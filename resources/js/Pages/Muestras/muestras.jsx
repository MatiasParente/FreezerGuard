import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { FlaskConical, Calendar, Thermometer, ChevronDown, ChevronUp, AlertCircle, Plus, History, Edit, Trash2, RefreshCw } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState, Fragment } from 'react';

export default function muestras({ muestras, filters, freezers, users, usuarios }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMuestra, setEditingMuestra] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        titulo: '',
        descripcion: '',
        cantidad: '',
        vencimiento: '',
        temperatura_minima: '-25.0',
        temperatura_maxima: '-10.0',
        observaciones: '',
        freezer_id: '',
        usuarios_ids: [],
        users_ids: [],
        estado: 'activo',
    });

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
        reset();
        setEditingMuestra(null);
        setIsModalOpen(true);
    };

    const openEditModal = (muestra, e) => {
        e.stopPropagation();
        setData({
            titulo: muestra.titulo || '',
            descripcion: muestra.descripcion || '',
            cantidad: muestra.cantidad || '',
            vencimiento: muestra.vencimiento ? muestra.vencimiento.split('T')[0] : '',
            temperatura_minima: muestra.temperatura_minima || '-25.0',
            temperatura_maxima: muestra.temperatura_maxima || '-10.0',
            observaciones: muestra.observaciones || '',
            freezer_id: muestra.freezer_id || '',
            usuarios_ids: muestra.usuarios ? muestra.usuarios.map(u => u.id) : [],
            users_ids: muestra.users ? muestra.users.map(u => u.id) : [],
            estado: muestra.estado,
        });
        setEditingMuestra(muestra);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingMuestra(null);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (data.users_ids.length === 0) {
            alert("No has asignado ningún docente. Se te asignará a ti por defecto (si eres docente).");
        }

        if (editingMuestra) {
            put(route('muestras.update', editingMuestra.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('muestras.store'), {
                onSuccess: () => closeModal(),
            });
        }
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

            <div>
                <div className="mx-auto max-w-7xl">
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
                                            <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2">
                                                <Plus className="w-4 h-4" /> Agregar Muestra
                                            </PrimaryButton>
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
                                            <th className="px-6 py-4">Dispositivo / Lab</th>
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
                                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
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
                                                        <span className="inline-flex items-center gap-1 text-gray-600">
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

            {/* Modal for Create/Edit */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submitForm} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingMuestra ? 'Modificar Muestra' : 'Agregar Muestra'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="titulo" value="Nombre" />
                            <TextInput id="titulo" type="text" className="mt-1 block w-full" value={data.titulo} onChange={e => setData('titulo', e.target.value)} required />
                            <InputError message={errors.titulo} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="cantidad" value="Cantidad" />
                            <TextInput id="cantidad" type="number" className="mt-1 block w-full" value={data.cantidad} onChange={e => setData('cantidad', e.target.value)} />
                            <InputError message={errors.cantidad} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="descripcion" value="Descripción" />
                            <TextInput id="descripcion" type="text" className="mt-1 block w-full" value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} />
                            <InputError message={errors.descripcion} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="temperatura_minima" value="Temperatura Mínima (°C)" />
                            <TextInput id="temperatura_minima" type="number" step="0.1" className="mt-1 block w-full" value={data.temperatura_minima} onChange={e => setData('temperatura_minima', e.target.value)} />
                            <InputError message={errors.temperatura_minima} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="temperatura_maxima" value="Temperatura Máxima (°C)" />
                            <TextInput id="temperatura_maxima" type="number" step="0.1" className="mt-1 block w-full" value={data.temperatura_maxima} onChange={e => setData('temperatura_maxima', e.target.value)} />
                            <InputError message={errors.temperatura_maxima} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="freezer_id" value="Ubicación (Freezer)" />
                            <select id="freezer_id" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={data.freezer_id} onChange={e => setData('freezer_id', e.target.value)} required>
                                <option value="">Seleccione...</option>
                                {freezers?.map(f => (
                                    <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                ))}
                            </select>
                            <InputError message={errors.freezer_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="vencimiento" value="Fecha de Vencimiento" />
                            <TextInput id="vencimiento" type="date" className="mt-1 block w-full" value={data.vencimiento} onChange={e => setData('vencimiento', e.target.value)} />
                            <InputError message={errors.vencimiento} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="users_ids" value="Docentes Responsables (Emails)" />
                            <select multiple className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={data.users_ids} onChange={e => setData('users_ids', Array.from(e.target.selectedOptions, option => option.value))}>
                                {users?.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Ctrl+Clic para seleccionar varios. Si dejas vacío, se te asignará automáticamente.</p>
                            <InputError message={errors.users_ids} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="usuarios_ids" value="Alumnos Asignados" />
                            <select multiple className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={data.usuarios_ids} onChange={e => setData('usuarios_ids', Array.from(e.target.selectedOptions, option => option.value))}>
                                {usuarios?.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Ctrl+Clic para seleccionar varios.</p>
                            <InputError message={errors.usuarios_ids} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="observaciones" value="Observaciones" />
                            <textarea id="observaciones" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" rows="3" value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} />
                            <InputError message={errors.observaciones} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingMuestra ? 'Guardar Cambios' : 'Agregar'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
