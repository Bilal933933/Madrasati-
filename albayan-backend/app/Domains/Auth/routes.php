<?php

use App\Domains\Auth\Http\Controllers\CurrentUserController;
use App\Domains\Auth\Http\Controllers\LoginController;
use App\Domains\Auth\Http\Controllers\LogoutController;
use App\Domains\Auth\Http\Controllers\PasswordResetController;
use App\Domains\Auth\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات دومين المصادقة (Auth Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
| كل هذه المسارات تمر عبر Sanctum SPA Middleware (statefulApi في bootstrap/app.php)
*/

// مسارات عامة (بدون تسجيل دخول)
Route::post('/register', RegisterController::class);
Route::post('/login', LoginController::class);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

// مسارات محمية (تتطلب تسجيل دخول)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', CurrentUserController::class);
    Route::post('/logout', LogoutController::class);
});
