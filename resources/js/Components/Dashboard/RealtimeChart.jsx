import { chartSeries } from '@/lib/monitoring';
import { useState } from 'react';
import { Thermometer, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const DEVICE_STYLES = [
    { color: '#3b82f6', dash: '6 4' }, // Azul punteado largo
    { color: '#ef4444', dash: '3 3' }, // Rojo punteado corto
    { color: '#10b981', dash: '8 4' }, // Verde esmeralda
    { color: '#8b5cf6', dash: '4 4 2 4' }, // Púrpura trazo guion-punto
    { color: '#f59e0b', dash: '10 5' }, // Ámbar guion largo
    { color: '#ec4899', dash: '2 2' }, // Rosa fino
];

export default function RealtimeChart({ ultimasMediciones = [] }) {
    const [mostrarEnVivo, setMostrarEnVivo] = useState(true);
    const [rangoMediciones, setRangoMediciones] = useState(5);
    const [dispositivosVisibles, setDispositivosVisibles] = useState({});

    const { devices: dispositivosUnicos, data: chartData } = chartSeries(
        ultimasMediciones,
        rangoMediciones,
    );

    const toggleDispositivo = (nombre) => {
        setDispositivosVisibles((prev) => ({
            ...prev,
            [nombre]: prev[nombre] === false ? true : false,
        }));
    };

    const CustomXAxisTick = ({ x, y, payload }) => {
        if (payload.value == null) return null;
        const readingDate = new Date(payload.value);
        const time = readingDate.toLocaleTimeString('es-UY', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const date = readingDate.toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
        });
        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={0}
                    y={0}
                    dy={14}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize={12}
                    fontWeight={600}
                >
                    <tspan x="0" dy="0">
                        {time}
                    </tspan>
                    {date && (
                        <tspan x="0" dy="12">
                            {date}
                        </tspan>
                    )}
                </text>
            </g>
        );
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            {/* Header del Acordeón y Filtros */}
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/80 border-b border-slate-200 gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-indigo-600" />{' '}
                        Evolución de la temperatura
                    </h3>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Botones de Rango */}
                    <div className="flex bg-slate-200/70 p-1 rounded-lg border border-slate-300/40 text-xs font-semibold">
                        <button
                            type="button"
                            aria-pressed={rangoMediciones === 5}
                            onClick={() => setRangoMediciones(5)}
                            className={`px-3 py-1 rounded-md transition-all ${
                                rangoMediciones === 5
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Últimos 5
                        </button>
                        <button
                            type="button"
                            aria-pressed={rangoMediciones === 30}
                            onClick={() => setRangoMediciones(30)}
                            className={`px-3 py-1 rounded-md transition-all ${
                                rangoMediciones === 30
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Últimos 30
                        </button>
                        <button
                            type="button"
                            aria-pressed={rangoMediciones === 100}
                            onClick={() => setRangoMediciones(100)}
                            className={`px-3 py-1 rounded-md transition-all ${
                                rangoMediciones === 100
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Últimos 100
                        </button>
                    </div>

                    <button
                        type="button"
                        aria-label={
                            mostrarEnVivo
                                ? 'Ocultar gráfico'
                                : 'Mostrar gráfico'
                        }
                        aria-expanded={mostrarEnVivo}
                        aria-controls="temperature-chart"
                        onClick={() => setMostrarEnVivo(!mostrarEnVivo)}
                        className="text-slate-600 hover:text-slate-600"
                    >
                        {mostrarEnVivo ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <div
                id="temperature-chart"
                hidden={!mostrarEnVivo}
                className="p-6 space-y-4"
            >
                {/* Selector interactivo de dispositivos */}
                {dispositivosUnicos.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 mr-1">
                            Visibilidad por Dispositivo:
                        </span>
                        {dispositivosUnicos.map((dev, idx) => {
                            const style =
                                DEVICE_STYLES[idx % DEVICE_STYLES.length];
                            const isVisible =
                                dispositivosVisibles[dev.key] !== false;
                            return (
                                <button
                                    key={dev.id}
                                    type="button"
                                    aria-pressed={isVisible}
                                    onClick={() => toggleDispositivo(dev.key)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-sm ${
                                        isVisible
                                            ? 'bg-white text-slate-900 border-slate-300 shadow-sm hover:border-slate-400'
                                            : 'bg-slate-200/60 text-slate-600 border-slate-200 line-through'
                                    }`}
                                >
                                    {isVisible ? (
                                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                    ) : (
                                        <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                                    )}
                                    <span
                                        className="w-4 h-0.5 rounded-full inline-block"
                                        style={{
                                            backgroundColor: isVisible
                                                ? style.color
                                                : '#cbd5e1',
                                        }}
                                    ></span>
                                    <span>{dev.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                <p className="text-sm text-slate-600">
                    Últimos {rangoMediciones} puntos disponibles. Las lecturas
                    se actualizan cada 4 segundos mientras esta página está
                    visible.
                </p>
                {/*gráfica de temperatura */}
                <details className="text-sm text-slate-700">
                    <summary className="cursor-pointer rounded py-2">
                        Ver lecturas del gráfico en una tabla
                    </summary>
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left">
                            <caption className="sr-only">
                                Lecturas de temperatura de los dispositivos
                                visibles
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col" className="p-2">
                                        Fecha y hora
                                    </th>
                                    {dispositivosUnicos
                                        .filter(
                                            (d) =>
                                                dispositivosVisibles[d.key] !==
                                                false,
                                        )
                                        .map((d) => (
                                            <th
                                                key={d.key}
                                                scope="col"
                                                className="p-2"
                                            >
                                                {d.label}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row) => (
                                    <tr key={row.raw_time}>
                                        <th
                                            scope="row"
                                            className="p-2 font-normal whitespace-nowrap"
                                        >
                                            {new Date(
                                                row.raw_time,
                                            ).toLocaleString('es-UY')}
                                        </th>
                                        {dispositivosUnicos
                                            .filter(
                                                (d) =>
                                                    dispositivosVisibles[
                                                        d.key
                                                    ] !== false,
                                            )
                                            .map((d) => (
                                                <td
                                                    key={d.key}
                                                    className="p-2 whitespace-nowrap"
                                                >
                                                    {row[d.key] == null
                                                        ? 'Sin lectura'
                                                        : row[d.key] + ' °C'}
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </details>
                <div className="h-72 w-full sm:h-96">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 10,
                                    bottom: 25,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="timestamp"
                                    type="number"
                                    domain={['dataMin', 'dataMax']}
                                    tickCount={5}
                                    tick={<CustomXAxisTick />}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    unit="°C"
                                    tick={{
                                        fill: '#64748b',
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickLine={false}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (
                                            active &&
                                            payload &&
                                            payload.length
                                        ) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-2 border border-slate-700 min-w-[170px]">
                                                    <p className="text-slate-200 font-mono border-b border-slate-700 pb-1">
                                                        {new Date(
                                                            data.raw_time,
                                                        ).toLocaleString()}
                                                    </p>
                                                    {payload.map((item) => (
                                                        <div
                                                            key={item.dataKey}
                                                            className="flex justify-between items-center gap-4"
                                                        >
                                                            <span className="font-semibold flex items-center gap-1.5">
                                                                <span
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item.color,
                                                                    }}
                                                                ></span>
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
                                    const isVisible =
                                        dispositivosVisibles[dev.key] !== false;
                                    if (!isVisible) return null;

                                    const style =
                                        DEVICE_STYLES[
                                            idx % DEVICE_STYLES.length
                                        ];

                                    return (
                                        <Line
                                            key={dev.id}
                                            data={chartData.filter((row) =>
                                                Object.hasOwn(row, dev.key),
                                            )}
                                            type="monotone"
                                            dataKey={dev.key}
                                            name={dev.label}
                                            stroke={style.color}
                                            strokeDasharray={style.dash}
                                            strokeWidth={3}
                                            connectNulls={false}
                                            isAnimationActive={false}
                                            dot={(dotProps) => {
                                                const { cx, cy, payload } =
                                                    dotProps;
                                                if (
                                                    cx == null ||
                                                    cy == null ||
                                                    payload[dev.key] ===
                                                        undefined
                                                )
                                                    return null;
                                                const isAlert =
                                                    payload[
                                                        `${dev.key}_alerta`
                                                    ];
                                                return (
                                                    <circle
                                                        key={`${dev.id}-${cx}-${cy}`}
                                                        cx={cx}
                                                        cy={cy}
                                                        r={isAlert ? 6 : 4}
                                                        fill={
                                                            isAlert
                                                                ? '#ef4444'
                                                                : style.color
                                                        }
                                                        stroke={
                                                            isAlert
                                                                ? '#991b1b'
                                                                : '#ffffff'
                                                        }
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
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 py-12">
                            <Thermometer className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                            <p className="text-sm font-medium">
                                No hay datos de telemetría recientes
                                registrados.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
