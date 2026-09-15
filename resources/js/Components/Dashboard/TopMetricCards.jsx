import { useState } from 'react';
import { Thermometer, Cpu } from 'lucide-react';

export default function TopMetricCards({ dispositivosConEstado = [], alertasSinResolverCount = 0 }) {
    const [selectedDeviceId, setSelectedDeviceId] = useState(
        dispositivosConEstado.length > 0 ? dispositivosConEstado[0].id : null
    );

    const activeDisp = dispositivosConEstado.find(d => String(d.id) === String(selectedDeviceId)) 
        || (dispositivosConEstado.length > 0 ? dispositivosConEstado[0] : null);

    const ultimaMedicion = activeDisp?.ultima_medicion;
    const estaEnBateria = ultimaMedicion ? (ultimaMedicion.bateria === true) : false;
    const estadoAlertasWeb = activeDisp?.estado_alertas || { temperatura: true, bateria: true, vencimiento: true, inactividad: false };

    return (
        <div className="space-y-3">
            {/* Selector de Dispositivo*/}
            {dispositivosConEstado.length > 0 && (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <Cpu className="w-4 h-4 text-indigo-600" />
                        <span>Inspeccionar Dispositivo:</span>
                    </div>
                    <select
                        value={selectedDeviceId || ''}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="text-xs font-medium border-slate-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1"
                    >
                        {dispositivosConEstado.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.nombre} ({d.freezer_ubicacion})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* TARJETA 1: TEMPERATURA */}
                <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-md border border-blue-500 flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">Temperatura</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black font-mono tracking-tight text-white">
                            {ultimaMedicion ? `${Number(ultimaMedicion.temperatura).toFixed(2)} °C` : 'N/D'}
                        </div>
                        <p className="text-[10px] text-blue-200 truncate font-medium">
                            {activeDisp?.nombre || 'ESP32'}
                        </p>
                    </div>
                </div>

                {/* TARJETA 2: CORRIENTE ELÉCTRICA */}
                <div className={`p-3.5 rounded-xl shadow-md border flex flex-col justify-between h-24 transition-colors ${
                    estaEnBateria 
                        ? 'bg-red-600 text-white border-red-500' 
                        : 'bg-emerald-600 text-white border-emerald-500'
                }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">Corriente eléctrica</span>
                    <div>
                        <div className="text-2xl font-black tracking-tight">
                            {estaEnBateria ? 'Batería' : 'OK'}
                        </div>
                        <p className="text-[10px] text-white/80 font-medium">
                            {estaEnBateria ? 'Corte de Luz detectado' : 'Red Eléctrica Activa'}
                        </p>
                    </div>
                </div>

                {/* TARJETA 3: ESTADO ALERTAS WEB */}
                <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-md border border-slate-800 flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estado Alertas Web</span>
                        {alertasSinResolverCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title={`${alertasSinResolverCount} alertas pendientes`}></span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                        <span className={`px-2 py-0.5 rounded text-center truncate ${estadoAlertasWeb.temperatura ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                            Temp: {estadoAlertasWeb.temperatura ? 'ON' : 'OFF'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-center truncate ${estadoAlertasWeb.bateria ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                            Batería: {estadoAlertasWeb.bateria ? 'ON' : 'OFF'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-center truncate ${estadoAlertasWeb.vencimiento ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                            Venc: {estadoAlertasWeb.vencimiento ? 'ON' : 'OFF'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-center truncate ${estadoAlertasWeb.inactividad ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                            Inact: {estadoAlertasWeb.inactividad ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
