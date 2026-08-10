<?php

namespace App\Domains\Lesson\Models;

use App\Domains\Assessment\Models\Assessment;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Lesson\Enums\BlockKind;
use App\Domains\Progress\Models\LessonCompletion;
use App\Support\ClearsExploreCache;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property string|null $slug
 * @property string|null $summary
 * @property array<int, string>|null $learning_objectives
 * @property string|null $image
 * @property string|null $video
 * @property string|null $icon
 * @property string|null $color
 * @property int $sort_order
 * @property int|null $month_no
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Course $course
 * @property-read Collection<int, Paragraph> $paragraphs
 * @property-read int|null $paragraphs_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereIsPublished($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereSummary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lesson whereVideo($value)
 *
 * @mixin \Eloquent
 */
class Lesson extends Model
{
    use ClearsExploreCache;

    protected $fillable = [
        'course_id',
        'title',
        'slug',
        'summary',
        'learning_objectives',
        'image',
        'video',
        'icon',
        'color',
        'sort_order',
        'month_no',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'month_no' => 'integer',
            'is_published' => 'boolean',
            'learning_objectives' => 'array',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function paragraphs(): HasMany
    {
        return $this->hasMany(Paragraph::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(LessonBlock::class)->orderBy('sort_order')->orderBy('id');
    }

    public function completions(): HasMany
    {
        return $this->hasMany(LessonCompletion::class);
    }

    /**
     * الدروس المنشورة كاملًا عبر السلسلة التعليمية: الدرس ← المقرر ←
     * المادة ← الصف ← المرحلة (كلها is_published).
     */
    public function scopeFullyPublished(Builder $query): Builder
    {
        return $query
            ->where('is_published', true)
            ->whereHas('course', fn ($q) => $q->where('is_published', true)
                ->whereHas('subject', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('grade', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('stage', fn ($q4) => $q4->where('is_published', true)))));
    }

    /**
     * الدروس التي تحتوي كتلة فقرة واحدة على الأقل — أحد شرطي نافذة التجربة.
     */
    public function scopeHasParagraphBlock(Builder $query): Builder
    {
        return $query->whereHas('blocks', fn ($q) => $q->where('block_kind', BlockKind::Paragraph->value));
    }

    /**
     * الدروس التي تحتوي كتلة تقييم (قبلي/تكويني/ختامي) واحدة على الأقل — الشرط الثاني لنافذة التجربة.
     */
    public function scopeHasAssessmentBlock(Builder $query): Builder
    {
        return $query->whereHas('blocks', fn ($q) => $q->whereIn('block_kind', [
            BlockKind::PreAssessment->value,
            BlockKind::FormativeAssessment->value,
            BlockKind::FinalAssessment->value,
        ]));
    }
}
