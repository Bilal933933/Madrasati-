<?php

namespace App\Domains\Lesson\Http\Requests;

use App\Support\Rules\YoutubeUrlRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('lessons', 'slug')->ignore($this->route('lesson'))],
            'summary' => ['nullable', 'string'],
            'learning_objectives' => ['nullable', 'array'],
            'learning_objectives.*' => ['string', 'max:500'],
            'image' => ['nullable', 'string', 'max:2048'],
            'video' => ['nullable', 'string', 'max:2048', new YoutubeUrlRule],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'sort_order' => ['sometimes', 'integer', 'min:0', Rule::unique('lessons', 'sort_order')->where(fn ($q) => $q->where('course_id', $this->input('course_id')))->ignore($this->route('lesson'))],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'course_id.required' => 'المقرر مطلوب.',
            'course_id.integer' => 'المقرر يجب أن يكون رقمًا صحيحًا.',
            'course_id.exists' => 'المقرر المحدد غير موجود.',
            'title.required' => 'عنوان الدرس مطلوب.',
            'title.string' => 'عنوان الدرس يجب أن يكون نصًا.',
            'title.max' => 'عنوان الدرس يجب ألا يتجاوز 255 حرفًا.',
            'slug.string' => 'الرابط يجب أن يكون نصًا.',
            'slug.max' => 'الرابط يجب ألا يتجاوز 255 حرفًا.',
            'slug.regex' => 'صيغة الرابط غير صحيحة — أحرف إنجليزية صغيرة وأرقام وشرطات فقط.',
            'slug.unique' => 'هذا الرابط مستخدم من قبل.',
            'summary.string' => 'الملخص يجب أن يكون نصًا.',
            'learning_objectives.array' => 'أهداف التعلم يجب أن تكون قائمة.',
            'learning_objectives.*.string' => 'كل هدف تعلم يجب أن يكون نصًا.',
            'learning_objectives.*.max' => 'كل هدف تعلم يجب ألا يتجاوز 500 حرف.',
            'image.string' => 'الصورة يجب أن تكون رابطًا نصيًا صحيحًا.',
            'image.max' => 'رابط الصورة طويل جدًا.',
            'video.string' => 'الفيديو يجب أن يكون نصًا.',
            'video.max' => 'رابط الفيديو طويل جدًا.',
            'icon.string' => 'الأيقونة يجب أن تكون نصًا.',
            'icon.max' => 'الأيقونة يجب ألا تتجاوز 100 حرف.',
            'color.regex' => 'صيغة اللون غير صحيحة — استخدم HEX مثل #2563EB.',
            'sort_order.integer' => 'الترتيب يجب أن يكون رقمًا صحيحًا.',
            'sort_order.min' => 'الترتيب يجب أن يكون 0 أو أكثر.',
            'sort_order.unique' => 'هذا الترتيب مستخدم مسبقًا في نفس المقرر. اختر ترتيبًا آخر.',
            'is_published.boolean' => 'قيمة النشر يجب أن تكون صحيحة أو خاطئة.',
        ];
    }
}
