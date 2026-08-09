<?php

namespace App\Domains\Achievement\Models;

use App\Domains\Achievement\Enums\AchievementMetric;
use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property AchievementMetric $metric
 * @property int $threshold
 * @property string $title
 * @property string|null $description
 * @property string|null $icon
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, User> $users
 */
class Achievement extends Model
{
    protected $fillable = [
        'key',
        'metric',
        'threshold',
        'title',
        'description',
        'icon',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'metric' => AchievementMetric::class,
            'threshold' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_achievements',
        )->withPivot('unlocked_at')->withTimestamps();
    }
}
