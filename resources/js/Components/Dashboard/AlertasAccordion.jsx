import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function AlertasAccordion({ alertas = { data: [], links: [], current_page: 1, last_page: 1 }, alertasSinResolverCount = 0 }) {
    const [mostrarAlertas, setMostrarAlertas] = useState(true);

    return (
        <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer bg-slate-50/80 hover:bg-slate-100/80 transition-colors" onClick={() => setMostrarAlertas(!mostrarAlertas)}>
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-slate-900">Alertas Recientes</h3>
                    {alertasSinResolverCount > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                            {alertasSinResolverCount} sin resolver
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Todas resueltas
                        </span>
                    )}
                </div>
                {mostrarAlertas ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </div>
            {mostrarAlertas && (
                <div className="p-6 border-t border-slate-100">
                    {alertas.data.length > 0 ? (
                        <div className="space-y-4">
                            {alertas.data.map(alerta => (
                                <div key={alerta.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${alerta.estado === 2 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            {alerta.estado === 2 ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{alerta.alerta?.tipo || 'Alerta'}</p>
                                            <p className="text-sm text-slate-500">{alerta.dispositivo?.nombre} • {new Date(alerta.fecha_y_hora).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${alerta.estado === 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {alerta.estado === 2 ? 'Resuelta' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-4">No hay alertas recientes.</p>
                    )}
                    
                    {alertas.data.length > 0 && (
                        <div className="mt-4">
                            <Pagination 
                                links={alertas.links} 
                                currentPage={alertas.current_page} 
                                lastPage={alertas.last_page} 
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
