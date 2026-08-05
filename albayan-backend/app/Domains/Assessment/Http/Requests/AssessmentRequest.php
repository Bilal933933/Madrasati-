<?php

namespace App\Domains\Assessment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'paragraph_id' => ['nullable', 'integer', 'exists:paragraphs,id'],
            'type' => ['required', 'string', Rule::in(['pre', 'formative', 'final'])],
            'title' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'lesson_id.required' => 'الدرس مطلوب.',
            'lesson_id.integer' => 'الدرس يجب أن يكون رقمًا صحيحًا.',
            'lesson_id.exists' => 'الدرس المحدد غير موجود.',
            'paragraph_id.integer' => 'الفقرة يجب أن تكون رقمًا صحيحًا.',
            'paragraph_id.exists' => 'الفقرة المحددة غير موجودة.',
            'type.required' => 'نوع التقييم مطلوب.',
            'type.in' => 'نوع التقييم غير صحيح — القيم المسموحة: مبدئي، تكويني، ختامي.',
            'title.string' => 'عنوان التقييم يجب أن يكون نصًا.',
            'title.max' => 'عنوان التقييم يجب ألا يتجاوز 255 حرفًا.',
            'sort_order.integer' => 'الترتيب يجب أن يكون رقمًا صحيحًا.',
            'sort_order.min' => 'الترتيب يجب أن يكون 0 أو أكثر.',
        ];
    }
}
