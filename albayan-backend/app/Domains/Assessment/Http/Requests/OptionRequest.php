<?php

namespace App\Domains\Assessment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            'content' => ['required', 'string', 'max:500'],
            'is_correct' => ['required', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'question_id.required' => 'السؤال مطلوب.',
            'question_id.integer' => 'السؤال يجب أن يكون رقمًا صحيحًا.',
            'question_id.exists' => 'السؤال المحدد غير موجود.',
            'content.required' => 'نص الخيار مطلوب.',
            'content.string' => 'نص الخيار يجب أن يكون نصًا.',
            'content.max' => 'نص الخيار يجب ألا يتجاوز 500 حرف.',
            'is_correct.required' => 'يجب تحديد ما إذا كان الخيار صحيحًا أم لا.',
            'is_correct.boolean' => 'قيمة صح/خطأ للخيار يجب أن تكون منطقية.',
            'sort_order.integer' => 'الترتيب يجب أن يكون رقمًا صحيحًا.',
            'sort_order.min' => 'الترتيب يجب أن يكون 0 أو أكثر.',
        ];
    }
}
