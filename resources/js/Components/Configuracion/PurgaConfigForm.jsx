import { useForm } from '@inertiajs/react';
import { Database, Clock, Calendar, Shield, AlertTriangle } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function PurgaConfigForm({ configuracionSistema = {} }) {
    const purgaForm = useForm({
        purga_automatica_activa: configuracionSistema?.purga_automatica_activa ?? true,
        purga_dias_antiguedad: configuracionSistema?.purga_dias_antiguedad ?? 30,
        purga_hora: configuracionSistema?.purga_hora ?? '03:00',
    });

    const submitPurgaForm = (e) => {
        e.preventDefault();
        purgaForm.put(route('configuracion.purga.update'), {
            preserveScroll: true,
        });
    };

    const diasValor = parseInt(purgaForm.data.purga_dias_antiguedad) || 30;
    const fechaEjemplo = new Date();
    fechaEjemplo.setDate(fechaEjemplo.getDate() - diasValor);
    const fechaEjemploStr = fechaEjemplo.toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-white sm:rounded-xl p-6">
            <form onSubmit={submitPurgaForm} className="space-y-6">

                <div className="flex justify-between items-center bg-indigo-50/40 p-4 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-3">
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Limpieza automática de datos antiguos</h4>
                            <p className="text-[11px] text-gray-600 mt-0.5">
                                Elimina automáticamente mediciones, historial de muestras eliminadas y alertas resueltas que superen la antigüedad configurada.
                            </p>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-900 bg-white px-3 py-1.5 rounded-md border border-indigo-300 shrink-0">
                        <input
                            type="checkbox"
                            className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                            checked={purgaForm.data.purga_automatica_activa}
                            onChange={e => purgaForm.setData('purga_automatica_activa', e.target.checked)}
                        />
                        {purgaForm.data.purga_automatica_activa ? 'Activada' : 'Desactivada'}
                    </label>
                </div>

                <div className={`transition-opacity duration-200 space-y-5 ${!purgaForm.data.purga_automatica_activa ? 'opacity-40 pointer-events-none' : ''}`}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                <InputLabel htmlFor="purga_dias_antiguedad" value="Antigüedad máxima de datos" className="font-semibold text-gray-800 text-xs !mb-0" />
                            </div>
                            <p className="text-[11px] text-gray-600 mb-2">
                                Los datos más antiguos que este período se eliminarán. Mínimo 7 días, máximo 365 días.
                            </p>
                            <div className="flex items-center gap-2 max-w-xs">
                                <TextInput 
                                    id="purga_dias_antiguedad" 
                                    type="number" 
                                    min="7" 
                                    max="365" 
                                    className="w-full text-xs" 
                                    value={purgaForm.data.purga_dias_antiguedad} 
                                    onChange={e => purgaForm.setData('purga_dias_antiguedad', e.target.value)} 
                                    required 
                                />
                                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">días</span>
                            </div>
                            <InputError message={purgaForm.errors.purga_dias_antiguedad} className="mt-1" />
                            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                                <span className="font-medium">Ejemplo:</span> Hoy se eliminarían datos anteriores al <strong>{fechaEjemploStr}</strong>
                            </p>
                        </div>

                        {/* hora */}
                        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <InputLabel htmlFor="purga_hora" value="Hora de ejecución" className="font-semibold text-gray-800 text-xs !mb-0" />
                            </div>
                            <p className="text-[11px] text-gray-600 mb-2">
                                Hora del día en la que se realizará la limpieza. Se recomienda una hora de baja actividad.
                            </p>
                            <div className="flex items-center gap-2 max-w-xs">
                                <TextInput 
                                    id="purga_hora" 
                                    type="time" 
                                    className="w-full text-xs" 
                                    value={purgaForm.data.purga_hora} 
                                    onChange={e => purgaForm.setData('purga_hora', e.target.value)} 
                                    required 
                                />
                            </div>
                            <InputError message={purgaForm.errors.purga_hora} className="mt-1" />
                        </div>
                    </div>

                    {/* qué se elimina */}
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 mb-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="font-bold text-slate-800 text-xs">¿Qué datos se eliminan?</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg border border-amber-100 p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-bold text-slate-800 text-[11px]">Mediciones</span>
                                </div>
                                <p className="text-[10px] text-gray-800 leading-relaxed">
                                    Registros de temperatura, batería y estado del módem anteriores a {diasValor} días.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg border border-amber-100 p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-bold text-slate-800 text-[11px]">Historial de muestras</span>
                                </div>
                                <p className="text-[10px] text-gray-800 leading-relaxed">
                                    Logs de muestras que ya fueron eliminadas y cuyo historial supera los {diasValor} días.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg border border-amber-100 p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-bold text-slate-800 text-[11px]">Alertas resueltas</span>
                                </div>
                                <p className="text-[10px] text-gray-800 leading-relaxed">
                                    Alertas que ya fueron resueltas y tienen más de {diasValor} días desde su generación.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Nota de seguridad */}
                    <div className="flex items-start gap-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-200">
                        <Shield className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                            <strong>Nota de seguridad:</strong> Las alertas que aún estén <strong>pendientes</strong> (sin resolver) nunca se eliminan, independientemente de su antigüedad. 
                            Solo se eliminan las alertas ya resueltas. Los datos de muestras <strong>activas</strong> tampoco se eliminan.
                        </p>
                    </div>
                </div>

                <div className="pt-3 flex justify-end">
                    <PrimaryButton disabled={purgaForm.processing} className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                        Guardar configuración de base de datos
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
