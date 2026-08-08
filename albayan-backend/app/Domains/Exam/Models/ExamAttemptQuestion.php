<?php

namespace App\Domains\Exam\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $exam_attempt_id
 * @property int|null $bank_question_id
 * @property array $question_snapshot
 * @property int|null $selected_option_id
 * @property bool|null $selected_boolean
 * @property bool|null $is_correct
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ExamAttempt $attempt
 */
class ExamAttemptQuestion extends Model
{
    protected $fillable = [
        'exam_attempt_id',
        'bank_question_id',
        'question_snapshot',
        'selected_option_id',
        'selected_boolean',
        'is_correct',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'question_snapshot' => 'array',
            'selected_boolean' => 'boolean',
            'is_correct' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    /**
     * الإجابة الصحيحة المُخزَّنة داخل الـ snapshot (للسؤال صح/خطأ).
     */
    public function snapshotCorrectBoolean(): ?bool
    {
        return $this->question_snapshot['correct_boolean'] ?? null;
    }

    /**
     * معرّف الخيار الصحيح المُخزَّن داخل الـ snapshot (لسؤال متعدد).
     */
    public function snapshotCorrectOptionId(): ?int
    {
        return $this->question_snapshot['correct_option_id'] ?? null;
    }
}
