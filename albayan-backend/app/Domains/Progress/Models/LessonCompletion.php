<?php

namespace App\Domains\Progress\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Lesson\Models\Lesson;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * سجل تقدّم الطالب في درس — بدءًا وإكمالًا.
 *
 * سجل واحد لكل (طالب، درس): يسجّل `started_at` أول مرة يُفتح فيها الدرس،
 * و`completed_at` عند إنهائه. تُشتق منه حالات المواد والمقررات.
 *
 * @property int $id
 * @property int $user_id
 * @property int $lesson_id
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Lesson $lesson
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion whereLessonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LessonCompletion whereUserId($value)
 *
 * @mixin \Eloquent
 */
class LessonCompletion extends Model
{
    protected $fillable = [
        'user_id',
        'lesson_id',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * سجلات مستخدم واحد — يقبل الموديل أو المعرّف مباشرة.
     */
    public function scopeForUser(Builder $query, User|int $user): Builder
    {
        return $query->where('user_id', $user instanceof User ? $user->id : $user);
    }

    /**
     * السجلات المكتملة فقط (completed_at معبأة).
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->whereNotNull('completed_at');
    }

    /**
     * سجلات قائمة دروس محددة.
     *
     * @param  array<int, int>|Collection<int, int>  $lessonIds
     */
    public function scopeInLessons(Builder $query, array|Collection $lessonIds): Builder
    {
        return $query->whereIn('lesson_id', $lessonIds);
    }
}
