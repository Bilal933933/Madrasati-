<?php

namespace App\Domains\Lesson\Models;

use App\Domains\Assessment\Models\Assessment;
use App\Support\ClearsExploreCache;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * كتلة داخل رحلة تعلم الدرس — تخزن الترتيب والعرض فقط، لا المحتوى.
 *
 * @property int $id
 * @property int $lesson_id
 * @property string $block_kind
 * @property int|null $paragraph_id
 * @property int|null $assessment_id
 * @property int $sort_order
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Lesson $lesson
 * @property-read Paragraph|null $paragraph
 * @property-read Assessment|null $assessment
 *
 * @method static Builder<static>|LessonBlock newModelQuery()
 * @method static Builder<static>|LessonBlock newQuery()
 * @method static Builder<static>|LessonBlock query()
 * @method static Builder<static>|LessonBlock whereAssessmentId($value)
 * @method static Builder<static>|LessonBlock whereBlockKind($value)
 * @method static Builder<static>|LessonBlock whereCreatedAt($value)
 * @method static Builder<static>|LessonBlock whereId($value)
 * @method static Builder<static>|LessonBlock whereIsPublished($value)
 * @method static Builder<static>|LessonBlock whereLessonId($value)
 * @method static Builder<static>|LessonBlock whereParagraphId($value)
 * @method static Builder<static>|LessonBlock whereSortOrder($value)
 * @method static Builder<static>|LessonBlock whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class LessonBlock extends Model
{
    use ClearsExploreCache;

    protected $fillable = [
        'lesson_id',
        'block_kind',
        'paragraph_id',
        'assessment_id',
        'sort_order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_published' => 'boolean',
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

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }
}
