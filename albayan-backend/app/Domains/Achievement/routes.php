<?php

use App\Domains\Achievement\Http\Controllers\Admin\AchievementController as AdminAchievementController;
use App\Domains\Achievement\Http\Controllers\StudentAchievementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات دومين الإنجازات (Achievement Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

// مسارات إدارية — تتطلب تسجيل دخول + دور admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('achievements', AdminAchievementController::class);
});

// مسارات الطالب — أي مستخدم مسجّل
Route::middleware('auth:sanctum')->group(function () {
    Route::get('achievements', [StudentAchievementController::class, 'index']);
});
