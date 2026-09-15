import { useState } from 'react';
import { Thermometer, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RealtimeChart({ ultimasMediciones = [] }) {
    const [mostrarEnVivo, setMostrarEnVivo] = useState(true);
    const [rangoMediciones, setRangoMediciones] = useState(5); // Default: 5 (5 | 30 | 100)

    // Process dataset based on selected range: 5, 30 or 100
    const datasetSlice = ultimasMediciones.slice(-rangoMediciones);
    const chartData = datasetSlice.map(m => {
        const d = new Date(m.fecha_y_hora);
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
        return {
            id: m.id,
            temperatura: Number(m.temperatura),
            bateria: m.bateria,
            tiene_alerta: m.tiene_alerta,
            dispositivo: m.dispositivo?.nombre || 'ESP32',
            fecha_y_hora_display: `${time}\n${date}`,
            raw_time: m.fecha_y_hora,
        };
    });

    // Custom X-Axis multiline tick
    const CustomXAxisTick = ({ x, y, payload }) => {
        if (!payload.value) return null;
        const [time, date] = payload.value.split('\n');
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={14} textAnchor="middle" fill="#6b7280" fontSize={10} fontWeight={600}>
                    <tspan x="0" dy="0">{time}</tspan>
                    {date && <tspan x="0" dy="12">{date}</tspan>}
                </text>
            </g>
        );
    };

    // Custom Dot rendering: RED dot if measurement generated or had an alert!
    const CustomDot = (props) => {
        const { cx, cy, payload } = props;
        if (!cx || !cy) return null;
        const isAlert = payload?.tiene_alerta;

        return (
            <circle
                cx={cx}
                cy={cy}
                r={isAlert ? 6 : 4}
                fill={isAlert ? '#ef4444' : '#4f46e5'}
                stroke={isAlert ? '#991b1b' : '#312e81'}
                strokeWidth={2}
            />
        );
    };

    return (
        <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/80 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMostrarEnVivo(!mostrarEnVivo)}>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-indigo-600" /> Monitoreo de Temperatura en Tiempo Real
                    </h3>
                </div>

                {/* Controles de Selección de Rango: 5 vs 30 vs 100 */}
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-200/70 p-1 rounded-lg border border-slate-300/40 text-xs font-semibold">
                        <button
                            onClick={() => setRangoMediciones(5)}
                            className={`px-3 py-1 rounded-md transition-all ${
                                rangoMediciones === 5 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Últimos 5
                        </button>
                        <button
                            onClick={() => setRangoMediciones(30)}
                            className={`px-3 py-1 rounded-md transition-all ${
                                rangoMediciones === 30 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Últimos 30
                        </button>
                        <button
                            onClick={() => setRangoMediciones(100)}
                            className={`px-3 py-1 rounded-md transition-all ${
                                rangoMediciones === 100 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Últimos 100
                        </button>
                    </div>

                    <button onClick={() => setMostrarEnVivo(!mostrarEnVivo)} className="text-slate-400 hover:text-slate-600">
                        {mostrarEnVivo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {mostrarEnVivo && (
                <div className="p-6 h-[400px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="fecha_y_hora_display" 
                                    tick={<CustomXAxisTick />} 
                                    axisLine={{ stroke: '#cbd5e1' }} 
                                    tickLine={false} 
                                />
                                <YAxis 
                                    unit="°C" 
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                                    axisLine={{ stroke: '#cbd5e1' }} 
                                    tickLine={false} 
                                    domain={['auto', 'auto']} 
                                />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                                                    <p className="font-bold border-b border-slate-700 pb-1">{data.dispositivo}</p>
                                                    <p className="text-indigo-300 font-mono text-sm">Temp: {data.temperatura} °C</p>
                                                    <p className="text-slate-400">Hora: {new Date(data.raw_time).toLocaleString()}</p>
                                                    {data.tiene_alerta && (
                                                        <p className="text-red-400 font-semibold flex items-center gap-1 pt-1">
                                                            ⚠️ Alerta activa en esta lectura
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="temperatura" 
                                    name="Temperatura"
                                    stroke="#4f46e5" 
                                    strokeWidth={3} 
                                    dot={<CustomDot />} 
                                    activeDot={{ r: 8, strokeWidth: 2, stroke: '#312e81', fill: '#818cf8' }} 
                                    isAnimationActive={false} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                            <Thermometer className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                            <p className="text-sm font-medium">No hay datos de telemetría recientes registrados.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
