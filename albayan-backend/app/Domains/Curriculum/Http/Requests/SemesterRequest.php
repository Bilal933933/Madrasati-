<?php

namespace App\Domains\Curriculum\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SemesterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'grade_id' => ['required', 'integer', 'exists:grades,id'],
            'name' => ['required', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0', Rule::unique('semesters', 'sort_order')->where(fn ($q) => $q->where('grade_id', $this->input('grade_id')))->ignore($this->route('semester'))],
        ];
    }

    public function messages(): array
    {
        return [
            'grade_id.required' => 'الصف مطلوب.',
            'grade_id.integer' => 'الصف يجب أن يكون رقمًا صحيحًا.',
            'grade_id.exists' => 'الصف المحدد غير موجود.',
            'name.required' => 'اسم الفصل الدراسي مطلوب.',
            'name.string' => 'اسم الفصل الدراسي يجب أن يكون نصًا.',
            'name.max' => 'اسم الفصل الدراسي يجب ألا يتجاوز 255 حرفًا.',
            'sort_order.integer' => 'الترتيب يجب أن يكون رقمًا صحيحًا.',
            'sort_order.min' => 'الترتيب يجب أن يكون 0 أو أكثر.',
            'sort_order.unique' => 'هذا الترتيب مستخدم مسبقًا في نفس الصف. اختر ترتيبًا آخر.',
        ];
    }
}
