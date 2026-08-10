<?php

use App\Domains\Progress\Http\Controllers\StudentCompletedLessonsController;
use App\Domains\Progress\Http\Controllers\StudentCourseController;
use App\Domains\Progress\Http\Controllers\StudentLessonProgressController;
use App\Domains\Progress\Http\Controllers\StudentSubjectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات دومين التقدم (Progress Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

// تقدّم الطالب — للمستخدم المسجّل فقط: تسجيل بدء/إكمال الدروس + صفحة المادة.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('student/lessons/{slug}/start', [StudentLessonProgressController::class, 'start']);
    Route::post('student/lessons/{slug}/complete', [StudentLessonProgressController::class, 'complete']);
    Route::get('student/completed-lessons', [StudentCompletedLessonsController::class, 'index']);
    Route::get('student/subjects/{slug}', [StudentSubjectController::class, 'show']);
    Route::get('student/courses/{slug}', [StudentCourseController::class, 'show']);
});
