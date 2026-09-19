<?php

use App\Domains\AdminUser\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات إدارة المستخدمين (AdminUser Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

// مسارات إدارية — تتطلب تسجيل دخول + دور admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::patch('users/{user}/role', [UserController::class, 'updateRole']);
    Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
});
