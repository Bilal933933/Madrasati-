<?php

namespace App\Domains\Exam\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Exam\Models\ExamBlueprint;
use Illuminate\Database\Eloquent\Collection;

/**
 * منطق تعريفات الامتحانات (Blueprints) — واجهة موحدة تجمع استعلامات
 * النطاق (قواعد النطاق في BlueprintScopeRules، وحلّ الدروس في
 * BlueprintLessonResolver). التوقيعات العامة ثابتة لكي لا تتأثر الجهات المستهلكة.
 */
class ExamBlueprintService
{
    public function __construct(
        private readonly BlueprintScopeRules $scopeRules,
        private readonly BlueprintLessonResolver $scopeResolver,
    ) {}

    public function blueprints(?string $examType = null, bool $activeOnly = false): Collection
    {
        return ExamBlueprint::query()
            ->when($examType, fn ($q) => $q->where('exam_type', $examType))
            ->when($activeOnly, fn ($q) => $q->where('is_active', true))
            ->with(['lesson', 'course', 'subject', 'grade', 'stage'])
            ->orderByDesc('id')
            ->get();
    }

    /**
     * امتحانات الطالب — النشطة فقط وضمن صفّه الدراسي (من ملفه الأكاديمي).
     *
     * كل نوع امتحان يُحصر في صف واحد عبر السلسلة التعليمية:
     *   lesson   → lesson → course → subject
     *   unit     → course → subject
     *   monthly / semester → subject
     *   full     → grade_id أو stage_id
     */
    public function blueprintsForUser(User $user, bool $activeOnly = false): Collection
    {
        return ExamBlueprint::query()
            ->when($activeOnly, fn ($q) => $q->where('is_active', true))
            ->forStudent($user)
            ->with([
                'lesson.course.subject',
                'course.subject',
                'subject',
                'grade',
                'stage',
            ])
            ->orderByDesc('id')
            ->get();
    }

    /**
     * هل النطاق الصفّي لهذا الامتحان يخصّ صف/مرحلة الطالب؟
     */
    public function belongsToStudentGrade(
        ExamBlueprint $blueprint,
        int $gradeId,
        ?int $stageId
    ): bool {
        // الامتحان الشامل: مقسوم على صف أو على مرحلة كاملة
        if ($blueprint->exam_type === 'full') {
            if ($blueprint->stage_id !== null) {
                return $stageId !== null && $blueprint->stage_id === $stageId;
            }

            return $blueprint->grade_id === $gradeId;
        }

        $blueprintGradeId = match ($blueprint->exam_type) {
            'lesson' => $blueprint->lesson?->course?->subject?->grade_id,
            'unit' => $blueprint->course?->subject?->grade_id,
            'monthly', 'semester' => $blueprint->subject?->grade_id,
            default => null,
        };

        return $blueprintGradeId === $gradeId;
    }

    public function findBlueprint(int $id): ExamBlueprint
    {
        return ExamBlueprint::with(['lesson', 'course', 'subject', 'grade', 'stage'])->findOrFail($id);
    }

    /**
     * الامتحان النشط من نوع «درس» المرتبط بهذا الدرس تحديدًا — يُعرض في شاشة
     * نهاية الدرس («عرض اختبار الدرس») إن وُجد، وإلا null.
     */
    public function activeLessonExam(int $lessonId): ?ExamBlueprint
    {
        return ExamBlueprint::query()
            ->where('exam_type', 'lesson')
            ->where('lesson_id', $lessonId)
            ->where('is_active', true)
            ->first();
    }

    /**
     * التحقق الصارم من النطاق: حسب exam_type يُفرض إملاء الأعمدة الصحيحة
     * وعدم وجود زيادات خاطئة؛ ثم يُخزَّن blueprint.
     */
    public function create(array $data): ExamBlueprint
    {
        $this->scopeRules->assertValidScope($data);

        return ExamBlueprint::create($this->scopeRules->normalizeScope($data));
    }

    public function update(int $id, array $data): ExamBlueprint
    {
        $blueprint = ExamBlueprint::findOrFail($id);

        // عند التحديث يرم admin كامل النطاق + النوع.
        $data['exam_type'] = $data['exam_type'] ?? $blueprint->exam_type;
        $this->scopeRules->assertValidScope($data, $id);

        $blueprint->update($this->scopeRules->normalizeScope($data));

        return $blueprint->load(['lesson', 'subject', 'grade', 'stage']);
    }

    public function delete(int $id): void
    {
        ExamBlueprint::findOrFail($id)->delete();
    }

    /**
     * قائمة دروس النطاق التي يغطيها blueprint — تُفوض إلى حلال النطاق.
     */
    public function scopeLessons(ExamBlueprint $blueprint): Collection
    {
        return $this->scopeResolver->scopeLessons($blueprint);
    }
}
