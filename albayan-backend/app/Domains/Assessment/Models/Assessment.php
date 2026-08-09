<?php

namespace App\Domains\Assessment\Models;

use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Models\Paragraph;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $lesson_id
 * @property int|null $paragraph_id
 * @property string $type
 * @property string|null $title
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Lesson $lesson
 * @property-read Paragraph|null $paragraph
 * @property-read Collection<int, Question> $questions
 * @property-read int|null $questions_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereLessonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereParagraphId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Assessment whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Assessment extends Model
{
    protected $fillable = [
        'lesson_id',
        'paragraph_id',
        'type',
        'title',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function paragraph(): BelongsTo
    {
        return $this->belongsTo(Paragraph::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * التقييمات التابعة لدرس منشور بالكامل عبر السلسلة التعليمية
     * (الدرس ← المقرر ← المادة ← الصف ← المرحلة).
     */
    public function scopeWithinPublishedLesson(Builder $query): Builder
    {
        return $query->whereHas('lesson', fn ($q) => $q->fullyPublished());
    }
}
