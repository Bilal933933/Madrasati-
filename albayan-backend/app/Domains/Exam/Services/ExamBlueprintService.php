<?php

namespace App\Domains\Exam\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Lesson\Models\Lesson;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

/**
 * منطق تعريفات الامتحانات (Blueprints) ونطاقاتها الصارمة.
 */
class ExamBlueprintService
{
    /**
     * الأعمدة المسموحة لكل نوع امتحان — عمود واحد فقط يُشغَّل.
     */
    private const SCOPE_MAP = [
        'lesson' => ['lesson_id'],
        'unit' => ['course_id'],
        'monthly' => ['subject_id', 'month_no'],
        'semester' => ['subject_id'],
        'full' => ['grade_id'], // أو stage_id إن أُرسل — يُعالج أدناه
    ];

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
        $gradeId = $user->profile?->grade_id;
        $stageId = $user->profile?->grade?->stage_id;

        if ($gradeId === null) {
            return collect();
        }

        return ExamBlueprint::query()
            ->when($activeOnly, fn ($q) => $q->where('is_active', true))
            ->with([
                'lesson.course.subject',
                'course.subject',
                'subject',
                'grade',
                'stage',
            ])
            ->orderByDesc('id')
            ->get()
            ->filter(
                fn (ExamBlueprint $blueprint) => $this->belongsToStudentGrade(
                    $blueprint,
                    $gradeId,
                    $stageId
                )
            )
            ->values();
    }

    /**
     * هل النطاق الصفّي لهذا الامتحان يخصّ صف/مرحلة الطالب؟
     */
    private function belongsToStudentGrade(
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
     * التحقق الصارم من النطاق: حسب exam_type يُفرض إملاء الأعمدة الصحيحة
     * وعدم وجود زيادات خاطئة؛ ثم يُخزَّن blueprint.
     */
    public function create(array $data): ExamBlueprint
    {
        $this->assertValidScope($data);

        return ExamBlueprint::create($this->normalizeScope($data));
    }

    public function update(int $id, array $data): ExamBlueprint
    {
        $blueprint = ExamBlueprint::findOrFail($id);

        // عند التحديث يرم admin كامل النطاق + النوع.
        $data['exam_type'] = $data['exam_type'] ?? $blueprint->exam_type;
        $this->assertValidScope($data, $id);

        $blueprint->update($this->normalizeScope($data));

        return $blueprint->load(['lesson', 'subject', 'grade', 'stage']);
    }

    public function delete(int $id): void
    {
        ExamBlueprint::findOrFail($id)->delete();
    }

    /* ------------------------------------------------------------------ */

    /**
     * يفحص صلاحية النطاق (العمود الإلزامي + الأعمدة الممنوعة للنوع معهد).
     */
    private function assertValidScope(array $data, ?int $ignoreId = null): void
    {
        $examType = $data['exam_type'];

        if ($examType === 'full') {
            // نطاق شامل: إما grade_id أو stage_id
            if (empty($data['grade_id']) && empty($data['stage_id'])) {
                throw ValidationException::withMessages([
                    'grade_id' => 'الامتحان الشامل يتطلب تحديد صف أو مرحلة.',
                ]);
            }
        }

        $expectedScope = $this->scopeFieldsFor($examType);

        // 1) الحقل(الحقول) المحدد للنطاق مطلوب.
        foreach ($expectedScope as $field) {
            if (($data[$field] ?? null) === null) {
                throw ValidationException::withMessages([
                    $field => "امتحان النوع \"{$examType}\" يتطلب تحديد {$this->fieldLabel($field)}.",
                ]);
            }
        }

        // 2) أي حقل scope آخر (خارج صالح هذا النوع) يجب أن يكون غير محدد.
        $allScopeFields = ['lesson_id', 'course_id', 'subject_id', 'grade_id', 'stage_id', 'month_no'];

        foreach ($allScopeFields as $field) {
            if (! in_array($field, $expectedScope, true) && ! empty($data[$field])) {
                throw ValidationException::withMessages([
                    $field => "هذا الحقل غير مناسب لنوع الامتحان \"{$examType}\".",
                ]);
            }
        }

        // 3) مجموع الأسئلة يجب أن يزيد عن صفر.
        $total = ($data['easy_count'] ?? 0) + ($data['medium_count'] ?? 0) + ($data['hard_count'] ?? 0);
        if ($total <= 0) {
            throw ValidationException::withMessages([
                'easy_count' => 'يجب تحديد عدد أسئلة واحد على الأقل (سهل/متوسط/صعب).',
            ]);
        }
    }

    /**
     * الأعمدة المسموحة نوع الامتحان.
     */
    private function scopeFieldsFor(string $examType): array
    {
        return self::SCOPE_MAP[$examType] ?? ['lesson_id'];
    }

    private function fieldLabel(string $field): string
    {
        return match ($field) {
            'lesson_id' => 'درس',
            'course_id' => 'وحدة (مقرر)',
            'subject_id' => 'مادة',
            'grade_id' => 'صف',
            'stage_id' => 'مرحلة',
            'month_no' => 'الشهر',
            default => $field,
        };
    }

    /**
     * تطبيع البيانات قبل التخزين: إفراغ كل أعمدة النطاق غير ذات صلة بالنوع.
     */
    private function normalizeScope(array $data): array
    {
        $expectsMonth = $this->scopeFieldsFor($data['exam_type']) === ['subject_id', 'month_no'];

        return array_merge($data, [
            'month_no' => $expectsMonth ? ($data['month_no'] ?? null) : null,
            'lesson_id' => in_array('lesson_id', $this->scopeFieldsFor($data['exam_type']), true) ? $data['lesson_id'] : null,
            'course_id' => in_array('course_id', $this->scopeFieldsFor($data['exam_type']), true) ? $data['course_id'] : null,
            'subject_id' => in_array('subject_id', $this->scopeFieldsFor($data['exam_type']), true) ? $data['subject_id'] : null,
            'grade_id' => $data['exam_type'] === 'full' ? ($data['grade_id'] ?? $data['stage_id'] ?? null) : null,
            'stage_id' => $data['exam_type'] === 'full' ? ($data['stage_id'] ?? null) : null,
        ]);
    }

    /* ---------------------- نطاق الدرس (Scope Lessons) ---------------------- */

    /**
     * قائمة دروس النطاق التي يغطيها blueprint — مبنية على النوع وحما الرابط الصارم.
     */
    public function scopeLessons(ExamBlueprint $blueprint): Collection
    {
        $query = Lesson::query()->where('is_published', true);

        switch ($blueprint->exam_type) {
            case 'lesson':
                $query->where('id', $blueprint->lesson_id);
                break;
            case 'unit':
                $query->where('course_id', $blueprint->course_id);
                break;
            case 'monthly':
                $courseIds = Course::where('subject_id', $blueprint->subject_id)->pluck('id');
                $query->whereIn('course_id', $courseIds)->where('month_no', $blueprint->month_no);
                break;
            case 'semester':
                $courseIds = Course::where('subject_id', $blueprint->subject_id)->pluck('id');
                $query->whereIn('course_id', $courseIds);
                break;
            case 'full':
                $subjectIds = $this->scopeSubjectIds($blueprint);
                $courseIds = Course::whereIn('subject_id', $subjectIds)->pluck('id');
                $query->whereIn('course_id', $courseIds);
                break;
        }

        return $query->get();
    }

    /**
     * معرّفات المواد ضمن نطاق الامتحان الشامل (صف أو مرحلة).
     */
    private function scopeSubjectIds(ExamBlueprint $blueprint): array
    {
        if ($blueprint->grade_id) {
            return Subject::where('grade_id', $blueprint->grade_id)->pluck('id')->all();
        }

        $gradeIds = Grade::where('stage_id', $blueprint->stage_id)->pluck('id');

        return Subject::whereIn('grade_id', $gradeIds)->pluck('id')->all();
    }
}
