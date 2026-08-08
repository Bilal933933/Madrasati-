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
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'correct_answer' => 'boolean',
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

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
