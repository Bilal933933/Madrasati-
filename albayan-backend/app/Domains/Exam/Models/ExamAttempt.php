<?php

namespace App\Domains\Exam\Models;

use App\Domains\Auth\Models\User;
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
 * @property Carbon|null $started_at
 * @property Carbon|null $deadline_at
 * @property Carbon|null $submitted_at
 * @property int $total_questions
 * @property int $correct_count
 * @property float|null $score_percentage
 * @property bool|null $passed
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
        'started_at',
        'deadline_at',
        'submitted_at',
        'total_questions',
        'correct_count',
        'score_percentage',
        'passed',
    ];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'started_at' => 'datetime',
            'deadline_at' => 'datetime',
            'submitted_at' => 'datetime',
            'total_questions' => 'integer',
            'correct_count' => 'integer',
            'score_percentage' => 'float',
            'passed' => 'boolean',
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
}
