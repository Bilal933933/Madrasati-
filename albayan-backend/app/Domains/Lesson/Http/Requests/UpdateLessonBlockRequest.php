<?php

namespace App\Domains\Lesson\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_published' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'is_published.required' => 'حالة العرض مطلوبة.',
            'is_published.boolean' => 'حالة العرض يجب أن تكون صحيحة أو خاطئة.',
        ];
    }
}
