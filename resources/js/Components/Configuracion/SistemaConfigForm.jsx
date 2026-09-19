import { useForm } from '@inertiajs/react';
import { Mail, MessageSquare } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function SistemaConfigForm({ configuracionSistema = {} }) {
    const sistemaForm = useForm({
        intervalo_correos: configuracionSistema?.intervalo_correos ?? 1,
        email_default: configuracionSistema?.email_default ?? '',
        envio_email_activo: configuracionSistema?.envio_email_activo ?? true,
        envio_sms_activo: configuracionSistema?.envio_sms_activo ?? true,
        plantilla_email_asunto: configuracionSistema?.plantilla_email_asunto ?? '¡Alerta Crítica! - FreezerGuard',
        plantilla_email_cuerpo: configuracionSistema?.plantilla_email_cuerpo ?? 'Se ha detectado una anomalía crítica ({tipo_alerta} en {dispositivo}). Temperatura: {temperatura} °C. Fecha: {fecha}.',
        plantilla_sms_cuerpo: configuracionSistema?.plantilla_sms_cuerpo ?? 'ALERTA FREEZERGUARD: Se detectó {tipo_alerta} en {dispositivo}. Temp: {temperatura} C. Fecha: {fecha}',
    });

    const submitSistemaForm = (e) => {
        e.preventDefault();
        sistemaForm.put(route('configuracion.sistema.update'), {
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white shadow-lg sm:rounded-xl border border-gray-100 p-6">
            <form onSubmit={submitSistemaForm} className="space-y-6">
                
                {/* CONFIGURACIÓN GENERAL DE NOTIFICACIONES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                    <div>
                        <InputLabel htmlFor="intervalo_correos" value="Frecuencia de envío de correos" className="font-semibold text-gray-800 text-xs" />
                        <p className="text-[11px] text-gray-600 mb-1.5">
                            Minutos para recalcular y enviar notificaciones activas.
                        </p>
                        <div className="flex items-center gap-2 max-w-xs">
                            <TextInput id="intervalo_correos" type="number" min="1" max="1440" className="w-full text-xs" value={sistemaForm.data.intervalo_correos} onChange={e => sistemaForm.setData('intervalo_correos', e.target.value)} required />
                            <span className="text-xs font-semibold text-indigo-900">minutos</span>
                        </div>
                        <InputError message={sistemaForm.errors.intervalo_correos} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email_default" value="Email por Defecto del Sistema" className="font-semibold text-gray-800 text-xs" />
                        <p className="text-[11px] text-gray-600 mb-1.5">
                            Correo al que SIEMPRE se enviará copia además de las muestras.
                        </p>
                        <TextInput 
                            id="email_default" 
                            type="email" 
                            placeholder="admin@ejemplo.com (Opcional)" 
                            className="w-full text-xs" 
                            value={sistemaForm.data.email_default} 
                            onChange={e => sistemaForm.setData('email_default', e.target.value)} 
                        />
                        <InputError message={sistemaForm.errors.email_default} className="mt-1" />
                    </div>
                </div>

                {/* SECCIONES CONTIGUAS: EMAIL VS SMS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* COLUMNA 1: CORREO ELECTRÓNICO */}
                    <div className="space-y-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-indigo-600" /> Canal Correo Electrónico
                            </h4>
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={sistemaForm.data.envio_email_activo}
                                    onChange={e => sistemaForm.setData('envio_email_activo', e.target.checked)}
                                />
                                Activar Emails
                            </label>
                        </div>

                        {/* Asunto Email */}
                        <div>
                            <InputLabel htmlFor="plantilla_email_asunto" value="Asunto del Correo" className="font-semibold text-gray-800 text-xs" />
                            <TextInput id="plantilla_email_asunto" type="text" className="mt-1 block w-full text-xs" value={sistemaForm.data.plantilla_email_asunto} onChange={e => sistemaForm.setData('plantilla_email_asunto', e.target.value)} required />
                            <InputError message={sistemaForm.errors.plantilla_email_asunto} className="mt-1" />
                        </div>

                        {/* Cuerpo Email */}
                        <div>
                            <InputLabel htmlFor="plantilla_email_cuerpo" value="Cuerpo del Correo de Alerta" className="font-semibold text-gray-800 text-xs" />
                            <textarea id="plantilla_email_cuerpo" rows="4" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm font-mono text-xs focus:border-indigo-500 focus:ring-indigo-500" value={sistemaForm.data.plantilla_email_cuerpo} onChange={e => sistemaForm.setData('plantilla_email_cuerpo', e.target.value)} required></textarea>
                            <InputError message={sistemaForm.errors.plantilla_email_cuerpo} className="mt-1" />
                        </div>
                    </div>

                    {/* COLUMNA 2: MENSAJES DE TEXTO (SMS) */}
                    <div className="space-y-4 bg-purple-50/30 p-4 rounded-xl border border-purple-100">
                        <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-purple-600" /> Canal Mensajes de Texto (SMS)
                            </h4>
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-900 bg-white px-2.5 py-1 rounded-md border border-purple-200">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    checked={sistemaForm.data.envio_sms_activo}
                                    onChange={e => sistemaForm.setData('envio_sms_activo', e.target.checked)}
                                />
                                Activar SMS
                            </label>
                        </div>

                        {/* Mensaje SMS Alerta */}
                        <div>
                            <InputLabel htmlFor="plantilla_sms_cuerpo" value="Mensaje SMS de Alerta" className="font-semibold text-gray-800 text-xs" />
                            <textarea id="plantilla_sms_cuerpo" rows="4" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm font-mono text-xs focus:border-purple-500 focus:ring-purple-500" value={sistemaForm.data.plantilla_sms_cuerpo} onChange={e => sistemaForm.setData('plantilla_sms_cuerpo', e.target.value)} required></textarea>
                            <p className="text-[11px] text-purple-700 mt-1">El aviso de resolución por SMS avisará automáticamente con la red/corriente restaurada.</p>
                            <InputError message={sistemaForm.errors.plantilla_sms_cuerpo} className="mt-1" />
                        </div>
                    </div>

                </div>

                {/* VARIABLES DISPONIBLES REUTILIZABLES */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <strong className="block font-semibold mb-1">Variables dinámicas para Email y SMS:</strong>
                    <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{dispositivo}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{freezer}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{tipo_alerta}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{temperatura}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{fecha}`}</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <PrimaryButton disabled={sistemaForm.processing} className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                        Guardar Configuración de Alertas & Mensajes
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
