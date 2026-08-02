<?php

namespace App\Domains\Auth\Services;

use App\Domains\Auth\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthService
{
    /**
     * تسجيل مستخدم جديد بإيميل وكلمة سر
     * الدور دائمًا "student" افتراضيًا — لا يُقرأ من الطلب أبدًا
     */
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // يُشفَّر تلقائيًا عبر cast 'hashed' في Model
        ]);

        // role خارج $fillable عمدًا (حماية من تصعيد الصلاحيات عبر الطلبات)،
        // لذلك نضبطه من السيرفر فقط عبر forceFill
        $user->forceFill(['role' => 'student'])->save();

        event(new Registered($user));

        Auth::login($user);

        return $user;
    }

    /**
     * تسجيل الدخول بإيميل وكلمة سر
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(array $credentials): User
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! $user->password || ! Hash::check($credentials['password'], $user->password)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة.'],
            ]);
        }

        Auth::login($user, remember: true);

        return $user;
    }

    /**
     * تسجيل الخروج وإبطال الجلسة الحالية
     */
    public function logout(): void
    {
        Auth::guard('web')->logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    /**
     * إرسال رابط استرجاع كلمة السر
     */
    public function sendResetLink(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    /**
     * تنفيذ إعادة تعيين كلمة السر
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function resetPassword(array $data): void
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => ['تعذّر إعادة تعيين كلمة السر. تأكد من صلاحية الرابط.'],
            ]);
        }
    }
}
