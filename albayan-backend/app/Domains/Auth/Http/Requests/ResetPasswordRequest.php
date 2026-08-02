<?php

namespace App\Domains\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'exists:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'رابط إعادة التعيين غير صالح.',
            'email.exists' => 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني.',
            'password.required' => 'كلمة السر الجديدة مطلوبة.',
            'password.confirmed' => 'تأكيد كلمة السر غير مطابق.',
        ];
    }
}
