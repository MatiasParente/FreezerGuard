<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTelemetryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        // Normalizar alias para soportar tanto device_id como dispositivo_id, y temperature como temperatura
        if (!$this->has('device_id') && $this->has('dispositivo_id')) {
            $this->merge(['device_id' => $this->input('dispositivo_id')]);
        }
        if (!$this->has('temperature') && $this->has('temperatura')) {
            $this->merge(['temperature' => $this->input('temperatura')]);
        }
    }

    public function rules(): array
    {
        return [
            'device_id' => ['required', 'integer', 'exists:dispositivos,id'],
            'temperature' => ['required', 'numeric', 'between:-100,100'],
            'bateria' => ['required', 'boolean'],
            'modem_ok' => ['nullable', 'boolean'],
            'modem_status' => ['nullable', 'string'],
            'timestamp' => ['nullable'],
        ];
    }

    public function messages(): array
    {
        return [
            'device_id.required' => 'El ID del dispositivo es requerido.',
            'temperature.required' => 'La temperatura es requerida.',
            'bateria.required' => 'El estado de la batería es requerido.',
        ];
    }
}
