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
 * @property string|null $selected_text
 * @property array|null $ai_grade
 * @property float $score
 * @property bool $is_correct
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
        'selected_text',
        'ai_grade',
        'score',
        'is_correct',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'question_snapshot' => 'array',
            'selected_boolean' => 'boolean',
            'ai_grade' => 'array',
            'score' => 'decimal:2',
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

    /**
     * نموذج الإجابة من الـ snapshot (للأسئلة النصية).
     */
    public function snapshotModelAnswer(): ?string
    {
        return $this->question_snapshot['model_answer'] ?? null;
    }

    /**
     * معايير التقييم من الـ snapshot (للسؤال المقالي).
     */
    public function snapshotRubric(): ?array
    {
        return $this->question_snapshot['rubric'] ?? null;
    }

    /**
     * الإجابات البديلة المقبولة من الـ snapshot (للإجابة القصيرة).
     */
    public function snapshotAcceptedAnswers(): ?array
    {
        return $this->question_snapshot['accepted_answers'] ?? null;
    }

    /**
     * القيمة الصحيحة للسؤال الرقمي من الـ snapshot.
     */
    public function snapshotCorrectValue(): ?float
    {
        return $this->question_snapshot['correct_value'] ?? null;
    }

    /**
     * السماحية للسؤال الرقمي من الـ snapshot.
     */
    public function snapshotTolerance(): ?float
    {
        return $this->question_snapshot['tolerance'] ?? null;
    }

    /**
     * الوحدة للسؤال الرقمي من الـ snapshot.
     */
    public function snapshotUnits(): ?string
    {
        return $this->question_snapshot['units'] ?? null;
    }

    /**
     * نوع السؤال من الـ snapshot.
     */
    public function snapshotType(): ?string
    {
        return $this->question_snapshot['type'] ?? null;
    }

    /**
     * هل السؤال من النوع الذي يُصحح بالذكاء الاصطناعي؟
     */
    public function isAiGraded(): bool
    {
        $type = $this->snapshotType();

        return in_array($type, ['short_answer', 'essay', 'numeric'], true);
    }

    /**
     * هل السؤال من النوع الحتمي (mcq/true_false)؟
     */
    public function isDeterministic(): bool
    {
        $type = $this->snapshotType();

        return in_array($type, ['mcq', 'true_false'], true);
    }

    /**
     * هل انتهى تصحيح هذا السؤال (للتحقق من pending_manual)؟
     */
    public function isGraded(): bool
    {
        if ($this->isDeterministic()) {
            return $this->is_correct !== null;
        }

        return $this->ai_grade !== null;
    }

    /**
     * هل السؤال في انتظار مراجعة يدوية (فشل المساعد)؟
     */
    public function isPendingManual(): bool
    {
        if (! $this->isAiGraded()) {
            return false;
        }

        return isset($this->ai_grade['status']) && $this->ai_grade['status'] === 'pending_manual';
    }

    /**
     * الحصول على درجة السؤال (0-1 للأنواع الذكية، 0 أو 1 للحتمية).
     */
    public function getScore(): float
    {
        if ($this->isDeterministic()) {
            return $this->is_correct ? 1.0 : 0.0;
        }

        return $this->score ?? 0.0;
    }
}
