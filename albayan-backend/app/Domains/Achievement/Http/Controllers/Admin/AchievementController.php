<?php

namespace App\Domains\Achievement\Http\Controllers\Admin;

use App\Domains\Achievement\Http\Requests\AchievementRequest;
use App\Domains\Achievement\Http\Resources\AchievementResource;
use App\Domains\Achievement\Services\AchievementAdminService;
use App\Http\Controllers\Controller;

/**
 * إدارة تعريفات الإنجازات (الأوسمة) — إضافة/تعديل/تعطيل/حذف.
 */
class AchievementController extends Controller
{
    public function __construct(private readonly AchievementAdminService $achievementService) {}

    /**
     * @response { "data": { "id": 1, "key": "first-lesson", "metric": "lessons_completed", "metric_label": "دروس مكتملة", "threshold": 1, "title": "الخطوة الأولى", "description": "أكملت أول درس لك.", "icon": "Sprout", "is_active": true, "sort_order": 0 }[] }
     */
    public function index()
    {
        return AchievementResource::collection($this->achievementService->all());
    }

    public function store(AchievementRequest $request)
    {
        $achievement = $this->achievementService->create($request->validated());

        return response()->json([
            'data' => new AchievementResource($achievement),
            'message' => 'تم إنشاء الإنجاز بنجاح.',
        ], 201);
    }

    public function show(int $id)
    {
        return new AchievementResource($this->achievementService->findOrFail($id));
    }

    public function update(AchievementRequest $request, int $id)
    {
        $achievement = $this->achievementService->update(
            $this->achievementService->findOrFail($id),
            $request->validated(),
        );

        return response()->json([
            'data' => new AchievementResource($achievement),
            'message' => 'تم تحديث الإنجاز بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->achievementService->delete($this->achievementService->findOrFail($id));

        return response()->json([
            'message' => 'تم حذف الإنجاز بنجاح.',
        ]);
    }
}
