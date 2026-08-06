<?php

namespace App\Domains\Curriculum\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * حفظ سياق التصفح — المادة تُحل من slug (يُستنتج منها المرحلة/الصف/الفصل).
 */
class StoreUserContextRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_slug' => ['required', 'string', 'exists:subjects,slug'],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_slug.required' => 'المادة مطلوبة لحفظ السياق.',
            'subject_slug.exists' => 'المادة المطلوبة غير موجودة.',
        ];
    }
}
