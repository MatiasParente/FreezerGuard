import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FlaskConical, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Pagination from '@/Components/Pagination';

export default function Dashboard({ muestras, promedios, ultimasMediciones, alertas }) {
    const [mostrarMuestras, setMostrarMuestras] = useState(true);
    const [mostrarPromedios, setMostrarPromedios] = useState(false);
    const [mostrarEnVivo, setMostrarEnVivo] = useState(false);
    const [mostrarAlertas, setMostrarAlertas] = useState(false);

    const handleTogglePromedios = () => {
        setMostrarPromedios(!mostrarPromedios);
    };

    const handleToggleEnVivo = () => {
        setMostrarEnVivo(!mostrarEnVivo);
    };
    
    const [filtroEstado, setFiltroEstado] = useState({
        'Vencida': true,
        'Por vencer': true,
        'Ok': true,
        'Sin Vencimiento': true,
    });
    const toggleFiltroEstado = (estado) => {
        setFiltroEstado(prev => ({ ...prev, [estado]: !prev[estado] }));
    };
    
    const colorEstado = (estado) => {
        switch (estado) {
            case 'Vencida': return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' };
            case 'Por vencer': return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' };
            case 'Ok': return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
        }
    };

    const muestrasFiltradas = muestras.filter(m => filtroEstado[m.estado_vencimiento]);

    useEffect(() => {
        if (!mostrarEnVivo) return;
        const interval = setInterval(() => {
            router.reload({ only: ['ultimasMediciones'], preserveState: true, preserveScroll: true });
        }, 5000); // 5 segundos se actualiza el medidor en vivo
        return () => clearInterval(interval);
    }, [mostrarEnVivo]);

    const getDeviceKeys = (dataArray) => {
        if (!dataArray || dataArray.length === 0) return [];
        const keys = new Set();
        dataArray.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'date' && key !== 'id' && key !== 'fecha_y_hora' && key !== 'dispositivo') keys.add(key);
            });
        });
        return Array.from(keys);
    };
    
    const promediosKeys = getDeviceKeys(promedios);
    
    const chartUltimas = ultimasMediciones.map(m => {
        const d = new Date(m.fecha_y_hora);
        const time = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const date = d.toLocaleDateString([], {day: '2-digit', month: '2-digit'});
        return {
            fecha_y_hora_raw: m.fecha_y_hora,
            fecha_y_hora_display: `${time}\n${date}`,
            [m.dispositivo?.nombre || 'Desconocido']: m.temperatura
        };
    });
    const ultimasKeys = Array.from(new Set(ultimasMediciones.map(m => m.dispositivo?.nombre || 'Desconocido')));
    
    // Custom multiline tick for live chart
    const CustomXAxisTick = ({ x, y, payload }) => {
        if (!payload.value) return null;
        const [time, date] = payload.value.split('\n');
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="middle" fill="#6b7280" fontSize={11}>
                    <tspan x="0" dy="0">{time}</tspan>
                    {date && <tspan x="0" dy="14">{date}</tspan>}
                </text>
            </g>
        );
    };
    
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Resumen</h2>}>
            <Head title="Resumen" />
            <div>
                <div className="mx-auto max-w-7xl space-y-6">
                    
                    {/* Acordeón Muestras */}
                    <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-50/80 hover:bg-gray-100/80 transition-colors" onClick={() => setMostrarMuestras(!mostrarMuestras)}>
                            <h3 className="text-lg font-medium text-gray-900">Muestras por Vencer</h3>
                            {mostrarMuestras ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                        {mostrarMuestras && (
                            <div className="p-6 border-t border-gray-100">
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <button onClick={() => toggleFiltroEstado('Vencida')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!filtroEstado['Vencida'] ? 'opacity-40 grayscale' : 'ring-2 ring-red-200'} bg-red-100 text-red-800`}>Vencidas</button>
                                    <button onClick={() => toggleFiltroEstado('Por vencer')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!filtroEstado['Por vencer'] ? 'opacity-40 grayscale' : 'ring-2 ring-yellow-200'} bg-yellow-100 text-yellow-800`}>Por vencer {'(<3 días)'}</button>
                                    <button onClick={() => toggleFiltroEstado('Ok')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!filtroEstado['Ok'] ? 'opacity-40 grayscale' : 'ring-2 ring-green-200'} bg-green-100 text-green-800`}>Vigentes (+3 días)</button>
                                </div>
                                
                                {muestrasFiltradas.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {muestrasFiltradas.map((m) => {
                                            const color = colorEstado(m.estado_vencimiento);
                                            return (
                                                <div key={m.id} className={`p-4 rounded-xl border ${color.border} ${color.bg} shadow-sm transition-all hover:shadow-md`}>
                                                    <div className="flex items-start gap-3">
                                                        <FlaskConical className={`w-5 h-5 mt-1 ${color.text}`} />
                                                        <div>
                                                            <h4 className={`font-semibold ${color.text}`}>{m.titulo}</h4>
                                                            <p className={`text-sm mt-1 ${color.text} opacity-80`}>Vence: {m.vencimiento ? new Date(m.vencimiento).toLocaleDateString() : 'N/A'}</p>
                                                            <p className={`text-xs mt-1 ${color.text} opacity-70`}>Temp: {m.temperatura_minima}°C a {m.temperatura_maxima}°C</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No hay muestras para mostrar con los filtros activos.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                    <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 flex-1">
                        <div className="px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-50/80 hover:bg-gray-100/80 transition-colors" onClick={handleTogglePromedios}>
                            <h3 className="text-lg font-medium text-gray-900">Temperatura promedio (Últimos 7 días)</h3>
                            {mostrarPromedios ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                        {mostrarPromedios && (
                            <div className="p-6 border-t border-gray-100 h-96 w-full">
                                {promedios.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={promedios} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="date" tick={{fill: '#6b7280', fontSize: 12}} axisLine={{stroke: '#e5e7eb'}} tickLine={false} />
                                            <YAxis unit="°C" tick={{fill: '#6b7280', fontSize: 12}} axisLine={{stroke: '#e5e7eb'}} tickLine={false} />
                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                            {promediosKeys.map((key, index) => (
                                                <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-gray-500 mt-20">No hay datos suficientes para graficar.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 flex-1">
                        <div className="px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-50/80 hover:bg-gray-100/80 transition-colors" onClick={handleToggleEnVivo}>
                            <h3 className="text-lg font-medium text-gray-900">Temperatura en vivo</h3>
                            {mostrarEnVivo ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                        {mostrarEnVivo && (
                            <div className="p-6 border-t border-gray-100 h-96 w-full">
                                {chartUltimas.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartUltimas} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="fecha_y_hora_display" tick={<CustomXAxisTick />} axisLine={{stroke: '#e5e7eb'}} tickLine={false} />
                                            <YAxis unit="°C" tick={{fill: '#6b7280', fontSize: 12}} axisLine={{stroke: '#e5e7eb'}} tickLine={false} domain={['auto', 'auto']} />
                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                            {ultimasKeys.map((key, index) => (
                                                <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} isAnimationActive={false} />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-gray-500 mt-20">No hay mediciones recientes.</p>
                                )}
                            </div>
                        )}
                    </div>
</div>
                    <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-50/80 hover:bg-gray-100/80 transition-colors" onClick={() => setMostrarAlertas(!mostrarAlertas)}>
                            <h3 className="text-lg font-medium text-gray-900">Alertas recientes</h3>
                            {mostrarAlertas ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                        {mostrarAlertas && (
                            <div className="p-6 border-t border-gray-100">
                                {alertas.data.length > 0 ? (
                                    <div className="space-y-4">
                                        {alertas.data.map(alerta => (
                                            <div key={alerta.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-full ${alerta.estado === 2 ? 'bg-green-50' : 'bg-red-50'}`}>
                                                        {alerta.estado === 2 ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{alerta.alerta?.tipo || 'Alerta'}</p>
                                                        <p className="text-sm text-gray-500">{alerta.dispositivo?.nombre} • {new Date(alerta.fecha_y_hora).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${alerta.estado === 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {alerta.estado === 2 ? 'Resuelta' : 'Pendiente'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No hay alertas recientes.</p>
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
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
