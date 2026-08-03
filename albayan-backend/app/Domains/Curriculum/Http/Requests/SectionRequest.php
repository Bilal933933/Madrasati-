<?php

namespace App\Domains\Curriculum\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('sections', 'slug')->ignore($this->route('section'))],
            'image' => ['nullable', 'string', 'max:2048'],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'sort_order' => ['sometimes', 'integer', 'min:0', Rule::unique('sections', 'sort_order')->where(fn ($q) => $q->where('subject_id', $this->input('subject_id')))->ignore($this->route('section'))],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.required' => 'المادة مطلوبة.',
            'subject_id.integer' => 'المادة يجب أن تكون رقمًا صحيحًا.',
            'subject_id.exists' => 'المادة المحددة غير موجودة.',
            'name.required' => 'اسم الوحدة مطلوب.',
            'name.string' => 'اسم الوحدة يجب أن يكون نصًا.',
            'name.max' => 'اسم الوحدة يجب ألا يتجاوز 255 حرفًا.',
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
            'sort_order.unique' => 'هذا الترتيب مستخدم مسبقًا في نفس المادة. اختر ترتيبًا آخر.',
            'is_published.boolean' => 'قيمة النشر يجب أن تكون صحيحة أو خاطئة.',
        ];
    }
}
