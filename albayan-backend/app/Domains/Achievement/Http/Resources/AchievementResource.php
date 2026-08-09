<?php

namespace App\Domains\Achievement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * تعريف الإنجاز — تُستخدم في الإدارة وفي قائمة الأوسمة المفتوحة بالاستجابات.
 */
class AchievementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'metric' => $this->metric->value,
            'metric_label' => $this->metric->label(),
            'threshold' => $this->threshold,
            'title' => $this->title,
            'description' => $this->description,
            'icon' => $this->icon,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}
