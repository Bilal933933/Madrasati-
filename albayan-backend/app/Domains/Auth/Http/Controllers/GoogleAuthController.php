<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Domains\Auth\Services\GoogleAuthService;
use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(private readonly GoogleAuthService $googleAuthService) {}

    /**
     * GET /auth/google/redirect
     * يوجّه المستخدم إلى صفحة اختيار حساب جوجل
     */
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * GET /auth/google/callback
     * يستقبل رد جوجل، ينشئ/يربط الحساب، ثم يوجّه المستخدم للفرونت
     */
    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $this->googleAuthService->findOrCreateFromGoogle($googleUser);

        // بما أننا نستخدم Sanctum SPA Cookie Session، لا نحتاج تمرير Token في الرابط
        // الكوكي HttpOnly تم ضبطها بالفعل بعد Auth::login داخل الـ Service
        return redirect(config('app.frontend_url').'/auth/callback');
    }
}
