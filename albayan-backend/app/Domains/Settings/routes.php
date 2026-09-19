<?php

use App\Domains\Settings\Http\Controllers\Admin\SettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات إعدادات المنصة (Settings Routes)
|--------------------------------------------------------------------------
| تُحمَّل عبر require من routes/api.php
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('settings', [SettingsController::class, 'index']);
    Route::put('settings', [SettingsController::class, 'update']);
});
