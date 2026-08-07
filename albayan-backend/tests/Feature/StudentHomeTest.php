<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\StudentProfile;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentHomeTest extends TestCase
{
    use RefreshDatabase;

    private Stage $stage;

    private Grade $grade;

    private Semester $semester;

    protected function setUp(): void
    {
        parent::setUp();

        $this->stage = Stage::create(['key' => 'primary', 'name' => 'المرحلة الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $this->grade = Grade::create(['stage_id' => $this->stage->id, 'key' => 'grade-4', 'name' => 'الصف الرابع', 'sort_order' => 1, 'is_published' => true]);
        $this->semester = Semester::create(['grade_id' => $this->grade->id, 'key' => 'semester-1', 'name' => 'الفصل الأول', 'sort_order' => 0]);
    }

    private function seedSubject(string $slug, string $name, int $sortOrder): Subject
    {
        return Subject::create([
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
            'name' => $name,
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

    public function test_guest_cannot_access_student_home(): void
    {
        $this->getJson('/api/student/home')->assertStatus(401);
    }

    public function test_student_without_profile_gets_404(): void
    {
        $user = User::create(['name' => 'طالب', 'email' => 'student@test.com', 'password' => 'secret', 'role' => 'student']);

        $this->actingAs($user)
            ->getJson('/api/student/home')
            ->assertStatus(404);
    }

    public function test_student_home_returns_grade_semester_and_subjects(): void
    {
        $this->seedSubject('math', 'الرياضيات', 0);
        $this->seedSubject('arabic', 'العربية', 1);
        $user = $this->createUserWithProfile();

        $response = $this->actingAs($user)->getJson('/api/student/home');

        $response->assertOk()
            ->assertJsonPath('data.grade.name', 'الصف الرابع')
            ->assertJsonPath('data.semester.name', 'الفصل الأول')
            ->assertJsonPath('data.subjects.0.name', 'الرياضيات')
            ->assertJsonPath('data.subjects.1.name', 'العربية')
            ->assertJsonCount(2, 'data.subjects');
    }

    public function test_last_visited_subject_is_sorted_first(): void
    {
        $math = $this->seedSubject('math', 'الرياضيات', 0);
        $arabic = $this->seedSubject('arabic', 'العربية', 1);
        $user = $this->createUserWithProfile();

        $user->profile()->update(['last_subject_id' => $arabic->id]);

        $response = $this->actingAs($user)->getJson('/api/student/home');

        $response->assertOk()
            ->assertJsonPath('data.subjects.0.name', 'العربية')
            ->assertJsonPath('data.subjects.1.name', 'الرياضيات')
            ->assertJsonPath('data.subjects.0.grade_key', 'grade-4')
            ->assertJsonPath('data.subjects.0.semester_key', 'semester-1')
            ->assertJsonPath('data.subjects.0.units_count', 0);
    }

    public function test_guest_cannot_create_student_profile(): void
    {
        $this->postJson('/api/student/profile', [
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
        ])->assertStatus(401);
    }

    public function test_student_can_link_grade_and_semester(): void
    {
        $user = User::create(['name' => 'طالب', 'email' => 'student@test.com', 'password' => 'secret', 'role' => 'student']);

        $this->actingAs($user)
            ->postJson('/api/student/profile', [
                'grade_id' => $this->grade->id,
                'semester_id' => $this->semester->id,
            ])
            ->assertOk()
            ->assertJsonPath('message', 'تم ربط بياناتك الدراسية بنجاح.');

        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $user->id,
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
        ]);
    }

    public function test_semester_must_belong_to_selected_grade(): void
    {
        $otherGrade = Grade::create(['stage_id' => $this->stage->id, 'key' => 'grade-5', 'name' => 'الصف الخامس', 'sort_order' => 2, 'is_published' => true]);
        $otherSemester = Semester::create(['grade_id' => $otherGrade->id, 'key' => 'semester-1', 'name' => 'الفصل الأول', 'sort_order' => 0]);
        $user = User::create(['name' => 'طالب', 'email' => 'student@test.com', 'password' => 'secret', 'role' => 'student']);

        $this->actingAs($user)
            ->postJson('/api/student/profile', [
                'grade_id' => $this->grade->id,
                'semester_id' => $otherSemester->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('semester_id');
    }
}
