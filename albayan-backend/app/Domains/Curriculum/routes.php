<?php

use App\Domains\Curriculum\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Domains\Curriculum\Http\Controllers\Admin\GradeController as AdminGradeController;
use App\Domains\Curriculum\Http\Controllers\Admin\SectionController as AdminSectionController;
use App\Domains\Curriculum\Http\Controllers\Admin\StageController as AdminStageController;
use App\Domains\Curriculum\Http\Controllers\Admin\SubjectController as AdminSubjectController;
use App\Domains\Curriculum\Http\Controllers\Admin\UploadController;
use App\Domains\Curriculum\Http\Controllers\CourseController;
use App\Domains\Curriculum\Http\Controllers\GradeController;
use App\Domains\Curriculum\Http\Controllers\SectionController;
use App\Domains\Curriculum\Http\Controllers\StageController;
use App\Domains\Curriculum\Http\Controllers\SubjectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات دومين المنهج (Curriculum Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

// مسارات إدارية — تتطلب تسجيل دخول + دور admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('stages/next-order', [AdminStageController::class, 'nextOrder']);
    Route::get('grades/next-order', [AdminGradeController::class, 'nextOrder']);
    Route::get('subjects/next-order', [AdminSubjectController::class, 'nextOrder']);
    Route::get('sections/next-order', [AdminSectionController::class, 'nextOrder']);
    Route::get('courses/next-order', [AdminCourseController::class, 'nextOrder']);
    Route::post('uploads/image', [UploadController::class, 'store']);

    Route::apiResource('stages', AdminStageController::class);
    Route::apiResource('grades', AdminGradeController::class);
    Route::apiResource('subjects', AdminSubjectController::class);
    Route::apiResource('sections', AdminSectionController::class);
    Route::apiResource('courses', AdminCourseController::class);
});

// مسارات عرض عام لأي مستخدم مسجّل — منشور فقط، عبر slug
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/stages', [StageController::class, 'index']);
    Route::get('/stages/{slug}', [StageController::class, 'show']);
    Route::get('/grades', [GradeController::class, 'index']);
    Route::get('/grades/{slug}', [GradeController::class, 'show']);
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{slug}', [SubjectController::class, 'show']);
    Route::get('/sections', [SectionController::class, 'index']);
    Route::get('/sections/{slug}', [SectionController::class, 'show']);
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);
});
