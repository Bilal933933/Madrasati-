<?php

namespace App\Domains\Exam\Services;

use Illuminate\Validation\ValidationException;

/**
 * قواعد النطاق الصارمة لقوالب الامتحانات (Blueprints) — التحقق من الأعمدة
 * المسموحة لكل نوع وتطبيعها قبل التخزين. لا يلمس قاعدة البيانات.
 */
class BlueprintScopeRules
{
    /**
     * الأعمدة المسموحة لكل نوع امتحان — عمود واحد فقط يُشغَّل.
     */
    public const SCOPE_MAP = [
        'lesson' => ['lesson_id'],
        'unit' => ['course_id'],
        'monthly' => ['subject_id', 'month_no'],
        'semester' => ['subject_id'],
        'full' => ['grade_id'], // أو stage_id إن أُرسل — يُعالج أدناه
    ];

    /**
     * يفحص صلاحية النطاق (العمود الإلزامي + الأعمدة الممنوعة للنوع معهد).
     */
    public function assertValidScope(array $data, ?int $ignoreId = null): void
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
     * تطبيع البيانات قبل التخزين: إفراغ كل أعمدة النطاق غير ذات صلة بالنوع.
     */
    public function normalizeScope(array $data): array
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

    /**
     * الأعمدة المسموحة لنوع الامتحان.
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
}
