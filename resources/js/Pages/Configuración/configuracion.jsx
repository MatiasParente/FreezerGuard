import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Cpu, Settings, Plus, Wifi, Bell, Thermometer, ShieldAlert } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState } from 'react';

export default function configuracion({ dispositivos, filters, freezers, available_freezers }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDispositivo, setEditingDispositivo] = useState(null);

    // Form para agregar dispositivo
    const addForm = useForm({
        nombre: '',
        descripcion: '',
        freezer_id: '',
        is_new_freezer: false,
        nueva_ubicacion: '',
    });

    // Form para editar/configurar dispositivo
    const editForm = useForm({
        nombre: '',
        descripcion: '',
        alerta_temperatura_activa: true,
        alerta_bateria_activa: true,
        alerta_vencimiento_activa: true,
        alerta_inactividad_activa: false,
        temp_min_default: -25.0,
        temp_max_default: -10.0,
        wifi_ssid: '',
        wifi_password: '',
    });

    const handleFilterChange = (e) => {
        router.get(route(route().current()), { ...filters, [e.target.name]: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openAddModal = () => {
        addForm.reset();
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        addForm.reset();
    };

    const openEditModal = (dispositivo) => {
        setEditingDispositivo(dispositivo);
        editForm.setData({
            nombre: dispositivo.nombre || '',
            descripcion: dispositivo.descripcion || '',
            alerta_temperatura_activa: dispositivo.alerta_temperatura_activa ?? true,
            alerta_bateria_activa: dispositivo.alerta_bateria_activa ?? true,
            alerta_vencimiento_activa: dispositivo.alerta_vencimiento_activa ?? true,
            alerta_inactividad_activa: dispositivo.alerta_inactividad_activa ?? false,
            temp_min_default: dispositivo.temp_min_default ?? -25.0,
            temp_max_default: dispositivo.temp_max_default ?? -10.0,
            wifi_ssid: dispositivo.wifi_ssid || '',
            wifi_password: dispositivo.wifi_password || '',
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingDispositivo(null);
        editForm.reset();
    };

    const submitAddForm = (e) => {
        e.preventDefault();
        addForm.post(route('configuración.dispositivo.store'), {
            onSuccess: () => closeAddModal(),
        });
    };

    const submitEditForm = (e) => {
        e.preventDefault();
        if (!editingDispositivo) return;

        editForm.put(route('configuración.dispositivo.update', editingDispositivo.id), {
            onSuccess: () => closeEditModal(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Configuración de Dispositivos
                </h2>
            }
        >
            <Head title="Configuración" />

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
                                <div>
                                    <PrimaryButton onClick={openAddModal} className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Agregar Dispositivo
                                    </PrimaryButton>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Dispositivo / Lab</th>
                                            <th className="px-6 py-4">Descripción</th>
                                            <th className="px-6 py-4">Alertas Activas</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dispositivos.data.map((dispositivo) => (
                                            <tr key={dispositivo.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                                                            <Cpu className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">{dispositivo.nombre}</span>
                                                            <span className="text-xs text-slate-400">{dispositivo.freezer?.ubicacion || 'No asignado'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                                                    {dispositivo.descripcion || 'Sin descripción'}
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
                                                    <button 
                                                        onClick={() => openEditModal(dispositivo)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                                    >
                                                        <Settings className="w-4 h-4" /> Configurar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {dispositivos.data.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                    No hay dispositivos registrados.
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
            </div>

            {/* Modal Agregar Dispositivo */}
            <Modal show={isAddModalOpen} onClose={closeAddModal} maxWidth="md">
                <form onSubmit={submitAddForm} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Agregar Dispositivo
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="nombre" value="Nombre del Dispositivo" />
                            <TextInput id="nombre" type="text" className="mt-1 block w-full" value={addForm.data.nombre} onChange={e => addForm.setData('nombre', e.target.value)} required />
                            <InputError message={addForm.errors.nombre} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="descripcion" value="Descripción" />
                            <textarea id="descripcion" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" rows="3" value={addForm.data.descripcion} onChange={e => addForm.setData('descripcion', e.target.value)} />
                            <InputError message={addForm.errors.descripcion} className="mt-2" />
                        </div>

                        <div className="flex items-center mt-4 mb-2">
                            <input
                                id="is_new_freezer"
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={addForm.data.is_new_freezer}
                                onChange={(e) => addForm.setData('is_new_freezer', e.target.checked)}
                            />
                            <label htmlFor="is_new_freezer" className="ml-2 block text-sm text-gray-900">
                                Crear nuevo laboratorio (Freezer)
                            </label>
                        </div>

                        {!addForm.data.is_new_freezer ? (
                            <div>
                                <InputLabel htmlFor="freezer_id" value="Ubicación Existente (Freezer)" />
                                <select id="freezer_id" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={addForm.data.freezer_id} onChange={e => addForm.setData('freezer_id', e.target.value)} required={!addForm.data.is_new_freezer}>
                                    <option value="">Seleccione...</option>
                                    {available_freezers?.map(f => (
                                        <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                    ))}
                                </select>
                                <InputError message={addForm.errors.freezer_id} className="mt-2" />
                            </div>
                        ) : (
                            <div>
                                <InputLabel htmlFor="nueva_ubicacion" value="Nueva Ubicación del Laboratorio" />
                                <TextInput 
                                    id="nueva_ubicacion" 
                                    type="text" 
                                    className="mt-1 block w-full" 
                                    value={addForm.data.nueva_ubicacion} 
                                    onChange={e => addForm.setData('nueva_ubicacion', e.target.value)} 
                                    required={addForm.data.is_new_freezer} 
                                    placeholder="Ej: Lab Central 1" 
                                />
                                <InputError message={addForm.errors.nueva_ubicacion} className="mt-2" />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeAddModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={addForm.processing}>
                            Agregar
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Configurar Dispositivo */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="2xl">
                <form onSubmit={submitEditForm} className="p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                        <Settings className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Configuración de Dispositivo: <span className="text-indigo-600">{editingDispositivo?.nombre}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Sección 1: Datos Básicos */}
                        <div className="space-y-4 md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                                <Cpu className="w-4 h-4 text-slate-600" /> Datos Principales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="edit_nombre" value="Nombre del Dispositivo" />
                                    <TextInput id="edit_nombre" type="text" className="mt-1 block w-full" value={editForm.data.nombre} onChange={e => editForm.setData('nombre', e.target.value)} required />
                                    <InputError message={editForm.errors.nombre} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_descripcion" value="Descripción" />
                                    <TextInput id="edit_descripcion" type="text" className="mt-1 block w-full" value={editForm.data.descripcion} onChange={e => editForm.setData('descripcion', e.target.value)} />
                                    <InputError message={editForm.errors.descripcion} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Sección 2: Control de Alertas */}
                        <div className="space-y-3 bg-red-50/50 p-4 rounded-lg border border-red-100">
                            <h3 className="font-semibold text-red-900 text-sm flex items-center gap-1.5">
                                <Bell className="w-4 h-4 text-red-600" /> Estado de Alertas (Activas)
                            </h3>

                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={editForm.data.alerta_temperatura_activa}
                                    onChange={e => editForm.setData('alerta_temperatura_activa', e.target.checked)}
                                />
                                Alerta por Temperatura Fuera de Rango
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={editForm.data.alerta_bateria_activa}
                                    onChange={e => editForm.setData('alerta_bateria_activa', e.target.checked)}
                                />
                                Alerta por Corte de Energía (Batería)
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={editForm.data.alerta_vencimiento_activa}
                                    onChange={e => editForm.setData('alerta_vencimiento_activa', e.target.checked)}
                                />
                                Alerta por Vencimiento de Muestra
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={editForm.data.alerta_inactividad_activa}
                                    onChange={e => editForm.setData('alerta_inactividad_activa', e.target.checked)}
                                />
                                Alerta por Inactividad (&gt;30 min sin datos)
                            </label>
                        </div>

                        {/* Sección 3: Temperaturas por Defecto */}
                        <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                                <Thermometer className="w-4 h-4 text-blue-600" /> Rangos Default (°C)
                            </h3>
                            <p className="text-xs text-blue-700">
                                Se aplican sólo cuando no hay muestras activas con rango definido.
                            </p>
                            <div>
                                <InputLabel htmlFor="temp_min_default" value="Temperatura Mínima Default (°C)" />
                                <TextInput id="temp_min_default" type="number" step="0.1" className="mt-1 block w-full" value={editForm.data.temp_min_default} onChange={e => editForm.setData('temp_min_default', e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel htmlFor="temp_max_default" value="Temperatura Máxima Default (°C)" />
                                <TextInput id="temp_max_default" type="number" step="0.1" className="mt-1 block w-full" value={editForm.data.temp_max_default} onChange={e => editForm.setData('temp_max_default', e.target.value)} required />
                            </div>
                        </div>

                        {/* Sección 4: Wi-Fi Remoto */}
                        <div className="space-y-4 md:col-span-2 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                            <h3 className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
                                <Wifi className="w-4 h-4 text-emerald-600" /> Credenciales Wi-Fi Remotas
                            </h3>
                            <p className="text-xs text-emerald-700">
                                Al guardar, estas credenciales se enviarán automáticamente en la respuesta HTTP hacia el ESP32.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="wifi_ssid" value="Wi-Fi SSID (Red)" />
                                    <TextInput id="wifi_ssid" type="text" className="mt-1 block w-full" value={editForm.data.wifi_ssid} onChange={e => editForm.setData('wifi_ssid', e.target.value)} placeholder="Ej: MiRed_WiFi" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="wifi_password" value="Wi-Fi Password (Contraseña)" />
                                    <TextInput id="wifi_password" type="password" className="mt-1 block w-full" value={editForm.data.wifi_password} onChange={e => editForm.setData('wifi_password', e.target.value)} placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton onClick={closeEditModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={editForm.processing}>
                            Guardar Configuración
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
