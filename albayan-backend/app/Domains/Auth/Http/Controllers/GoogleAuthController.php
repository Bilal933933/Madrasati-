<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Domains\Auth\Services\GoogleAuthService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
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
        try {
            return Socialite::driver('google')
                ->stateless()
                ->redirect();
        } catch (\Throwable $e) {
            // غالبًا غياب GOOGLE_CLIENT_ID/SECRET في .env — نعيد للفرونت بدل 500
            Log::warning('Google redirect failed', ['message' => $e->getMessage()]);

            return redirect(config('app.frontend_url').'/login?error=google_failed');
        }
    }

    /**
     * GET /auth/google/callback
     * يستقبل رد جوجل، ينشئ/يربط الحساب، ثم يوجّه المستخدم للفرونت
     */
    public function callback()
    {
        $frontend = config('app.frontend_url');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $this->googleAuthService->findOrCreateFromGoogle($googleUser);
        } catch (ValidationException $e) {
            // حساب موقوف — نعيد للفرونت برسالة واضحة بدل صفحة 500
            return redirect($frontend.'/login?error=account_suspended');
        } catch (\Throwable $e) {
            // رفض التفويض من جوجل أو غياب الإعدادات — لا نكشف التفاصيل للعميل
            Log::warning('Google callback failed', ['message' => $e->getMessage()]);

            return redirect($frontend.'/login?error=google_failed');
        }

        // بما أننا نستخدم Sanctum SPA Cookie Session، لا نحتاج تمرير Token في الرابط
        // الكوكي HttpOnly تم ضبطها بالفعل بعد Auth::login داخل الـ Service
        return redirect($frontend.'/auth/callback');
    }
}
