export function readingState(measurement) {
    const raw = measurement?.temperatura;
    const temperature =
        raw !== null &&
        raw !== undefined &&
        raw !== '' &&
        Number.isFinite(Number(raw))
            ? Number(raw)
            : null;
    const battery =
        typeof measurement?.bateria === 'boolean' ? measurement.bateria : null;
    return { temperature, battery };
}

export function chartSeries(measurements, limit) {
    const devices = new Map();
    const times = new Map();
    [...measurements]
        .sort((a, b) => new Date(a.fecha_y_hora) - new Date(b.fecha_y_hora))
        .forEach((m) => {
            const id = m.dispositivo?.id ?? m.dispositivo_id;
            if (
                id == null ||
                !m.fecha_y_hora ||
                Number.isNaN(new Date(m.fecha_y_hora).getTime())
            )
                return;
            const key = `device_${id}`;
            const name = m.dispositivo?.nombre || `Dispositivo ${id}`;
            devices.set(key, { id, key, nombre: name });
            if (!times.has(m.fecha_y_hora)) {
                const date = new Date(m.fecha_y_hora);
                times.set(m.fecha_y_hora, {
                    raw_time: m.fecha_y_hora,
                    timestamp: date.getTime(),
                    fecha_y_hora_display: `${date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}\n${date.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' })}`,
                });
            }
            const row = times.get(m.fecha_y_hora);
            row[key] = readingState(m).temperature;
            row[`${key}_alerta`] = m.tiene_alerta;
        });
    const allDevices = [...devices.values()];
    allDevices.forEach((device) => {
        if (allDevices.filter((d) => d.nombre === device.nombre).length > 1)
            device.label = `${device.nombre} · #${device.id}`;
        else device.label = device.nombre;
    });
    return { devices: allDevices, data: [...times.values()].slice(-limit) };
}
