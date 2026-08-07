<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\StudentProfile;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Models\Lesson;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressDomainTest extends TestCase
{
    use RefreshDatabase;

    private Stage $stage;

    private Grade $grade;

    private Semester $semester;

    private Subject $subject;

    private Course $courseOne;

    private Course $courseTwo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->stage = Stage::create(['key' => 'primary', 'name' => 'المرحلة الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $this->grade = Grade::create(['stage_id' => $this->stage->id, 'key' => 'grade-4', 'name' => 'الصف الرابع', 'sort_order' => 1, 'is_published' => true]);
        $this->semester = Semester::create(['grade_id' => $this->grade->id, 'key' => 'semester-1', 'name' => 'الفصل الأول', 'sort_order' => 0]);

        $this->subject = Subject::create([
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
            'name' => 'اللغة العربية',
            'slug' => 'arabic',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $this->courseOne = Course::create([
            'subject_id' => $this->subject->id,
            'name' => 'النحو',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $this->courseTwo = Course::create([
            'subject_id' => $this->subject->id,
            'name' => 'النصوص',
            'sort_order' => 2,
            'is_published' => true,
        ]);
    }

    private function seedLesson(Course $course, string $title, string $slug, int $sortOrder): Lesson
    {
        return Lesson::create([
            'course_id' => $course->id,
            'title' => $title,
            'slug' => $slug,
            'sort_order' => $sortOrder,
            'is_published' => true,
        ]);
    }

    private function createUserWithProfile(): User
    {
        $user = User::create(['name' => 'طالب', 'email' => 'student@test.com', 'password' => 'secret', 'role' => 'student']);

        StudentProfile::create([
            'user_id' => $user->id,
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
        ]);

        return $user;
    }

    /* ------------------------------ الحماية ------------------------------ */

    public function test_guest_cannot_start_or_complete_lesson(): void
    {
        $lesson = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);

        $this->postJson('/api/student/lessons/'.$lesson->slug.'/start')->assertStatus(401);
        $this->postJson('/api/student/lessons/'.$lesson->slug.'/complete')->assertStatus(401);
    }

    public function test_guest_cannot_access_student_subject_page(): void
    {
        $this->getJson('/api/student/subjects/arabic')->assertStatus(401);
    }

    /* ---------------------------- تسجيل التقدم ---------------------------- */

    public function test_student_can_start_a_lesson(): void
    {
        $lesson = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)
            ->postJson('/api/student/lessons/'.$lesson->slug.'/start')
            ->assertOk()
            ->assertJsonPath('message', 'تم تسجيل بدء الدرس.');

        $this->assertDatabaseHas('lesson_completions', [
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ]);

        $this->assertNotNull($user->lessonCompletions()->first()->started_at);
        $this->assertNull($user->lessonCompletions()->first()->completed_at);
    }

    public function test_starting_twice_keeps_first_started_at(): void
    {
        $lesson = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/student/lessons/'.$lesson->slug.'/start');
        $first = $user->lessonCompletions()->first()->started_at;

        $this->actingAs($user)->postJson('/api/student/lessons/'.$lesson->slug.'/start')->assertOk();

        $this->assertSame(1, $user->lessonCompletions()->count());
        $this->assertEquals($first, $user->lessonCompletions()->first()->started_at);
    }

    public function test_student_can_complete_a_lesson(): void
    {
        $lesson = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)
            ->postJson('/api/student/lessons/'.$lesson->slug.'/complete')
            ->assertOk()
            ->assertJsonPath('message', 'تم تسجيل إكمال الدرس.');

        $this->assertNotNull($user->lessonCompletions()->first()->completed_at);
    }

    public function test_completing_unknown_lesson_slug_returns_404(): void
    {
        $user = $this->createUserWithProfile();

        $this->actingAs($user)
            ->postJson('/api/student/lessons/unknown/complete')
            ->assertStatus(404);
    }

    /* ------------------------------ بيت الطالب ---------------------------- */

    public function test_home_reports_not_started_for_fresh_subject(): void
    {
        $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $user = $this->createUserWithProfile();

        $response = $this->actingAs($user)->getJson('/api/student/home');

        $response->assertOk()
            ->assertJsonPath('data.overall_progress', 0)
            ->assertJsonPath('data.subjects.0.status', 'not_started')
            ->assertJsonPath('data.subjects.0.progress', 0)
            ->assertJsonPath('data.subjects.0.completed_count', 0)
            ->assertJsonPath('data.subjects.0.total_count', 1)
            ->assertJsonPath('data.subjects.0.next_lesson.slug', 'nabda-khabar');
    }

    public function test_home_reports_in_progress_after_partial_completion(): void
    {
        $first = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $this->seedLesson($this->courseOne, 'إعراب المبتدأ', 'irab-nabda', 2);
        $this->seedLesson($this->courseTwo, 'نص الفلاح', 'fallah', 1);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/student/lessons/'.$first->slug.'/complete');

        $response = $this->actingAs($user)->getJson('/api/student/home');

        $response->assertOk()
            ->assertJsonPath('data.subjects.0.status', 'in_progress')
            ->assertJsonPath('data.subjects.0.progress', 33)
            ->assertJsonPath('data.subjects.0.completed_count', 1)
            ->assertJsonPath('data.subjects.0.total_count', 3)
            ->assertJsonPath('data.subjects.0.last_lesson.slug', $first->slug)
            ->assertJsonPath('data.subjects.0.next_lesson.slug', 'irab-nabda');
    }

    public function test_overall_progress_averages_subjects(): void
    {
        $arabicLesson = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);

        $math = Subject::create([
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
            'name' => 'الرياضيات',
            'slug' => 'math',
            'sort_order' => 2,
            'is_published' => true,
        ]);
        $mathCourse = Course::create(['subject_id' => $math->id, 'name' => 'الأعداد', 'sort_order' => 1, 'is_published' => true]);
        $this->seedLesson($mathCourse, 'جمع الأعداد', 'jam-al-adad', 1);

        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/student/lessons/'.$arabicLesson->slug.'/complete');

        $response = $this->actingAs($user)->getJson('/api/student/home');

        $response->assertOk()
            ->assertJsonPath('data.subjects.0.progress', 100)
            ->assertJsonPath('data.subjects.1.progress', 0)
            ->assertJsonPath('data.overall_progress', 50);
    }

    /* ---------------------------- صفحة المادة ----------------------------- */

    public function test_student_subject_page_returns_units_with_progress(): void
    {
        $first = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $this->seedLesson($this->courseOne, 'إعراب المبتدأ', 'irab-nabda', 2);
        $this->seedLesson($this->courseTwo, 'نص الفلاح', 'fallah', 1);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/student/lessons/'.$first->slug.'/complete');

        $response = $this->actingAs($user)->getJson('/api/student/subjects/arabic');

        $response->assertOk()
            ->assertJsonPath('data.name', 'اللغة العربية')
            ->assertJsonPath('data.progress', 33)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.units.0.name', 'النحو')
            ->assertJsonPath('data.units.0.progress', 50)
            ->assertJsonPath('data.units.0.status', 'in_progress')
            ->assertJsonCount(2, 'data.units.0.lessons')
            ->assertJsonPath('data.units.1.name', 'النصوص')
            ->assertJsonPath('data.units.1.progress', 0)
            ->assertJsonPath('data.units.1.status', 'not_started')
            ->assertJsonPath('data.units.1.next_lesson.slug', 'fallah')
            ->assertJsonPath('data.units.0.lessons.0.completed', true)
            ->assertJsonPath('data.units.0.lessons.1.completed', false)
            ->assertJsonPath('data.units.1.lessons.0.completed', false)
            ->assertJsonPath('data.completed_lesson_ids.0', $first->id);
    }

    public function test_student_subject_page_exposes_subject_completed_lesson_ids(): void
    {
        $first = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $this->seedLesson($this->courseOne, 'إعراب المبتدأ', 'irab-nabda', 2);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/student/lessons/'.$first->slug.'/complete');

        $response = $this->actingAs($user)->getJson('/api/student/subjects/arabic');

        $response->assertOk()
            ->assertJsonPath('data.completed_count', 1)
            ->assertJsonPath('data.completed_lesson_ids.0', $first->id);
    }

    public function test_home_exposes_completed_flag_on_last_and_next_lesson(): void
    {
        $first = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $this->seedLesson($this->courseOne, 'إعراب المبتدأ', 'irab-nabda', 2);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/student/lessons/'.$first->slug.'/complete');

        $response = $this->actingAs($user)->getJson('/api/student/home');

        $response->assertOk()
            ->assertJsonPath('data.subjects.0.last_lesson.completed', true)
            ->assertJsonPath('data.subjects.0.next_lesson.completed', false);
    }
}
