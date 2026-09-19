<?php

namespace App\Domains\Analytics\Http\Controllers\Admin;

use App\Domains\Analytics\Services\AnalyticsService;
use App\Http\Controllers\Controller;

/**
 * لوحة إحصائيات الأدمن — مؤشرات عامة + نشاط شهري.
 */
class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analyticsService) {}

    /**
     * ملخص المؤشرات العامة.
     */
    public function summary()
    {
        return response()->json(['data' => $this->analyticsService->summary()]);
    }
}
