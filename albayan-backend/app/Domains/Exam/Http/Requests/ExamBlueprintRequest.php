<?php

namespace App\Domains\Exam\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExamBlueprintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_type' => ['required', 'string', Rule::in(['lesson', 'unit', 'monthly', 'semester', 'full'])],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'grade_id' => ['nullable', 'integer', 'exists:grades,id'],
            'stage_id' => ['nullable', 'integer', 'exists:stages,id'],
            'month_no' => ['nullable', 'integer', 'numeric', 'between:1,12'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:600'],
            'attempts_allowed' => ['required', 'integer', 'min:1', 'max:10'],
            'easy_count' => ['sometimes', 'integer', 'min:0'],
            'medium_count' => ['sometimes', 'integer', 'min:0'],
            'hard_count' => ['sometimes', 'integer', 'min:0'],
            'pass_threshold_percent' => ['required', 'integer', 'between:1,100'],
            'show_review_after_submit' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'exam_type.required' => 'نوع الامتحان مطلوب.',
            'exam_type.in' => 'نوع الامتحان غير صحيح.',
            'title.required' => 'عنوان الامتحان مطلوب.',
            'duration_minutes.required' => 'مدة الامتحان مطلوبة.',
            'attempts_allowed.required' => 'عدد المحاولات المسموحة مطلوب.',
            'pass_threshold_percent.between' => 'عتبة النجاح يجب أن تكون بين 1 و 100.',
            'month_no.between' => 'رقم الشهر يجب أن يكون بين 1 و 12.',
            'easy_count.integer' => 'عدد الأسئلة السهلة يجب أن يكون رقمًا صحيحًا.',
            'medium_count.integer' => 'عدد الأسئلة المتوسطة يجب أن يكون رقمًا صحيحًا.',
            'hard_count.integer' => 'عدد الأسئلة الصعبة يجب أن يكون رقمًا صحيحًا.',
        ];
    }
}
