import { useForm, router } from '@inertiajs/react';
import { Mail, MessageSquare, Send } from 'lucide-react';
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
        plantilla_email_asunto:
            configuracionSistema?.plantilla_email_asunto ??
            '¡Alerta Crítica! - FreezerGuard',
        plantilla_email_cuerpo:
            configuracionSistema?.plantilla_email_cuerpo ??
            'Se ha detectado una anomalía crítica ({tipo_alerta} en {dispositivo}). Temperatura: {temperatura} °C. Fecha: {fecha}.',
        plantilla_sms_cuerpo:
            configuracionSistema?.plantilla_sms_cuerpo ??
            'ALERTA FREEZERGUARD: Se detectó {tipo_alerta} en {dispositivo}. Temp: {temperatura} C. Fecha: {fecha}',
    });

    const submitSistemaForm = (e) => {
        e.preventDefault();
        sistemaForm.put(route('configuracion.sistema.update'), {
            preserveScroll: true,
        });
    };

    const handleProbarSMS = () => {
        router.post(
            route('configuracion.probar-sms'),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="bg-white sm:rounded-xl p-6">
            <form onSubmit={submitSistemaForm} className="space-y-6">
                {/* configuracion de notificaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                    <div>
                        <InputLabel
                            htmlFor="intervalo_correos"
                            value="Frecuencia de envío de correos"
                            className="font-semibold text-gray-800 text-xs"
                        />
                        <p className="text-xs text-gray-600 mb-1.5">
                            Minutos para recalcular y enviar notificaciones
                            activas.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 max-w-xs">
                            <TextInput
                                id="intervalo_correos"
                                type="number"
                                min="1"
                                max="1440"
                                className="w-full text-xs"
                                value={sistemaForm.data.intervalo_correos}
                                onChange={(e) =>
                                    sistemaForm.setData(
                                        'intervalo_correos',
                                        e.target.value,
                                    )
                                }
                                required
                                aria-invalid={
                                    !!sistemaForm.errors.intervalo_correos
                                }
                                aria-describedby={
                                    sistemaForm.errors.intervalo_correos
                                        ? 'intervalo_correos-error'
                                        : undefined
                                }
                            />
                            <span className="text-xs font-semibold text-indigo-900">
                                minutos
                            </span>
                        </div>
                        <InputError
                            id="intervalo_correos-error"
                            message={sistemaForm.errors.intervalo_correos}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="email_default"
                            value="Email por defecto del sistema"
                            className="font-semibold text-gray-800 text-xs"
                        />
                        <p className="text-xs text-gray-600 mb-1.5">
                            Correo al que <strong>SIEMPRE</strong> se enviará
                            copia.
                        </p>
                        <TextInput
                            id="email_default"
                            type="email"
                            placeholder="admin@ejemplo.com (Opcional)"
                            className="w-full text-xs"
                            value={sistemaForm.data.email_default}
                            onChange={(e) =>
                                sistemaForm.setData(
                                    'email_default',
                                    e.target.value,
                                )
                            }
                            aria-invalid={!!sistemaForm.errors.email_default}
                            aria-describedby={
                                sistemaForm.errors.email_default
                                    ? 'email_default-error'
                                    : undefined
                            }
                        />
                        <InputError
                            id="email_default-error"
                            message={sistemaForm.errors.email_default}
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* Canales de notificación de alertas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Canal correo electrónico */}
                    <div className="space-y-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-blue-100 pb-2">
                            <h4 className="font-bold text-slate-800 text-sm flex flex-wrap items-center gap-2">
                                <Mail className="w-4 h-4 text-indigo-600" />{' '}
                                Canal correo electrónico
                            </h4>
                            <label className="flex flex-wrap items-center gap-2 cursor-pointer text-xs font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={
                                        sistemaForm.data.envio_email_activo
                                    }
                                    onChange={(e) =>
                                        sistemaForm.setData(
                                            'envio_email_activo',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Activar correos
                            </label>
                        </div>

                        {/* Asunto Email */}
                        <div>
                            <InputLabel
                                htmlFor="plantilla_email_asunto"
                                value="Asunto del correo"
                                className="font-semibold text-gray-800 text-xs"
                            />
                            <TextInput
                                id="plantilla_email_asunto"
                                type="text"
                                className="mt-1 block w-full text-xs"
                                value={sistemaForm.data.plantilla_email_asunto}
                                onChange={(e) =>
                                    sistemaForm.setData(
                                        'plantilla_email_asunto',
                                        e.target.value,
                                    )
                                }
                                required
                                aria-invalid={
                                    !!sistemaForm.errors.plantilla_email_asunto
                                }
                                aria-describedby={
                                    sistemaForm.errors.plantilla_email_asunto
                                        ? 'plantilla_email_asunto-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="plantilla_email_asunto-error"
                                message={
                                    sistemaForm.errors.plantilla_email_asunto
                                }
                                className="mt-1"
                            />
                        </div>

                        {/* Cuerpo Email */}
                        <div>
                            <InputLabel
                                htmlFor="plantilla_email_cuerpo"
                                value="Cuerpo del Correo de Alerta"
                                className="font-semibold text-gray-800 text-xs"
                            />
                            <textarea
                                id="plantilla_email_cuerpo"
                                aria-invalid={
                                    !!sistemaForm.errors.plantilla_email_cuerpo
                                }
                                aria-describedby={
                                    sistemaForm.errors.plantilla_email_cuerpo
                                        ? 'plantilla_email_cuerpo-error'
                                        : undefined
                                }
                                rows="4"
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm font-mono text-xs focus:border-indigo-500 focus:ring-indigo-500"
                                value={sistemaForm.data.plantilla_email_cuerpo}
                                onChange={(e) =>
                                    sistemaForm.setData(
                                        'plantilla_email_cuerpo',
                                        e.target.value,
                                    )
                                }
                                required
                            ></textarea>
                            <InputError
                                id="plantilla_email_cuerpo-error"
                                message={
                                    sistemaForm.errors.plantilla_email_cuerpo
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Canal mensajes de texto (SMS) */}
                    <div className="space-y-4 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-2">
                            <h4 className="font-bold text-slate-800 text-sm flex flex-wrap items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-indigo-600" />{' '}
                                Canal mensajes de texto (SMS)
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleProbarSMS}
                                    aria-label="Enviar SMS de prueba al número asignado al dispositivo"
                                    title="Enviar SMS de prueba al número asignado al dispositivo"
                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-md border border-indigo-300 transition"
                                >
                                    <Send className="w-3.5 h-3.5 text-indigo-700" />
                                    Probar SMS
                                </button>
                                <label className="flex flex-wrap items-center gap-2 cursor-pointer text-xs font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={
                                            sistemaForm.data.envio_sms_activo
                                        }
                                        onChange={(e) =>
                                            sistemaForm.setData(
                                                'envio_sms_activo',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    Activar SMS
                                </label>
                            </div>
                        </div>

                        {/* Mensaje SMS Alerta */}
                        <div>
                            <InputLabel
                                htmlFor="plantilla_sms_cuerpo"
                                value="Mensaje SMS de Alerta (Personalizado)"
                                className="font-semibold text-gray-800 text-xs"
                            />
                            <textarea
                                id="plantilla_sms_cuerpo"
                                aria-invalid={
                                    !!sistemaForm.errors.plantilla_sms_cuerpo
                                }
                                aria-describedby={
                                    sistemaForm.errors.plantilla_sms_cuerpo
                                        ? 'plantilla_sms_cuerpo-error'
                                        : undefined
                                }
                                rows="4"
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm font-mono text-xs focus:border-indigo-500 focus:ring-indigo-500"
                                value={sistemaForm.data.plantilla_sms_cuerpo}
                                onChange={(e) =>
                                    sistemaForm.setData(
                                        'plantilla_sms_cuerpo',
                                        e.target.value,
                                    )
                                }
                                required
                            ></textarea>
                            <p className="text-xs text-indigo-700 mt-1">
                                Los mensajes de aviso por resolución
                                (restauración) están predefinidos por defecto
                                para garantizar su envío seguro.
                            </p>
                            <InputError
                                id="plantilla_sms_cuerpo-error"
                                message={
                                    sistemaForm.errors.plantilla_sms_cuerpo
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* variables disponibles */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <strong className="block font-semibold mb-1">
                        Variables dinámicas para Email y SMS:
                    </strong>
                    <div className="flex flex-wrap gap-2 font-mono text-xs">
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{dispositivo}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{freezer}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{tipo_alerta}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{temperatura}`}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-slate-800 border border-slate-300">{`{fecha}`}</span>
                    </div>
                </div>

                <div className="pt-3 flex justify-end">
                    <PrimaryButton
                        disabled={sistemaForm.processing}
                        className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                        Guardar configuración de alertas y mensajes
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
