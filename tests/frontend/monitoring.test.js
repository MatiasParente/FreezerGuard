import test from 'node:test';
import assert from 'node:assert/strict';
import {
    readingState,
    chartSeries,
} from '../../resources/js/lib/monitoring.js';

test('missing or invalid telemetry never reports zero degrees or healthy power', () => {
    for (const measurement of [
        undefined,
        {},
        { temperatura: null },
        { temperatura: '' },
        { temperatura: 'invalid' },
    ]) {
        assert.deepEqual(readingState(measurement), {
            temperature: null,
            battery: null,
        });
    }
});

test('zero degrees and explicit power states remain valid readings', () => {
    assert.deepEqual(readingState({ temperatura: '0.00', bateria: false }), {
        temperature: 0,
        battery: false,
    });
    assert.deepEqual(readingState({ temperatura: '-18.25', bateria: true }), {
        temperature: -18.25,
        battery: true,
    });
});

test('devices with the same name keep separate values and labels', () => {
    const series = chartSeries(
        [
            {
                dispositivo: { id: 1, nombre: 'ESP32' },
                fecha_y_hora: '2026-10-06T12:00:00Z',
                temperatura: -18,
            },
            {
                dispositivo: { id: 2, nombre: 'ESP32' },
                fecha_y_hora: '2026-10-06T12:00:00Z',
                temperatura: -12,
            },
        ],
        5,
    );
    assert.equal(series.devices.length, 2);
    assert.notEqual(series.devices[0].label, series.devices[1].label);
    assert.equal(series.data[0].device_1, -18);
    assert.equal(series.data[0].device_2, -12);
});

test('chart sorts readings and limits time points without turning missing values into zero', () => {
    const series = chartSeries(
        [
            {
                dispositivo_id: 1,
                fecha_y_hora: '2026-10-06T12:02:00Z',
                temperatura: null,
            },
            {
                dispositivo_id: 1,
                fecha_y_hora: '2026-10-06T12:00:00Z',
                temperatura: -20,
            },
            { dispositivo_id: 1, fecha_y_hora: 'invalid', temperatura: -15 },
            {
                dispositivo_id: 1,
                fecha_y_hora: '2026-10-06T12:01:00Z',
                temperatura: -18,
            },
        ],
        2,
    );
    assert.equal(series.data.length, 2);
    assert.equal(series.data[0].device_1, -18);
    assert.equal(series.data[1].device_1, null);
});
