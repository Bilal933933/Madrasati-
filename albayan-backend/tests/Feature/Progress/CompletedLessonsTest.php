<?php

namespace Tests\Feature\Progress;

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

class CompletedLessonsTest extends TestCase
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

        $this->courseOne = Course::create(['subject_id' => $this->subject->id, 'name' => 'النحو', 'sort_order' => 1, 'is_published' => true]);
        $this->courseTwo = Course::create(['subject_id' => $this->subject->id, 'name' => 'النصوص', 'sort_order' => 2, 'is_published' => true]);
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

    private function createUserWithProfile(?string $email = null): User
    {
        $user = User::create(['name' => 'طالب', 'email' => $email ?? 'student@test.com', 'password' => 'secret', 'role' => 'student']);

        StudentProfile::create([
            'user_id' => $user->id,
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
        ]);

        return $user;
    }

    public function test_guest_cannot_access_completed_lessons(): void
    {
        $this->getJson('/api/student/completed-lessons')->assertStatus(401);
    }

    public function test_returns_only_completed_lessons_with_stats(): void
    {
        $first = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $this->seedLesson($this->courseOne, 'إعراب المبتدأ', 'irab-nabda', 2);
        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/student/lessons/'.$first->slug.'/complete');

        $response = $this->actingAs($user)->getJson('/api/student/completed-lessons');

        $response->assertOk()
            ->assertJsonPath('stats.total', 1)
            ->assertJsonPath('stats.subjects_count', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.lesson.slug', 'nabda-khabar')
            ->assertJsonPath('data.0.lesson.title', 'المبتدأ والخبر')
            ->assertJsonPath('data.0.subject.name', 'اللغة العربية')
            ->assertJsonPath('data.0.subject.slug', 'arabic')
            ->assertJsonPath('data.0.course_name', 'النحو')
            ->assertJsonStructure(['data' => [['completed_at']]]);
    }

    public function test_orders_by_latest_completion_and_counts_subjects(): void
    {
        $first = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);

        $math = Subject::create([
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
            'name' => 'الرياضيات',
            'slug' => 'math',
            'sort_order' => 2,
            'is_published' => true,
        ]);
        $mathCourse = Course::create(['subject_id' => $math->id, 'name' => 'الأعداد', 'sort_order' => 1, 'is_published' => true]);
        $mathLesson = $this->seedLesson($mathCourse, 'جمع الأعداد', 'jam-al-adad', 1);

        $user = $this->createUserWithProfile();

        // أُكمل درس الرياضيات أولًا ثم درس النحو لاحقًا — الترتيب يجب أن يضع الأخير أولًا.
        $this->actingAs($user)->postJson('/api/student/lessons/'.$mathLesson->slug.'/complete');
        $this->actingAs($user)->postJson('/api/student/lessons/'.$first->slug.'/complete');

        $response = $this->actingAs($user)->getJson('/api/student/completed-lessons');

        $response->assertOk()
            ->assertJsonPath('stats.total', 2)
            ->assertJsonPath('stats.subjects_count', 2)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.lesson.slug', 'nabda-khabar')
            ->assertJsonPath('data.1.lesson.slug', 'jam-al-adad');
    }

    public function test_is_scoped_to_current_user(): void
    {
        $lesson = $this->seedLesson($this->courseOne, 'المبتدأ والخبر', 'nabda-khabar', 1);
        $user = $this->createUserWithProfile();
        $other = $this->createUserWithProfile('other@test.com');

        $this->actingAs($user)->postJson('/api/student/lessons/'.$lesson->slug.'/complete');

        $this->actingAs($other)
            ->getJson('/api/student/completed-lessons')
            ->assertOk()
            ->assertJsonPath('stats.total', 0)
            ->assertJsonCount(0, 'data');
    }
}
