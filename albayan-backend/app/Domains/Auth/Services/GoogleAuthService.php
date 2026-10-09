<?php

namespace App\Domains\Auth\Services;

use App\Domains\Auth\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class GoogleAuthService
{
    /**
     * إيجاد المستخدم أو إنشاؤه بناءً على بيانات جوجل، مع دعم ربط الحسابات
     *
     * سيناريوهات معالجة:
     * 1) google_id موجود مسبقًا → تسجيل دخول مباشر
     * 2) google_id غير موجود لكن email مسجّل مسبقًا (بإيميل/كلمة سر) → ربط الحساب (Account Linking)
     * 3) لا شيء موجود → إنشاء حساب جديد بدور student
     *
     * ملاحظة أمنية: الربط في الحالة (2) آمن لأن Google تضمن أن الإيميل موثّق (Verified)
     * فعليًا من طرفها قبل أن يصل إلينا، ولذلك لا نطلب تأكيدًا إضافيًا.
     */
    public function findOrCreateFromGoogle(SocialiteUser $googleUser): User
    {
        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // ربط الحساب الموجود بحساب جوجل
                $user->forceFill([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ])->save();
            } else {
                // إنشاء حساب جديد
                $user = User::create([
                    'name' => $googleUser->getName() ?? $googleUser->getNickname(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);

                // role خارج $fillable عمدًا، يُضبط من السيرفر فقط.
                // is_active يُضبط صراحة لأن قيمة default في قاعدة البيانات
                // لا تنعكس على الموديل الموجود في الذاكرة بعد create()
                // (خلافًا سيؤدي لرفض الحساب الجديد باعتباره "موقوفًا").
                $user->forceFill(['role' => 'student', 'is_active' => true])->save();
            }
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['هذا الحساب موقوف. تواصل مع إدارة المنصة.'],
            ]);
        }

        Auth::login($user, remember: true);
        // مسار الـ callback يعمل ضمن web middleware فالجلسة موجودة دائمًا هنا.
        request()->session()->regenerate();

        return $user;
    }
}
