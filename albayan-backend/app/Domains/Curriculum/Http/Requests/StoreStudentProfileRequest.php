<?php

namespace App\Domains\Curriculum\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد التحقق (Validation) فقط — لا منطق أعمال هنا
     */
    public function rules(): array
    {
        return [
            'grade_id' => ['required', 'integer', 'exists:grades,id'],
            'semester_id' => [
                'required',
                'integer',
                'exists:semesters,id',
                Rule::exists('semesters', 'id')->where('grade_id', $this->input('grade_id')),
            ],
        ];
    }

    /**
     * رسائل خطأ مخصّصة باللغة العربية
     */
    public function messages(): array
    {
        return [
            'grade_id.required' => 'يجب اختيار الصف الدراسي.',
            'grade_id.exists' => 'الصف الدراسي المختار غير موجود.',
            'semester_id.required' => 'يجب اختيار الفصل الدراسي.',
            'semester_id.exists' => 'الفصل الدراسي المختار لا يتبع الصف الذي اخترته.',
        ];
    }
}
