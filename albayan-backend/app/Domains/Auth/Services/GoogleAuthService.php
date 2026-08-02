<?php

namespace App\Domains\Auth\Services;

use App\Domains\Auth\Models\User;
use Illuminate\Support\Facades\Auth;
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

                // role خارج $fillable عمدًا، يُضبط من السيرفر فقط
                $user->forceFill(['role' => 'student'])->save();
            }
        }

        Auth::login($user, remember: true);

        return $user;
    }
}
