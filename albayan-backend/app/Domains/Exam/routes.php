<?php

use App\Domains\Exam\Http\Controllers\Admin\BankQuestionController as AdminBankQuestionController;
use App\Domains\Exam\Http\Controllers\Admin\ExamBlueprintController as AdminExamBlueprintController;
use App\Domains\Exam\Http\Controllers\StudentExamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات دومين الامتحانات (Exam Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

// مسارات إدارية — تتطلب تسجيل دخول + دور admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('bank-questions', AdminBankQuestionController::class);
    Route::apiResource('exam-blueprints', AdminExamBlueprintController::class);
});

// مسارات الطالب — أي مستخدم مسجّل
Route::middleware('auth:sanctum')->prefix('exams')->group(function () {
    Route::get('/', [StudentExamController::class, 'index']);
    Route::get('attempts/{attemptId}', [StudentExamController::class, 'showAttempt']);
    Route::put('attempts/{attemptId}/questions/{questionId}', [StudentExamController::class, 'saveAnswer']);
    Route::put('attempts/{attemptId}/progress', [StudentExamController::class, 'syncProgress']);
    Route::post('attempts/{attemptId}/submit', [StudentExamController::class, 'submit']);
    Route::get('{id}', [StudentExamController::class, 'show']);
    Route::get('{id}/attempts', [StudentExamController::class, 'myAttempts']);
    Route::post('{id}/start', [StudentExamController::class, 'start']);
});
