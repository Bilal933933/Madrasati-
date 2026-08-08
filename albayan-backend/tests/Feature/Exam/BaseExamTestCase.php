<?php

namespace Tests\Feature\Exam;

use App\Domains\Auth\Models\StudentProfile;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Exam\Models\BankQuestion;
use App\Domains\Exam\Models\BankQuestionOption;
use App\Domains\Exam\Models\ExamBlueprint;
use App\Domains\Exam\Services\ExamAttemptService;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Progress\Models\LessonCompletion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * قاعدة اختبارات دومين الامتحانات — بذر شجرة تعليمية كاملة + أدوات مساعدة.
 */
abstract class BaseExamTestCase extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $student;

    protected User $otherStudent;

    protected Stage $stage;

    protected Grade $grade;

    protected Semester $semester;

    protected Subject $subject;

    protected Course $courseOne;

    protected Course $courseTwo;

    protected Lesson $lessonOne;

    protected Lesson $lessonTwo;

    protected Lesson $lessonThree;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create(['name' => 'مدير', 'email' => 'admin@exam.test', 'password' => 'secret']);
        $this->admin->role = 'admin';
        $this->admin->save();

        $this->student = User::create(['name' => 'طالب', 'email' => 'student@exam.test', 'password' => 'secret', 'role' => 'student']);
        $this->otherStudent = User::create(['name' => 'طالب آخر', 'email' => 'other@exam.test', 'password' => 'secret', 'role' => 'student']);

        $this->stage = Stage::create(['name' => 'الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $this->grade = Grade::create(['stage_id' => $this->stage->id, 'name' => 'الرابع', 'sort_order' => 1, 'is_published' => true]);
        $this->semester = Semester::create(['grade_id' => $this->grade->id, 'name' => 'الفصل الأول', 'sort_order' => 1]);
        $this->subject = Subject::create(['grade_id' => $this->grade->id, 'semester_id' => $this->semester->id, 'name' => 'الرياضيات', 'slug' => 'math', 'sort_order' => 1, 'is_published' => true]);

        // ملف أكاديمي للطالب — صفه وفصله (قائمة الامتحانات تُحصر بصفه)
        StudentProfile::create([
            'user_id' => $this->student->id,
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
        ]);

        $this->courseOne = Course::create(['subject_id' => $this->subject->id, 'name' => 'الأعداد', 'sort_order' => 1, 'is_published' => true]);
        $this->courseTwo = Course::create(['subject_id' => $this->subject->id, 'name' => 'الهندسة', 'sort_order' => 2, 'is_published' => true]);

        // وحدة (courseOne): درسان، شهران مختلفان — لاختبار نطاق الشهر
        $this->lessonOne = $this->makeLesson($this->courseOne, 'درس الجمع', 'jam', 1, monthNo: 1);
        $this->lessonTwo = $this->makeLesson($this->courseOne, 'درس الطرح', 'tarh', 2, monthNo: 2);
        $this->lessonThree = $this->makeLesson($this->courseTwo, 'درس الشكل', 'shakl', 1);
    }

    /* --------------------------- أدوات البذر --------------------------- */

    protected function makeLesson(Course $course, string $title, string $slug, int $sortOrder, ?int $monthNo = null): Lesson
    {
        return Lesson::create([
            'course_id' => $course->id,
            'title' => $title,
            'slug' => $slug,
            'sort_order' => $sortOrder,
            'month_no' => $monthNo,
            'is_published' => true,
        ]);
    }

    /**
     * سؤال اختيار من متعدد بثلاثة خيارات — يُرجع السؤال + الخيار الصحيح.
     */
    protected function makeMcq(Lesson $lesson, string $difficulty = 'easy', string $content = 'ما هو الرقم الصحيح؟'): BankQuestion
    {
        $question = BankQuestion::create([
            'lesson_id' => $lesson->id,
            'type' => 'mcq',
            'content' => $content,
            'difficulty' => $difficulty,
            'is_active' => true,
        ]);

        BankQuestionOption::create(['bank_question_id' => $question->id, 'content' => 'إجابة صحيحة', 'is_correct' => true, 'sort_order' => 1]);
        BankQuestionOption::create(['bank_question_id' => $question->id, 'content' => 'خيار خاطئ أ', 'is_correct' => false, 'sort_order' => 2]);
        BankQuestionOption::create(['bank_question_id' => $question->id, 'content' => 'خيار خاطئ ب', 'is_correct' => false, 'sort_order' => 3]);

        return $question;
    }

    protected function makeTrueFalse(Lesson $lesson, string $difficulty = 'medium', bool $answer = true, string $content = 'عبارة صحيحة'): BankQuestion
    {
        return BankQuestion::create([
            'lesson_id' => $lesson->id,
            'type' => 'true_false',
            'content' => $content,
            'difficulty' => $difficulty,
            'correct_answer' => $answer,
            'is_active' => true,
        ]);
    }

    protected function makeBlueprint(array $overrides = []): ExamBlueprint
    {
        return ExamBlueprint::create(array_merge([
            'exam_type' => 'lesson',
            'title' => 'امتحان الدرس',
            'lesson_id' => $this->lessonOne->id,
            'duration_minutes' => 30,
            'attempts_allowed' => 2,
            'easy_count' => 1,
            'medium_count' => 0,
            'hard_count' => 0,
            'pass_threshold_percent' => 50,
            'show_review_after_submit' => true,
            'is_active' => true,
        ], $overrides));
    }

    protected function completeLessonFor(User $user, Lesson $lesson): void
    {
        LessonCompletion::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed_at' => now(),
        ]);
    }

    protected function completeScopeForStudent(?Lesson $lesson = null): void
    {
        $this->completeLessonFor($this->student, $lesson ?? $this->lessonOne);
    }

    protected function examAttemptService(): ExamAttemptService
    {
        return app(ExamAttemptService::class);
    }

    protected function correctOptionOf(BankQuestion $question): int
    {
        return $question->options()->where('is_correct', true)->firstOrFail()->id;
    }
}
