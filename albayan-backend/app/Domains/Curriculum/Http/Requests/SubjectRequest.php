<?php

namespace App\Domains\Curriculum\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'grade_id' => ['required', 'integer', 'exists:grades,id'],
            'semester_id' => ['nullable', 'integer', 'exists:semesters,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('subjects', 'slug')->ignore($this->route('subject'))],
            'image' => ['nullable', 'string', 'max:2048'],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'sort_order' => ['sometimes', 'integer', 'min:0', Rule::unique('subjects', 'sort_order')->where(function ($q) {
                $q->where('grade_id', $this->input('grade_id'));

                if ($this->input('semester_id')) {
                    $q->where('semester_id', $this->input('semester_id'));
                }
            })->ignore($this->route('subject'))],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'grade_id.required' => 'الصف مطلوب.',
            'grade_id.integer' => 'الصف يجب أن يكون رقمًا صحيحًا.',
            'grade_id.exists' => 'الصف المحدد غير موجود.',
            'semester_id.integer' => 'الفصل الدراسي يجب أن يكون رقمًا صحيحًا.',
            'semester_id.exists' => 'الفصل الدراسي المحدد غير موجود.',
            'name.required' => 'اسم المادة مطلوب.',
            'name.string' => 'اسم المادة يجب أن يكون نصًا.',
            'name.max' => 'اسم المادة يجب ألا يتجاوز 255 حرفًا.',
            'slug.string' => 'الرابط يجب أن يكون نصًا.',
            'slug.max' => 'الرابط يجب ألا يتجاوز 255 حرفًا.',
            'slug.regex' => 'صيغة الرابط غير صحيحة — أحرف إنجليزية صغيرة وأرقام وشرطات فقط.',
            'slug.unique' => 'هذا الرابط مستخدم من قبل.',
            'image.string' => 'الصورة يجب أن تكون رابطًا نصيًا صحيحًا.',
            'image.max' => 'رابط الصورة طويل جدًا.',
            'icon.string' => 'الأيقونة يجب أن تكون نصًا.',
            'icon.max' => 'الأيقونة يجب ألا تتجاوز 100 حرف.',
            'color.regex' => 'صيغة اللون غير صحيحة — استخدم HEX مثل #2563EB.',
            'sort_order.integer' => 'الترتيب يجب أن يكون رقمًا صحيحًا.',
            'sort_order.min' => 'الترتيب يجب أن يكون 0 أو أكثر.',
            'sort_order.unique' => 'هذا الترتيب مستخدم مسبقًا في نفس الصف. اختر ترتيبًا آخر.',
            'is_published.boolean' => 'قيمة النشر يجب أن تكون صحيحة أو خاطئة.',
        ];
    }
}
