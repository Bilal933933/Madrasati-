<?php

namespace App\Domains\Curriculum\Models;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * سياق تصفح الطالب — آخر مادة استكشفها (يُستنتج منها المرحلة/الصف/الفصل عبر العلاقات).
 *
 * @property int $id
 * @property int $user_id
 * @property int|null $last_subject_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Subject|null $lastSubject
 *
 * @mixin \Eloquent
 */
class UserContext extends Model
{
    protected $fillable = [
        'user_id',
        'last_subject_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lastSubject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
