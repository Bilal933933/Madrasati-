<?php

namespace App\Domains\Achievement\Services;

use App\Domains\Achievement\Models\Achievement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

/**
 * إدارة تعريفات الإنجازات (الأوسمة) — CRUD خاص بالمشرف.
 * تقييم الأوسمة عن الطالب مناطٌ بـ AchievementService.
 */
class AchievementAdminService
{
    public function all(): Collection
    {
        return Achievement::query()->orderBy('sort_order')->get();
    }

    public function findOrFail(int $id): Achievement
    {
        return Achievement::query()->findOrFail($id);
    }

    public function create(array $data): Achievement
    {
        return Achievement::create($this->normalizeData($data));
    }

    public function update(Achievement $achievement, array $data): Achievement
    {
        $achievement->update($this->normalizeData($data, $achievement));

        return $achievement->fresh();
    }

    public function delete(Achievement $achievement): void
    {
        $achievement->delete();
    }

    /**
     * يضمن مفتاحًا فريدًا دائمًا — يولّد واحدًا آليًا إن تركته الإدارة فارغًا.
     */
    private function normalizeData(array $data, ?Achievement $achievement = null): array
    {
        $key = $data['key'] ?? null;

        if (blank($key)) {
            $key = 'ach_'.substr(Str::ulid()->toString(), 0, 16);
        }

        $data['key'] = $key;

        return $data;
    }
}
