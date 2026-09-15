import { useState } from 'react';
import { Thermometer, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEVICE_STYLES = [
    { color: '#3b82f6', dash: '6 4' },     // Azul punteado largo
    { color: '#ef4444', dash: '3 3' },     // Rojo punteado corto
    { color: '#10b981', dash: '8 4' },     // Verde esmeralda
    { color: '#8b5cf6', dash: '4 4 2 4' }, // Púrpura trazo guion-punto
    { color: '#f59e0b', dash: '10 5' },    // Ámbar guion largo
    { color: '#ec4899', dash: '2 2' },     // Rosa fino
];

export default function RealtimeChart({ ultimasMediciones = [] }) {
    const [mostrarEnVivo, setMostrarEnVivo] = useState(true);
    const [rangoMediciones, setRangoMediciones] = useState(5);
    const [dispositivosVisibles, setDispositivosVisibles] = useState({});

    // Extraer lista de dispositivos únicos presentes en las mediciones
    const dispositivosUnicosMap = new Map();
    ultimasMediciones.forEach(m => {
        const devId = m.dispositivo?.id || m.dispositivo_id || 1;
        const devNombre = m.dispositivo?.nombre || `Dispositivo ${devId}`;
        if (!dispositivosUnicosMap.has(devNombre)) {
            dispositivosUnicosMap.set(devNombre, { id: devId, nombre: devNombre });
        }
    });
    const dispositivosUnicos = Array.from(dispositivosUnicosMap.values());

    // Agrupar/Pivotear mediciones por punto en el tiempo
    const timeMap = new Map();
    const slice = ultimasMediciones.slice(-rangoMediciones * 10);

    slice.forEach(m => {
        const timeKey = m.fecha_y_hora;
        const devNombre = m.dispositivo?.nombre || `Dispositivo ${m.dispositivo_id || 1}`;

        if (!timeMap.has(timeKey)) {
            const d = new Date(m.fecha_y_hora);
            const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const date = d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });

            timeMap.set(timeKey, {
                raw_time: m.fecha_y_hora,
                fecha_y_hora_display: `${time}\n${date}`,
            });
        }

        const row = timeMap.get(timeKey);
        row[devNombre] = Number(m.temperatura);
        row[`${devNombre}_alerta`] = m.tiene_alerta;
    });

    const chartData = Array.from(timeMap.values()).slice(-rangoMediciones);

    const toggleDispositivo = (nombre) => {
        setDispositivosVisibles(prev => ({
            ...prev,
            [nombre]: prev[nombre] === false ? true : false
        }));
    };

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

    return (
        <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-100">
            {/* Header del Acordeón y Filtros */}
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/80 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMostrarEnVivo(!mostrarEnVivo)}>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-indigo-600" /> Monitoreo de Temperatura en Tiempo Real
                    </h3>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Botones de Rango (5, 30, 100) */}
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
                <div className="p-6 space-y-4">
                    {/* Selector interactivo de dispositivos (Mostrar / Ocultar líneas) */}
                    {dispositivosUnicos.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-700 mr-1">Visibilidad por Dispositivo:</span>
                            {dispositivosUnicos.map((dev, idx) => {
                                const style = DEVICE_STYLES[idx % DEVICE_STYLES.length];
                                const isVisible = dispositivosVisibles[dev.nombre] !== false;
                                return (
                                    <button
                                        key={dev.id}
                                        type="button"
                                        onClick={() => toggleDispositivo(dev.nombre)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-xs ${
                                            isVisible
                                                ? 'bg-white text-slate-900 border-slate-300 shadow-sm hover:border-slate-400'
                                                : 'bg-slate-200/60 text-slate-400 border-slate-200 line-through'
                                        }`}
                                    >
                                        {isVisible ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                                        <span className="w-4 h-0.5 rounded-full inline-block" style={{ backgroundColor: isVisible ? style.color : '#cbd5e1' }}></span>
                                        <span>{dev.nombre}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Gráfica de Temperatura */}
                    <div className="h-[380px] w-full">
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
                                                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-2 border border-slate-700 min-w-[170px]">
                                                        <p className="text-slate-400 font-mono border-b border-slate-700 pb-1">
                                                            {new Date(data.raw_time).toLocaleString()}
                                                        </p>
                                                        {payload.map((item) => (
                                                            <div key={item.name} className="flex justify-between items-center gap-4">
                                                                <span className="font-semibold flex items-center gap-1.5" style={{ color: item.color }}>
                                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                                    {item.name}:
                                                                </span>
                                                                <span className="font-mono font-bold text-white">
                                                                    {item.value} °C
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />

                                    {/* Renderizado de una línea punteada y color único por dispositivo */}
                                    {dispositivosUnicos.map((dev, idx) => {
                                        const isVisible = dispositivosVisibles[dev.nombre] !== false;
                                        if (!isVisible) return null;

                                        const style = DEVICE_STYLES[idx % DEVICE_STYLES.length];

                                        return (
                                            <Line
                                                key={dev.id}
                                                type="monotone"
                                                dataKey={dev.nombre}
                                                name={dev.nombre}
                                                stroke={style.color}
                                                strokeDasharray={style.dash}
                                                strokeWidth={3}
                                                connectNulls={true}
                                                isAnimationActive={false}
                                                dot={(dotProps) => {
                                                    const { cx, cy, payload } = dotProps;
                                                    if (!cx || !cy || payload[dev.nombre] === undefined) return null;
                                                    const isAlert = payload[`${dev.nombre}_alerta`];
                                                    return (
                                                        <circle
                                                            key={`${dev.id}-${cx}-${cy}`}
                                                            cx={cx}
                                                            cy={cy}
                                                            r={isAlert ? 6 : 4}
                                                            fill={isAlert ? '#ef4444' : style.color}
                                                            stroke={isAlert ? '#991b1b' : '#ffffff'}
                                                            strokeWidth={2}
                                                        />
                                                    );
                                                }}
                                                activeDot={{ r: 7, strokeWidth: 2 }}
                                            />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                                <Thermometer className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                                <p className="text-sm font-medium">No hay datos de telemetría recientes registrados.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

