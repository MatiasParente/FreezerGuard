<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTelemetryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */

    //para determinar si recibimos o no datos externos
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */

    //validamos que los datos que nos envien sean correctos antes de enviarlos a la base de datos para evitar que manden valores falsos o corrupted data
    public function rules(): array
    {
        return [
            'device_id' => ['required', 'integer', 'exists:dispositivos,id'],
            'temperature' => ['required', 'numeric', 'between:-100,100'],
            'bateria' => ['required', 'boolean'],
            'timestamp' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'device_id.required' => 'El ID del dispositivo es requerido.',
            'temperature.required' => 'La temperatura es requerida.',
            'bateria.required' => 'El estado de la bateria es requerido.',
            'timestamp.required' => 'La fecha y hora son requeridas.',
        ];
    }
}
