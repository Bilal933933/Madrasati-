<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Models\Lesson;

/**
 * يبني رحلة التعلم الكاملة للدرس (Learning Flow) — مصدر الحقيقة الوحيد
 * الذي يستهلكه الأدمن والطالب وواجهة البرمجة.
 *
 * يقرأ كتل الدرس (Lesson Blocks) حسب الترتيب ويحمّل المحتوى المرتبط بها،
 * فلا يقرأ أحد الفقرات/التقييمات مباشرة إلا عبر الرحلة.
 */
class LessonFlowService
{
    /**
     * يرجع الدرس مع تحميله كاملًا برحلة مرتبة (blocks) بما تحتويه
     * من فقرات وتقييمات (بأسئلتها وخياراتها) — جاهز للـ Resource.
     */
    public function flow(Lesson $lesson): Lesson
    {
        return $lesson->load([
            'course.subject',
            'blocks' => fn ($q) => $q
                ->orderBy('sort_order')
                ->orderBy('id')
                ->with([
                    'paragraph',
                    'assessment.questions' => fn ($q) => $q->orderBy('sort_order')
                        ->with(['options' => fn ($q) => $q->orderBy('sort_order')]),
                ]),
        ]);
    }
}
