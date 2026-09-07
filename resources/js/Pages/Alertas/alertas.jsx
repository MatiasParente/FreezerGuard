import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useState, Fragment } from 'react';

export default function alertas({ alertas, filters, dispositivos, tipos }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [editingAlerta, setEditingAlerta] = useState(null);
    const { data, setData, put, processing, reset } = useForm({
        observacion: '',
    });

    const toggleRow = (id) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const openEditModal = (alerta) => {
        setEditingAlerta(alerta);
        setData('observacion', alerta.observacion || '');
    };

    const closeEditModal = () => {
        setEditingAlerta(null);
        reset();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('alertas.update', editingAlerta.id), {
            onSuccess: () => closeEditModal(),
        });
    };

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
                    Alertas Generadas
                </h2>
            }
        >
            <Head title="Alertas" />

            <div>
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select name="estado" defaultValue={filters?.estado || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">Todos</option>
                                        <option value="1">Pendiente</option>
                                        <option value="2">Resuelta</option>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Alerta</label>
                                    <select name="tipo" defaultValue={filters?.tipo || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">Todos</option>
                                        {tipos?.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Estado</th>
                                            <th className="px-6 py-4">Fecha y Hora</th>
                                            <th className="px-6 py-4">Tipo</th>
                                            <th className="px-6 py-4">Dispositivo / Lab</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                            <th className="px-4 py-4 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {alertas.data.map((alerta) => (
                                            <Fragment key={alerta.id}>
                                                <tr 
                                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => toggleRow(alerta.id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        {alerta.estado === 2 ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle2 className="w-4 h-4" /> Resuelta
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                <AlertCircle className="w-4 h-4" /> Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {new Date(alerta.fecha_y_hora).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {alerta.alerta?.tipo || 'Desconocido'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-400 font-medium">
                                                            {alerta.dispositivo?.nombre || 'N/A'} • {alerta.dispositivo?.freezer?.ubicacion || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => openEditModal(alerta)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                                                            <Edit2 className="w-4 h-4" /> Editar Obs.
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-4 text-gray-400 w-10">
                                                        {expandedRows.includes(alerta.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(alerta.id) && (
                                                    <tr className="bg-gray-50/50">
                                                        <td colSpan="6" className="px-6 py-4 border-l-2 border-indigo-400">
                                                            <div className="text-sm">
                                                                <span className="font-medium text-gray-700 mr-2">Observación:</span>
                                                                <span className="text-gray-600">{alerta.observacion || <span className="italic text-gray-400">Sin observación</span>}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                        {alertas.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
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

            <Modal show={editingAlerta !== null} onClose={closeEditModal} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Modificar Observación
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="observacion" value="Observación" />
                        <TextInput
                            id="observacion"
                            type="text"
                            name="observacion"
                            value={data.observacion}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('observacion', e.target.value)}
                            isFocused={true}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeEditModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
