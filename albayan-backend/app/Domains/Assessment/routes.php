<?php

use App\Domains\Assessment\Http\Controllers\Admin\AssessmentController as AdminAssessmentController;
use App\Domains\Assessment\Http\Controllers\Admin\OptionController as AdminOptionController;
use App\Domains\Assessment\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Domains\Assessment\Http\Controllers\AssessmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات دومين التقييم (Assessment Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

// مسارات إدارية — تتطلب تسجيل دخول + دور admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('assessments/next-order', [AdminAssessmentController::class, 'nextOrder']);
    Route::apiResource('assessments', AdminAssessmentController::class);
    Route::get('questions/next-order', [AdminQuestionController::class, 'nextOrder']);
    Route::apiResource('questions', AdminQuestionController::class);
    Route::get('options/next-order', [AdminOptionController::class, 'nextOrder']);
    Route::apiResource('options', AdminOptionController::class);
});

// مسارات عرض عام لأي مستخدم مسجّل — منشور فقط
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/assessments', [AssessmentController::class, 'index']);
    Route::get('/assessments/{id}', [AssessmentController::class, 'show']);
});
