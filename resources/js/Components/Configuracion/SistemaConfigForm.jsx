import { useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function SistemaConfigForm({ configuracionSistema = {} }) {
    const sistemaForm = useForm({
        intervalo_correos: configuracionSistema?.intervalo_correos ?? 1,
        plantilla_email_asunto: configuracionSistema?.plantilla_email_asunto ?? '[FreezerGuard Alerta] Anomalía detectada',
        plantilla_email_cuerpo: configuracionSistema?.plantilla_email_cuerpo ?? 'Atención: Se ha detectado una alerta del tipo {tipo_alerta} en el dispositivo {dispositivo}. Temperatura registrada: {temperatura} °C. Fecha y Hora: {fecha}. Por favor revisar con urgencia.',
    });

    const submitSistemaForm = (e) => {
        e.preventDefault();
        sistemaForm.put(route('configuracion.sistema.update'), {
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white shadow-lg sm:rounded-xl border border-gray-100 p-6">
            <div className="max-w-3xl">
                <form onSubmit={submitSistemaForm} className="space-y-6">
                    
                    {/* Intervalo de Correos */}
                    <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                        <InputLabel htmlFor="intervalo_correos" value="Frecuencia de envío de correos de alerta" className="font-semibold text-gray-800" />
                        <p className="text-xs text-gray-600 mb-2">
                            Indica cada cuántos minutos se recalcularán y enviarán los correos electrónicos ante anomalías activas.
                        </p>
                        <div className="flex items-center gap-3 max-w-xs">
                            <TextInput id="intervalo_correos" type="number" min="1" max="1440" className="w-full" value={sistemaForm.data.intervalo_correos} onChange={e => sistemaForm.setData('intervalo_correos', e.target.value)} required />
                            <span className="text-sm font-semibold text-indigo-900">minutos</span>
                        </div>
                        <InputError message={sistemaForm.errors.intervalo_correos} className="mt-1" />
                    </div>

                    {/* Plantilla Asunto */}
                    <div>
                        <InputLabel htmlFor="plantilla_email_asunto" value="Asunto del Correo de Alerta" className="font-semibold text-gray-800" />
                        <TextInput id="plantilla_email_asunto" type="text" className="mt-1 block w-full" value={sistemaForm.data.plantilla_email_asunto} onChange={e => sistemaForm.setData('plantilla_email_asunto', e.target.value)} required />
                        <InputError message={sistemaForm.errors.plantilla_email_asunto} className="mt-1" />
                    </div>

                    {/* Plantilla Cuerpo */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <InputLabel htmlFor="plantilla_email_cuerpo" value="Cuerpo del Mensaje de Alerta" className="font-semibold text-gray-800" />
                        </div>
                        <textarea id="plantilla_email_cuerpo" rows="6" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500" value={sistemaForm.data.plantilla_email_cuerpo} onChange={e => sistemaForm.setData('plantilla_email_cuerpo', e.target.value)} required></textarea>
                        <InputError message={sistemaForm.errors.plantilla_email_cuerpo} className="mt-1" />
                        
                        <div className="mt-3 p-3 rounded-lg text-xs text-amber-900">
                            <strong className="block font-semibold mb-1">Variables disponibles:</strong>
                            <div className="flex flex-wrap gap-2 font-mono">
                                <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-900 border border-amber-300">{`{dispositivo}`}</span>
                                <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-900 border border-amber-300">{`{tipo_alerta}`}</span>
                                <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-900 border border-amber-300">{`{temperatura}`}</span>
                                <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-900 border border-amber-300">{`{fecha}`}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                        <PrimaryButton disabled={sistemaForm.processing} className="px-6 bg-indigo-500 hover:bg-indigo-600 text-white">
                            Guardar Configuración de Email
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
