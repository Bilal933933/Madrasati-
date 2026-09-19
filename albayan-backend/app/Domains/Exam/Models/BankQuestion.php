<?php

namespace App\Domains\Exam\Models;

use App\Domains\Lesson\Models\Lesson;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $lesson_id
 * @property string $type
 * @property string $content
 * @property string|null $explanation
 * @property bool|null $correct_answer
 * @property string $difficulty
 * @property bool $is_active
 * @property string|null $model_answer
 * @property array|null $accepted_answers
 * @property bool $case_sensitive
 * @property array|null $rubric
 * @property float|null $correct_value
 * @property float $tolerance
 * @property string|null $units
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Lesson $lesson
 * @property-read Collection<int, BankQuestionOption> $options
 */
class BankQuestion extends Model
{
    protected $fillable = [
        'lesson_id',
        'type',
        'content',
        'explanation',
        'correct_answer',
        'difficulty',
        'is_active',
        'model_answer',
        'accepted_answers',
        'case_sensitive',
        'rubric',
        'correct_value',
        'tolerance',
        'units',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'correct_answer' => 'boolean',
            'accepted_answers' => 'array',
            'case_sensitive' => 'boolean',
            'rubric' => 'array',
            'correct_value' => 'decimal:6',
            'tolerance' => 'decimal:6',
        ];
    }

    public function trueFalseAnswer(): ?bool
    {
        return $this->correct_answer;
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(BankQuestionOption::class)->orderBy('sort_order');
    }

    public function isMcq(): bool
    {
        return $this->type === 'mcq';
    }

    public function isTrueFalse(): bool
    {
        return $this->type === 'true_false';
    }

    public function isShortAnswer(): bool
    {
        return $this->type === 'short_answer';
    }

    public function isEssay(): bool
    {
        return $this->type === 'essay';
    }

    public function isNumeric(): bool
    {
        return $this->type === 'numeric';
    }

    public function isAiGraded(): bool
    {
        return in_array($this->type, ['short_answer', 'essay', 'numeric'], true);
    }

    public function isDeterministic(): bool
    {
        return in_array($this->type, ['mcq', 'true_false'], true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
