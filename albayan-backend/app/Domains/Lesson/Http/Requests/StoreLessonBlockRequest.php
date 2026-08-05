<?php

namespace App\Domains\Lesson\Http\Requests;

use App\Domains\Lesson\Enums\BlockKind;
use App\Support\Rules\YoutubeUrlRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLessonBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $kind = $this->input('block_kind');
        $assessmentKinds = [
            BlockKind::PreAssessment->value,
            BlockKind::FormativeAssessment->value,
            BlockKind::FinalAssessment->value,
        ];

        $rules = [
            'block_kind' => ['required', Rule::enum(BlockKind::class)],
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
            'video' => ['nullable', 'string', 'max:2048', new YoutubeUrlRule],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'paragraph_id' => ['nullable', 'integer', 'exists:paragraphs,id'],
            'assessment_id' => ['nullable', 'integer', 'exists:assessments,id'],
        ];

        if ($kind === BlockKind::Paragraph->value) {
            $rules['title'] = ['required', 'string', 'max:255'];
            $rules['content'] = ['required', 'string'];
        } elseif (in_array($kind, $assessmentKinds, true)) {
            $rules['title'] = ['required', 'string', 'max:255'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'block_kind.required' => 'نوع العنصر مطلوب.',
            'block_kind.enum' => 'نوع العنصر غير صالح.',
            'title.required' => 'العنوان مطلوب.',
            'title.string' => 'العنوان يجب أن يكون نصًا.',
            'title.max' => 'العنوان يجب ألا يتجاوز 255 حرفًا.',
            'content.required' => 'محتوى الفقرة مطلوب.',
            'content.string' => 'محتوى الفقرة يجب أن يكون نصًا.',
            'paragraph_id.integer' => 'الفقرة يجب أن تكون رقمًا صحيحًا.',
            'paragraph_id.exists' => 'الفقرة المحددة غير موجودة.',
            'assessment_id.integer' => 'التقييم يجب أن يكون رقمًا صحيحًا.',
            'assessment_id.exists' => 'التقييم المحدد غير موجود.',
            'image.string' => 'الصورة يجب أن تكون رابطًا نصيًا صحيحًا.',
            'video.string' => 'الفيديو يجب أن يكون نصًا.',
            'icon.string' => 'الأيقونة يجب أن تكون نصًا.',
            'color.regex' => 'صيغة اللون غير صحيحة — استخدم HEX مثل #2563EB.',
        ];
    }
}
