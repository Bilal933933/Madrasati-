<?php

namespace App\Domains\AdminUser\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'is_active.required' => 'حالة التفعيل مطلوبة.',
            'is_active.boolean' => 'حالة التفعيل يجب أن تكون صحيحة أو خاطئة.',
        ];
    }
}
