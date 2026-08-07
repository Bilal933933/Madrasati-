<?php

use App\Domains\Curriculum\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Domains\Curriculum\Http\Controllers\Admin\GradeController as AdminGradeController;
use App\Domains\Curriculum\Http\Controllers\Admin\SemesterController as AdminSemesterController;
use App\Domains\Curriculum\Http\Controllers\Admin\StageController as AdminStageController;
use App\Domains\Curriculum\Http\Controllers\Admin\SubjectController as AdminSubjectController;
use App\Domains\Curriculum\Http\Controllers\CourseController;
use App\Domains\Curriculum\Http\Controllers\GradeController;
use App\Domains\Curriculum\Http\Controllers\Public\ExploreController;
use App\Domains\Curriculum\Http\Controllers\SemesterController;
use App\Domains\Curriculum\Http\Controllers\StageController;
use App\Domains\Curriculum\Http\Controllers\StudentHomeController;
use App\Domains\Curriculum\Http\Controllers\StudentProfileController;
use App\Domains\Curriculum\Http\Controllers\SubjectController;
use App\Http\Controllers\Admin\UploadController;
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
    Route::get('semesters/next-order', [AdminSemesterController::class, 'nextOrder']);
    Route::get('subjects/next-order', [AdminSubjectController::class, 'nextOrder']);
    Route::get('courses/next-order', [AdminCourseController::class, 'nextOrder']);
    Route::post('uploads/image', [UploadController::class, 'store']);

    Route::apiResource('stages', AdminStageController::class);
    Route::apiResource('grades', AdminGradeController::class);
    Route::apiResource('semesters', AdminSemesterController::class);
    Route::apiResource('subjects', AdminSubjectController::class);
    Route::apiResource('courses', AdminCourseController::class);
});

// مسارات عرض عام لأي مستخدم مسجّل — منشور فقط، عبر slug
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/stages', [StageController::class, 'index']);
    Route::get('/stages/{slug}', [StageController::class, 'show']);
    Route::get('/grades', [GradeController::class, 'index']);
    Route::get('/grades/{slug}', [GradeController::class, 'show']);
    Route::get('/semesters', [SemesterController::class, 'index']);
    Route::get('/semesters/{semester}', [SemesterController::class, 'show']);
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{slug}', [SubjectController::class, 'show']);
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);
});

// استكشاف هرمي عام — للزائر (بلا تسجيل) حسب تجربة الزائر
Route::prefix('explore')->group(function () {
    Route::get('stages', [ExploreController::class, 'stages']);
    Route::get('stages/{stageKey}/grades', [ExploreController::class, 'grades']);
    Route::get('stages/{stageKey}/grades/{gradeKey}/semesters', [ExploreController::class, 'semesters']);
    Route::get('stages/{stageKey}/grades/{gradeKey}/semesters/{semesterKey}/subjects', [ExploreController::class, 'subjects']);
    Route::get('subjects/{slug}', [ExploreController::class, 'subject']);
});

// سياق التصفح — للمستخدم المسجّل فقط: آخر مادة استكشفها (تُخزَّن في student_profiles)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/user-context', [StudentProfileController::class, 'updateLastSubject']);
});

// بيت الطالب — للمستخدم المسجّل فقط: مواد صفه وفصله مرتبة بأولويته
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/student/home', StudentHomeController::class);
    Route::post('/student/profile', [StudentProfileController::class, 'update']);
});
