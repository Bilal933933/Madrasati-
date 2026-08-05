<?php

namespace App\Domains\Assessment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_id' => ['required', 'integer', 'exists:assessments,id'],
            'type' => ['required', 'string', Rule::in(['mcq', 'true_false'])],
            'content' => ['required', 'string'],
            'explanation' => ['nullable', 'string'],
            'correct_answer' => ['nullable', 'boolean', Rule::requiredIf($this->input('type') === 'true_false')],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'assessment_id.required' => 'التقييم مطلوب.',
            'assessment_id.integer' => 'التقييم يجب أن يكون رقمًا صحيحًا.',
            'assessment_id.exists' => 'التقييم المحدد غير موجود.',
            'type.required' => 'نوع السؤال مطلوب.',
            'type.in' => 'نوع السؤال غير صحيح — القيم المسموحة: اختيار من متعدد، صح وخطأ.',
            'content.required' => 'نص السؤال مطلوب.',
            'content.string' => 'نص السؤال يجب أن يكون نصًا.',
            'explanation.string' => 'التوضيح يجب أن يكون نصًا.',
            'correct_answer.required' => 'الإجابة الصحيحة مطلوبة لسؤال صح وخطأ.',
            'correct_answer.boolean' => 'الإجابة الصحيحة يجب أن تكون قيمة منطقية (صواب/خطأ).',
            'sort_order.integer' => 'الترتيب يجب أن يكون رقمًا صحيحًا.',
            'sort_order.min' => 'الترتيب يجب أن يكون 0 أو أكثر.',
        ];
    }
}
