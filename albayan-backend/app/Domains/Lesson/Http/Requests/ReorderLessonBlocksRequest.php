<?php

namespace App\Domains\Lesson\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderLessonBlocksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:lesson_blocks,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'ترتيب العناصر مطلوب.',
            'ids.array' => 'ترتيب العناصر يجب أن يكون مصفوفة.',
            'ids.*.integer' => 'معرّف العنصر يجب أن يكون رقمًا صحيحًا.',
            'ids.*.exists' => 'أحد العناصر غير موجود.',
        ];
    }
}
