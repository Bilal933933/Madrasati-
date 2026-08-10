<?php

namespace App\Domains\Exam\Services;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Lesson\Models\Lesson;
use Illuminate\Database\Eloquent\Collection;

/**
 * حلّ نطاق قالب الامتحان (Blueprint) إلى دروس فعلية منشورة — قراءة فقط.
 */
class BlueprintLessonResolver
{
    /**
     * قائمة دروس النطاق التي يغطيها blueprint — مبنية على النوع والرابط الصارم.
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
