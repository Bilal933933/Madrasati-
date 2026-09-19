<?php

namespace App\Domains\Settings\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_name' => ['nullable', 'string', 'max:100'],
            'site_logo' => ['nullable', 'string', 'max:2048'],
            'welcome_message' => ['nullable', 'string', 'max:2000'],
            'maintenance_mode' => ['sometimes', 'boolean'],
            'social_facebook' => ['nullable', 'string', 'max:500'],
            'social_twitter' => ['nullable', 'string', 'max:500'],
            'social_instagram' => ['nullable', 'string', 'max:500'],
            'social_youtube' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'site_name.string' => 'اسم المنصة يجب أن يكون نصًا.',
            'site_name.max' => 'اسم المنصة يجب ألا يتجاوز 100 حرف.',
            'site_logo.string' => 'رابط الشعار يجب أن يكون نصًا.',
            'site_logo.max' => 'رابط الشعار طويل جدًا.',
            'welcome_message.string' => 'رسالة الترحيب يجب أن تكون نصًا.',
            'welcome_message.max' => 'رسالة الترحيب يجب ألا تتجاوز 2000 حرف.',
            'maintenance_mode.boolean' => 'وضع الصيانة يجب أن يكون صحيحة أو خاطئة.',
            'social_facebook.max' => 'رابط فيسبوك طويل جدًا.',
            'social_twitter.max' => 'رابط تويتر طويل جدًا.',
            'social_instagram.max' => 'رابط إنستغرام طويل جدًا.',
            'social_youtube.max' => 'رابط يوتيوب طويل جدًا.',
        ];
    }
}
