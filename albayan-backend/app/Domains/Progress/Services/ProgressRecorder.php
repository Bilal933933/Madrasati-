<?php

namespace App\Domains\Progress\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Progress\Events\LessonCompletedEvent;
use App\Domains\Progress\Models\LessonCompletion;
use Illuminate\Support\Facades\Event;

/**
 * تسجيل تقدّم الطالب (كتابات) — نقاط بدء/إكمال صريحة من الواجهة.
 *
 * مصدر الحقيقة جدول lesson_completions (سجل لكل طالب/درس). لا يُخزَّن
 * أي تقدم مُجمع هنا؛ اشتقاق لقطات المواد والمقررات والتقدم الكلي
 * مناطٌ بـ ProgressAggregator الذي يقرأ هذه السجلات.
 */
class ProgressRecorder
{
    /**
     * يسلّم "بدأ الطالب الدرس" — يضبط started_at عند أول فتح فقط.
     */
    public function markStarted(User $user, Lesson $lesson): LessonCompletion
    {
        $record = $user->lessonCompletions()->firstOrNew(['lesson_id' => $lesson->id]);

        $record->started_at ??= now();
        $record->save();

        return $record;
    }

    /**
     * يسلّم "أكمل الطالب الدرس" — يضبط completed_at (مع started_at إن غاب)
     * وينشر حدث LessonCompleted لتصله الأنظمة المستمعة (الإنجازات).
     */
    public function markCompleted(User $user, Lesson $lesson): LessonCompletion
    {
        $record = $user->lessonCompletions()->firstOrNew(['lesson_id' => $lesson->id]);

        $record->started_at ??= now();
        $record->completed_at = now();
        $record->save();

        $event = new LessonCompletedEvent($user, $lesson);
        Event::dispatch($event);

        // الأوسمة المفتوحة حديثًا — تملؤها مستمعات الحدث لتظهر في استجابة الواجهة.
        $record->unlocked_achievements = $event->unlocked;

        return $record;
    }
}
