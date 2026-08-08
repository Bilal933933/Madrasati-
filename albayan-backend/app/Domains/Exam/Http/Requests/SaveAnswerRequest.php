<?php

namespace App\Domains\Exam\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        // تطبيع إجابة صح/خطأ من أي جسم
        if ($this->filled('value')) {
            $this->merge(['selected_boolean' => filter_var($this->input('value'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        return [
            'selected_option_id' => ['nullable', 'integer', 'exists:bank_question_options,id'],
            'selected_boolean' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'selected_option_id.integer' => 'معرّف الخيار غير صالح.',
            'selected_option_id.exists' => 'الخيار المحدد غير موجود.',
            'selected_boolean.boolean' => 'قيمة الإجابة لسؤال صح/خطأ غير صالحة.',
        ];
    }
}
