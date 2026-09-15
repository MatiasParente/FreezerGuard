import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Settings, Cpu, Bell, Thermometer, Wifi } from 'lucide-react';

export default function EditDispositivoModal({ isOpen, onClose, dispositivo = null }) {
    const [showWifiFields, setShowWifiFields] = useState(false);

    const editForm = useForm({
        nombre: '',
        descripcion: '',
        alerta_temperatura_activa: true,
        alerta_bateria_activa: true,
        alerta_vencimiento_activa: true,
        alerta_inactividad_activa: false,
        temp_min_default: -25.0,
        temp_max_default: -10.0,
        intervalo_telemetria: 5,
        wifi_ssid: '',
        wifi_password: '',
    });

    useEffect(() => {
        if (dispositivo) {
            editForm.setData({
                nombre: dispositivo.nombre || '',
                descripcion: dispositivo.descripcion || '',
                alerta_temperatura_activa: dispositivo.alerta_temperatura_activa ?? true,
                alerta_bateria_activa: dispositivo.alerta_bateria_activa ?? true,
                alerta_vencimiento_activa: dispositivo.alerta_vencimiento_activa ?? true,
                alerta_inactividad_activa: dispositivo.alerta_inactividad_activa ?? false,
                temp_min_default: dispositivo.temp_min_default ?? -25.0,
                temp_max_default: dispositivo.temp_max_default ?? -10.0,
                intervalo_telemetria: dispositivo.intervalo_telemetria ?? 5,
                wifi_ssid: dispositivo.wifi_ssid || '',
                wifi_password: dispositivo.wifi_password || '',
            });
            setShowWifiFields(false);
        }
    }, [dispositivo]);

    const submitEditForm = (e) => {
        e.preventDefault();
        if (!dispositivo) return;

        editForm.put(route('configuracion.dispositivo.update', dispositivo.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <form onSubmit={submitEditForm} className="p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        Configuración de Dispositivo: <span className="text-indigo-600">{dispositivo?.nombre}</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Datos Básicos & Telemetría */}
                    <div className="space-y-4 md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-slate-600" /> Datos principales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <InputLabel htmlFor="edit_nombre" value="Nombre del Dispositivo" />
                                <TextInput id="edit_nombre" type="text" className="mt-1 block w-full" value={editForm.data.nombre} onChange={e => editForm.setData('nombre', e.target.value)} required />
                                <InputError message={editForm.errors.nombre} className="mt-2" />
                            </div>
                            <div className="md:col-span-1">
                                <InputLabel htmlFor="edit_descripcion" value="Descripción" />
                                <TextInput id="edit_descripcion" type="text" className="mt-1 block w-full" value={editForm.data.descripcion} onChange={e => editForm.setData('descripcion', e.target.value)} />
                                <InputError message={editForm.errors.descripcion} className="mt-2" />
                            </div>
                            <div className="md:col-span-1">
                                <InputLabel htmlFor="intervalo_telemetria" value="Envío Mediciones (Seg)" />
                                <TextInput id="intervalo_telemetria" type="number" min="1" max="3600" className="mt-1 block w-full" value={editForm.data.intervalo_telemetria} onChange={e => editForm.setData('intervalo_telemetria', e.target.value)} required />
                                <InputError message={editForm.errors.intervalo_telemetria} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Control de Alertas */}
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
                            Alerta por Corte de Energía
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

                    {/* Temperaturas por Defecto */}
                    <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                            <Thermometer className="w-4 h-4 text-blue-600" /> Rangos Termicos por Defecto
                        </h3>
                        <p className="text-xs text-blue-700">
                            Se aplican sólo cuando no hay muestras activas con rango termico definido.
                        </p>
                        <div>
                            <InputLabel htmlFor="temp_min_default" value="Temperatura Mínima (°C)" />
                            <TextInput id="temp_min_default" type="number" step="0.1" className="mt-1 block w-full" value={editForm.data.temp_min_default} onChange={e => editForm.setData('temp_min_default', e.target.value)} required />
                        </div>
                        <div>
                            <InputLabel htmlFor="temp_max_default" value="Temperatura Máxima (°C)" />
                            <TextInput id="temp_max_default" type="number" step="0.1" className="mt-1 block w-full" value={editForm.data.temp_max_default} onChange={e => editForm.setData('temp_max_default', e.target.value)} required />
                        </div>
                    </div>

                    {/* Wi-Fi Remoto */}
                    <div className="md:col-span-2 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
                                <Wifi className="w-4 h-4 text-emerald-600" /> Credenciales Wi-Fi Remotas
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowWifiFields(!showWifiFields)}
                                className="text-xs font-medium px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-700 transition-colors"
                            >
                                {showWifiFields ? 'Ocultar Credenciales Wi-Fi' : 'Cambiar Credenciales Wi-Fi'}
                            </button>
                        </div>

                        {showWifiFields && (
                            <div className="mt-4 space-y-3 pt-3 border-t border-emerald-200">
                                <p className="text-xs text-emerald-700">
                                    Al guardar, estas credenciales se enviarán automáticamente cifradas vía HTTPS hacia el ESP32. Si la conexión falla tras 5 intentos, el ESP32 restaurará la red anterior y reportará error.
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
                        )}
                    </div>

                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={editForm.processing} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                        Guardar Configuración
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
