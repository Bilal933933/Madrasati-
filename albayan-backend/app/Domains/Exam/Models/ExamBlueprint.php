<?php

namespace App\Domains\Exam\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Models\Lesson;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $exam_type
 * @property string $title
 * @property string|null $description
 * @property int|null $lesson_id
 * @property int|null $course_id
 * @property int|null $subject_id
 * @property int|null $grade_id
 * @property int|null $stage_id
 * @property int|null $month_no
 * @property int $duration_minutes
 * @property int $attempts_allowed
 * @property int $easy_count
 * @property int $medium_count
 * @property int $hard_count
 * @property int $pass_threshold_percent
 * @property bool $show_review_after_submit
 * @property bool $is_active
 * @property bool $requires_completion
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Lesson|null $lesson
 * @property-read Course|null $course
 * @property-read Subject|null $subject
 * @property-read Grade|null $grade
 * @property-read Stage|null $stage
 * @property-read Collection<int, ExamAttempt> $attempts
 */
class ExamBlueprint extends Model
{
    protected $fillable = [
        'exam_type',
        'title',
        'description',
        'lesson_id',
        'course_id',
        'subject_id',
        'grade_id',
        'stage_id',
        'month_no',
        'duration_minutes',
        'attempts_allowed',
        'easy_count',
        'medium_count',
        'hard_count',
        'pass_threshold_percent',
        'show_review_after_submit',
        'is_active',
        'requires_completion',
    ];

    protected function casts(): array
    {
        return [
            'month_no' => 'integer',
            'duration_minutes' => 'integer',
            'attempts_allowed' => 'integer',
            'easy_count' => 'integer',
            'medium_count' => 'integer',
            'hard_count' => 'integer',
            'pass_threshold_percent' => 'integer',
            'show_review_after_submit' => 'boolean',
            'is_active' => 'boolean',
            'requires_completion' => 'boolean',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class, 'blueprint_id');
    }

    /**
     * قائمة الامتحانات ضمن صفّ/مرحلة الطالب (من ملفه الأكاديمي) — في SQL مباشرةً.
     *
     * التكافؤ عبر النطاقات الخمسة:
     *   full                → grade_id أو stage_id مباشرة
     *   lesson              → lesson → course → subject
     *   unit                → course → subject
     *   monthly / semester  → subject
     */
    public function scopeForStudent(Builder $query, User $user): Builder
    {
        $gradeId = $user->profile?->grade_id;
        $stageId = $user->profile?->grade?->stage_id;

        if ($gradeId === null) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function (Builder $q) use ($gradeId, $stageId) {
            $q->where(function (Builder $gradeScope) use ($gradeId) {
                $gradeScope->whereNotNull('grade_id')->where('grade_id', $gradeId);
            });

            if ($stageId !== null) {
                $q->orWhere(function (Builder $stageScope) use ($stageId) {
                    $stageScope->whereNotNull('stage_id')->where('stage_id', $stageId);
                });
            }

            $q->orWhereHas('lesson.course.subject', fn (Builder $s) => $s->where('grade_id', $gradeId))
                ->orWhereHas('course.subject', fn (Builder $s) => $s->where('grade_id', $gradeId))
                ->orWhereHas('subject', fn (Builder $s) => $s->where('grade_id', $gradeId));
        });
    }

    /**
     * نطاق النطاق (اسم الكيان المرتبط) — للتسمية في الواجهة.
     */
    public function scopeName(): ?string
    {
        return match ($this->exam_type) {
            'lesson' => $this->lesson?->title,
            'unit' => $this->course?->name,
            'monthly', 'semester' => $this->subject?->name,
            'full' => $this->grade?->name ?? $this->stage?->name,
            default => null,
        };
    }
}
