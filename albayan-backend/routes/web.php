<?php

use App\Domains\Auth\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات جوجل — تبقى في web.php وليس api.php
|--------------------------------------------------------------------------
| لأنها تعتمد على Redirect كامل للمتصفح (وليس طلب AJAX/Fetch)،
| ويجب أن تمر عبر web middleware group للاستفادة من إدارة الجلسة (Session)
| التي تُستخدم أيضًا كـ CSRF state داخل Socialite.
*/
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])
    ->name('auth.google.redirect');

Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
    ->name('auth.google.callback');

/*
|--------------------------------------------------------------------------
| مسار رابط إعادة تعيين كلمة السر — إعادة توجيه للفرونت
|--------------------------------------------------------------------------
| إشعار ResetPassword الافتراضي في Laravel يبني الرابط عبر route('password.reset')،
| لذلك ننشئ route يعيد التوجيه إلى صفحة الفرونت مع token و email كبارامترات.
*/
Route::get('/reset-password/{token}', function (string $token) {
    return redirect(config('app.frontend_url').'/reset-password?token='.$token.'&email='.request('email'));
})->name('password.reset');
