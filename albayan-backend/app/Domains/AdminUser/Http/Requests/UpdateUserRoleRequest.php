<?php

namespace App\Domains\AdminUser\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in(['student', 'teacher', 'admin'])],
        ];
    }

    public function messages(): array
    {
        return [
            'role.required' => 'الدور مطلوب.',
            'role.in' => 'الدور غير صالح — اختر: طالب، معلم، أو مشرف.',
        ];
    }
}
