<?php

namespace App\Domains\Exam\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BankQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'type' => ['required', 'string', Rule::in(['mcq', 'true_false'])],
            'content' => ['required', 'string'],
            'explanation' => ['nullable', 'string'],
            'difficulty' => ['required', 'string', Rule::in(['easy', 'medium', 'hard'])],
            'correct_answer' => ['nullable', 'boolean', Rule::requiredIf($this->input('type') === 'true_false')],
            'is_active' => ['sometimes', 'boolean'],
            'options' => ['required_if:type,mcq', 'array'],
            'options.*.content' => ['required', 'string'],
            'options.*.is_correct' => ['sometimes', 'boolean'],
        ];

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('type') !== 'mcq') {
                return;
            }

            $options = $this->input('options', []);

            if (! is_array($options) || count($options) < 2) {
                $validator->errors()->add('options', 'سؤال الاختيار من متعدد يتطلب خيارين على الأقل.');

                return;
            }

            $hasCorrect = collect($options)->contains(fn ($option) => (bool) ($option['is_correct'] ?? false));

            if (! $hasCorrect) {
                $validator->errors()->add('options', 'يجب تحديد خيار صحيح واحد على الأقل.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'lesson_id.required' => 'الدرس المرتبط بالسؤال مطلوب.',
            'lesson_id.exists' => 'الدرس المحدد غير موجود.',
            'type.required' => 'نوع السؤال مطلوب.',
            'type.in' => 'نوع السؤال غير صحيح — القيم المسموحة: اختيار من متعدد، صح وخطأ.',
            'content.required' => 'نص السؤال مطلوب.',
            'difficulty.required' => 'مستوى الصعوبة مطلوب.',
            'difficulty.in' => 'مستوى الصعوبة غير صالح.',
            'correct_answer.required' => 'الإجابة الصحيحة مطلوبة لسؤال صح وخطأ.',
            'options.array' => 'الخيارات يجب أن تكون قائمة.',
            'options.*.content.required' => 'نص الخيار مطلوب.',
        ];
    }
}
