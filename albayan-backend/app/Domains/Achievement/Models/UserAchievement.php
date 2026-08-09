<?php

namespace App\Domains\Achievement\Models;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * صلة الطالب بالوسم المفتوح — تُنشأ عند استيفاء العتبة فقط (قيد فريد).
 *
 * @property int $id
 * @property int $user_id
 * @property int $achievement_id
 * @property Carbon $unlocked_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Achievement $achievement
 */
class UserAchievement extends Model
{
    protected $fillable = [
        'user_id',
        'achievement_id',
        'unlocked_at',
    ];

    protected function casts(): array
    {
        return [
            'unlocked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }
}
