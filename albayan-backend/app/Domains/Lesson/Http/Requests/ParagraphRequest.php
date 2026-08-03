<?php

namespace App\Domains\Lesson\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ParagraphRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'type' => ['sometimes', 'string', 'max:50'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('paragraphs', 'slug')->ignore($this->route('paragraph'))],
            'image' => ['nullable', 'string', 'max:2048'],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'content' => ['required', 'string'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'lesson_id.required' => 'الدرس مطلوب.',
            'lesson_id.integer' => 'الدرس يجب أن يكون رقمًا صحيحًا.',
            'lesson_id.exists' => 'الدرس المحدد غير موجود.',
            'type.string' => 'النوع يجب أن يكون نصًا.',
            'type.max' => 'النوع يجب ألا يتجاوز 50 حرفًا.',
            'slug.string' => 'الرابط يجب أن يكون نصًا.',
            'slug.max' => 'الرابط يجب ألا يتجاوز 255 حرفًا.',
            'slug.regex' => 'صيغة الرابط غير صحيحة — أحرف إنجليزية صغيرة وأرقام وشرطات فقط.',
            'slug.unique' => 'هذا الرابط مستخدم من قبل.',
            'image.string' => 'الصورة يجب أن تكون رابطًا نصيًا صحيحًا.',
            'image.max' => 'رابط الصورة طويل جدًا.',
            'icon.string' => 'الأيقونة يجب أن تكون نصًا.',
            'icon.max' => 'الأيقونة يجب ألا تتجاوز 100 حرف.',
            'color.regex' => 'صيغة اللون غير صحيحة — استخدم HEX مثل #2563EB.',
            'content.required' => 'محتوى الفقرة مطلوب.',
            'content.string' => 'محتوى الفقرة يجب أن يكون نصًا.',
            'sort_order.integer' => 'الترتيب يجب أن يكون رقمًا صحيحًا.',
            'sort_order.min' => 'الترتيب يجب أن يكون 0 أو أكثر.',
        ];
    }
}
