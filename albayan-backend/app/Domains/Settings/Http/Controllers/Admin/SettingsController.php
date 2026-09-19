<?php

namespace App\Domains\Settings\Http\Controllers\Admin;

use App\Domains\Settings\Http\Requests\UpdateSettingsRequest;
use App\Domains\Settings\Services\SettingsService;
use App\Http\Controllers\Controller;

/**
 * إعدادات المنصة العامة من لوحة الأدمن.
 */
class SettingsController extends Controller
{
    public function __construct(private readonly SettingsService $settingsService) {}

    /**
     * قراءة الإعدادات الحالية.
     */
    public function index()
    {
        return response()->json(['data' => $this->settingsService->all()]);
    }

    /**
     * تحديث الإعدادات — يُرفض أي مفتاح غير مسموح.
     */
    public function update(UpdateSettingsRequest $request)
    {
        $settings = $this->settingsService->update($request->validated());

        return response()->json([
            'data' => $settings,
            'message' => 'تم حفظ إعدادات المنصة بنجاح.',
        ]);
    }
}
