<?php

namespace App\Domains\Exam\Models;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * تقدم الطالب داخل محاولة امتحان — صف واحد لكل محاولة (upsert).
 *
 * @property int $id
 * @property int $user_id
 * @property int $exam_attempt_id
 * @property int $current_index
 * @property array<int, int>|null $flagged_question_ids
 * @property-read ExamAttempt $attempt
 * @property-read User $user
 */
class ExamProgress extends Model
{
    protected $fillable = [
        'user_id',
        'exam_attempt_id',
        'current_index',
        'flagged_question_ids',
    ];

    protected function casts(): array
    {
        return [
            'current_index' => 'integer',
            'flagged_question_ids' => 'array',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
