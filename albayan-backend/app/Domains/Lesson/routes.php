<?php

use App\Domains\Lesson\Http\Controllers\Admin\LessonController as AdminLessonController;
use App\Domains\Lesson\Http\Controllers\Admin\ParagraphController as AdminParagraphController;
use App\Domains\Lesson\Http\Controllers\LessonController;
use App\Domains\Lesson\Http\Controllers\ParagraphController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات دومين الدرس (Lesson Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

// مسارات إدارية — تتطلب تسجيل دخول + دور admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('lessons/next-order', [AdminLessonController::class, 'nextOrder']);
    Route::apiResource('lessons', AdminLessonController::class);
    Route::get('paragraphs/next-order', [AdminParagraphController::class, 'nextOrder']);
    Route::apiResource('paragraphs', AdminParagraphController::class);
});

// مسارات عرض عام لأي مستخدم مسجّل — منشور فقط، عبر slug
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{slug}', [LessonController::class, 'show']);
    Route::get('/paragraphs', [ParagraphController::class, 'index']);
    Route::get('/paragraphs/{slug}', [ParagraphController::class, 'show']);
});
