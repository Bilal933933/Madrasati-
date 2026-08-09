<?php

namespace App\Domains\Achievement\Http\Controllers;

use App\Domains\Achievement\Services\AchievementService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * إنجازات الطالب — القائمة الكاملة مع التقدم وحالة الفتح.
 */
class StudentAchievementController extends Controller
{
    public function __construct(private readonly AchievementService $achievementService) {}

    /**
     * جميع الإنجازات المتاحة للطالب مع تقدمه وحالة كل وسم.
     *
     * @response { "data": { "id": 1, "key": "first-lesson", "metric": "lessons_completed", "metric_label": "دروس مكتملة", "threshold": 1, "progress": 1, "title": "الخطوة الأولى", "description": "أكملت أول درس لك.", "icon": "Sprout", "unlocked": true, "unlocked_at": "2026-08-09T..." }[] }
     */
    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->achievementService->snapshot($request->user()),
        ]);
    }
}
