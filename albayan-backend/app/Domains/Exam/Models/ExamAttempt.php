<?php

namespace App\Domains\Exam\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Exam\Enums\AttemptStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $blueprint_id
 * @property int $user_id
 * @property int $attempt_number
 * @property string $status
 * @property string $attempt_status
 * @property Carbon|null $started_at
 * @property Carbon|null $deadline_at
 * @property Carbon|null $submitted_at
 * @property Carbon|null $graded_at
 * @property bool $is_locked
 * @property int $total_questions
 * @property int $correct_count
 * @property float $total_score
 * @property float $max_score
 * @property float|null $percentage
 * @property float|null $score_percentage
 * @property bool|null $passed
 * @property string|null $grading_errors
 * @property string|null $grade_job_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ExamBlueprint $blueprint
 * @property-read User $user
 * @property-read Collection<int, ExamAttemptQuestion> $questions
 */
class ExamAttempt extends Model
{
    protected $fillable = [
        'blueprint_id',
        'user_id',
        'attempt_number',
        'status',
        'attempt_status',
        'started_at',
        'deadline_at',
        'submitted_at',
        'graded_at',
        'is_locked',
        'total_questions',
        'correct_count',
        'total_score',
        'max_score',
        'percentage',
        'score_percentage',
        'passed',
        'grading_errors',
        'grade_job_id',
    ];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'started_at' => 'datetime',
            'deadline_at' => 'datetime',
            'submitted_at' => 'datetime',
            'graded_at' => 'datetime',
            'total_questions' => 'integer',
            'correct_count' => 'integer',
            'total_score' => 'decimal:2',
            'max_score' => 'decimal:2',
            'percentage' => 'decimal:2',
            'score_percentage' => 'float',
            'passed' => 'boolean',
            'is_locked' => 'boolean',
        ];
    }

    public function blueprint(): BelongsTo
    {
        return $this->belongsTo(ExamBlueprint::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ExamAttemptQuestion::class)->orderBy('sort_order');
    }

    public function progress(): HasOne
    {
        return $this->hasOne(ExamProgress::class);
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isExpired(): bool
    {
        return $this->deadline_at !== null && $this->deadline_at->isPast();
    }

    public function isSubmitted(): bool
    {
        return $this->attempt_status === AttemptStatus::Submitted->value;
    }

    public function isGraded(): bool
    {
        return $this->attempt_status === AttemptStatus::Graded->value;
    }

    public function isLocked(): bool
    {
        return $this->is_locked;
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', 'in_progress')
            ->whereNotNull('deadline_at')
            ->where('deadline_at', '<', now());
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('attempt_status', $status);
    }
}
