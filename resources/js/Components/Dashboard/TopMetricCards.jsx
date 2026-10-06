import { Thermometer, Zap, Battery, Bell, Cpu } from 'lucide-react';
import { readingState } from '@/lib/monitoring';

function SettingStatus({ label, value }) {
    return (
        <span className="inline-flex flex-wrap gap-1 text-sm text-slate-600">
            {label}:{' '}
            <strong
                className={
                    value === true
                        ? 'font-medium text-slate-800'
                        : 'font-medium text-slate-600'
                }
            >
                {value === true
                    ? 'Activo'
                    : value === false
                      ? 'Desactivado'
                      : 'Sin configurar'}
            </strong>
        </span>
    );
}

export default function TopMetricCards({
    dispositivosConEstado = [],
    alertasSinResolverCount = 0,
    configuracionSistema = {},
    selectedDeviceId = null,
}) {
    const devices = selectedDeviceId
        ? dispositivosConEstado.filter(
              (d) => String(d.id) === String(selectedDeviceId),
          )
        : dispositivosConEstado;
    const activeDevice = selectedDeviceId ? devices[0] : null;
    return (
        <section aria-label="Estado de los dispositivos" className="fg-panel">
            <div className="fg-panel-heading">
                <h2 className="text-base font-semibold text-slate-900">
                    {activeDevice
                        ? 'Estado del dispositivo'
                        : 'Estado de los dispositivos'}
                </h2>
                <span
                    className={`fg-status ${alertasSinResolverCount > 0 ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'}`}
                >
                    <Bell aria-hidden="true" className="h-4 w-4" />
                    {alertasSinResolverCount} alertas sin resolver{' '}
                    {selectedDeviceId ? 'del dispositivo' : 'en el sistema'}
                </span>
            </div>
            {devices.length === 0 ? (
                <p className="fg-empty">
                    No hay dispositivos para mostrar. Registra un dispositivo en
                    Configuración para comenzar a recibir mediciones.
                </p>
            ) : (
                <div className="divide-y divide-slate-200">
                    {devices.map((device) => {
                        const reading = device.ultima_medicion;
                        const { temperature, battery } = readingState(reading);
                        return (
                            <article
                                key={device.id}
                                className="grid gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6 xl:grid-cols-[1.2fr_1fr_1fr]"
                            >
                                <div className="min-w-0">
                                    <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                                        <Cpu
                                            aria-hidden="true"
                                            className="h-4 w-4 shrink-0 text-slate-500"
                                        />
                                        <span className="break-words">
                                            {device.nombre}
                                        </span>
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {device.freezer_ubicacion}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-600">
                                        {reading?.fecha_y_hora
                                            ? 'Última lectura: ' +
                                              new Date(
                                                  reading.fecha_y_hora,
                                              ).toLocaleString('es-UY')
                                            : 'Aún no se recibieron mediciones'}
                                    </p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm text-slate-600">
                                        <Thermometer
                                            aria-hidden="true"
                                            className="h-4 w-4"
                                        />
                                        Última temperatura
                                    </p>
                                    <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                                        {temperature === null ? (
                                            <span className="text-base font-medium text-slate-600">
                                                Sin mediciones
                                            </span>
                                        ) : (
                                            temperature.toLocaleString(
                                                'es-UY',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                },
                                            ) + ' °C'
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Suministro eléctrico en la última
                                        lectura
                                    </p>
                                    <span
                                        className={`fg-status mt-2 ${battery === true ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'}`}
                                    >
                                        {battery === true ? (
                                            <Battery
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                            />
                                        ) : (
                                            <Zap
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                            />
                                        )}
                                        {battery === null
                                            ? 'Sin mediciones'
                                            : battery
                                              ? 'En batería · corte de energía'
                                              : 'Red eléctrica'}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
            <details className="border-t border-slate-200 px-4 py-4 sm:px-6">
                <summary className="cursor-pointer rounded text-sm font-medium text-slate-700">
                    Canales de notificación y alertas habilitadas
                </summary>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    <SettingStatus
                        label="Correo electrónico"
                        value={configuracionSistema.envio_email_activo}
                    />
                    <SettingStatus
                        label="SMS"
                        value={configuracionSistema.envio_sms_activo}
                    />
                </div>
                <div className="mt-4 space-y-3">
                    {devices.map((device) => (
                        <div key={device.id} className="text-sm">
                            <p className="mb-1 font-medium text-slate-800">
                                {device.nombre}
                            </p>
                            <div className="flex flex-wrap gap-x-5 gap-y-2">
                                {[
                                    ['temperatura', 'Temperatura'],
                                    ['bateria', 'Corte de energía'],
                                    ['vencimiento', 'Vencimiento'],
                                    ['inactividad', 'Inactividad'],
                                    ['modem', 'Módulo SMS'],
                                ].map(([key, label]) => (
                                    <SettingStatus
                                        key={key}
                                        label={label}
                                        value={device.estado_alertas?.[key]}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </details>
        </section>
    );
}
