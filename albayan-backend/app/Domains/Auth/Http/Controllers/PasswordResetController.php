<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Http\Requests\ForgotPasswordRequest;
use App\Domains\Auth\Http\Requests\ResetPasswordRequest;
use App\Domains\Auth\Services\AuthService;

class PasswordResetController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    /**
     * POST /api/forgot-password
     */
    public function sendResetLink(ForgotPasswordRequest $request)
    {
        $this->authService->sendResetLink($request->validated('email'));

        return response()->json([
            'message' => 'تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك الإلكتروني.',
        ]);
    }

    /**
     * POST /api/reset-password
     */
    public function reset(ResetPasswordRequest $request)
    {
        $this->authService->resetPassword($request->validated());

        return response()->json([
            'message' => 'تم تغيير كلمة السر بنجاح، يمكنك تسجيل الدخول الآن.',
        ]);
    }
}
