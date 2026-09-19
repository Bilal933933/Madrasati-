<?php

use App\Domains\Analytics\Http\Controllers\Admin\AnalyticsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات إحصائيات الأدمن (Analytics Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('analytics/summary', [AnalyticsController::class, 'summary']);
});
