<?php

namespace App\Domains\Achievement\Http\Requests;

use App\Domains\Achievement\Enums\AchievementMetric;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AchievementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $metricValues = array_column(AchievementMetric::cases(), 'value');

        return [
            'key' => ['nullable', 'string', 'max:100', Rule::unique('achievements', 'key')->ignore($this->route('achievement'))],
            'metric' => ['required', 'string', Rule::in($metricValues)],
            'threshold' => ['required', 'integer', 'min:1', 'max:1000000'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'metric.required' => 'المقياس مطلوب.',
            'metric.in' => 'المقياس غير صحيح.',
            'threshold.required' => 'العتبة (الحد) مطلوبة.',
            'threshold.integer' => 'العتبة يجب أن تكون رقمًا صحيحًا.',
            'threshold.min' => 'العتبة يجب أن تكون 1 على الأقل.',
            'title.required' => 'عنوان الإنجاز مطلوب.',
            'key.unique' => 'المفتاح مستخدم سابقًا — اختر مفتاحًا آخر أو اتركه فارغًا.',
        ];
    }
}
