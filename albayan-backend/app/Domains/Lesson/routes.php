<?php

use App\Domains\Lesson\Http\Controllers\Admin\LessonBlockController as AdminLessonBlockController;
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

    // كتل رحلة الدرس (محرر الرحلة)
    Route::get('lessons/{lesson}/blocks', [AdminLessonBlockController::class, 'index']);
    Route::post('lessons/{lesson}/blocks', [AdminLessonBlockController::class, 'store']);
    Route::post('lessons/{lesson}/blocks/reorder', [AdminLessonBlockController::class, 'reorder']);
    Route::patch('lesson-blocks/{lessonBlock}', [AdminLessonBlockController::class, 'update']);
    Route::delete('lesson-blocks/{lessonBlock}', [AdminLessonBlockController::class, 'destroy']);
});

// مسارات عرض عام لأي مستخدم مسجّل — منشور فقط، عبر slug
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{slug}', [LessonController::class, 'show']);
    Route::get('/paragraphs', [ParagraphController::class, 'index']);
    Route::get('/paragraphs/{slug}', [ParagraphController::class, 'show']);
});
