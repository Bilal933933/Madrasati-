<?php

namespace App\Domains\Achievement\Services;

use App\Domains\Achievement\Models\Achievement;
use App\Domains\Achievement\Models\UserAchievement;
use App\Domains\Auth\Models\User;

/**
 * نظام الإنجازات (جانب الطالب) — يقيّم الأوسمة المستحقة عن الطالب
 * ويمنحها (متجانس) ويلخّصها للعرض. إدارة التعريفات مناطةٌ
 * بـ AchievementAdminService.
 */
class AchievementService
{
    public function __construct(private readonly AchievementEvaluator $evaluator) {}

    /**
     * يحسب الأوسمة الفعالة التي استوفت عتبتها ولم يُفتح بعد، ويمنحها ويرجعها.
     *
     * @return array<int, Achievement>
     */
    public function evaluateFor(User $user): array
    {
        $granted = $user->userAchievements()->pluck('achievement_id')->all();
        $new = [];

        foreach (Achievement::query()->where('is_active', true)->get() as $achievement) {
            if (in_array($achievement->id, $granted, true)) {
                continue;
            }

            if ($this->evaluator->value($user, $achievement->metric) < $achievement->threshold) {
                continue;
            }

            UserAchievement::create([
                'user_id' => $user->id,
                'achievement_id' => $achievement->id,
                'unlocked_at' => now(),
            ]);

            $new[] = $achievement;
        }

        return $new;
    }

    /**
     * خريطة تعريفات الإنجازات الفعالة مع تقدم الطالب وحالة الفتح — لصفحة إنجازاتي.
     *
     * @return array<int, array>
     */
    public function snapshot(User $user): array
    {
        $unlocked = $user->userAchievements()->get()->keyBy('achievement_id');

        return Achievement::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function (Achievement $achievement) use ($user, $unlocked) {
                $raw = $this->evaluator->value($user, $achievement->metric);

                return [
                    'id' => $achievement->id,
                    'key' => $achievement->key,
                    'metric' => $achievement->metric->value,
                    'metric_label' => $achievement->metric->label(),
                    'threshold' => $achievement->threshold,
                    'progress' => min($raw, $achievement->threshold),
                    'title' => $achievement->title,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'unlocked' => $unlocked->has($achievement->id),
                    'unlocked_at' => $unlocked->get($achievement->id)?->unlocked_at?->toISOString(),
                ];
            })
            ->all();
    }
}
