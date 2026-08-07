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

class UserContextTest extends TestCase
{
    use RefreshDatabase;

    private Stage $stage;

    private Grade $grade;

    private Semester $semester;

    protected function setUp(): void
    {
        parent::setUp();

        $this->stage = Stage::create(['key' => 'primary', 'name' => 'المرحلة الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $this->grade = Grade::create(['stage_id' => $this->stage->id, 'key' => 'grade-1', 'name' => 'الصف الأول', 'sort_order' => 1, 'is_published' => true]);
        $this->semester = Semester::create(['grade_id' => $this->grade->id, 'key' => 'semester-1', 'name' => 'الفصل الأول', 'sort_order' => 0]);
    }

    private function seedSubject(string $slug, string $name): Subject
    {
        return Subject::create([
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
            'name' => $name,
            'slug' => $slug,
            'sort_order' => 1,
            'is_published' => true,
        ]);
    }

    private function createUser(): User
    {
        return User::create(['name' => 'طالب', 'email' => 'student@test.com', 'password' => 'secret', 'role' => 'student']);
    }

    private function createUserWithProfile(): User
    {
        $user = $this->createUser();

        StudentProfile::create([
            'user_id' => $user->id,
            'grade_id' => $this->grade->id,
            'semester_id' => $this->semester->id,
        ]);

        return $user;
    }

    public function test_guest_cannot_save_context(): void
    {
        $this->seedSubject('math', 'الرياضيات');

        $response = $this->postJson('/api/user-context', ['subject_slug' => 'math']);

        $response->assertStatus(401);
        $this->assertDatabaseCount('student_profiles', 0);
    }

    public function test_protected_endpoint_returns_401_for_guest(): void
    {
        $this->getJson('/api/user')->assertStatus(401);

        $this->postJson('/api/user-context', ['subject_slug' => 'math'])->assertStatus(401);
    }

    public function test_authenticated_user_with_profile_can_save_context(): void
    {
        $subject = $this->seedSubject('math', 'الرياضيات');
        $user = $this->createUserWithProfile();

        $this->actingAs($user)
            ->postJson('/api/user-context', ['subject_slug' => 'math'])
            ->assertStatus(200);

        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $user->id,
            'last_subject_id' => $subject->id,
        ]);
    }

    public function test_user_without_profile_cannot_save_context(): void
    {
        $this->seedSubject('math', 'الرياضيات');
        $user = $this->createUser();

        $this->actingAs($user)
            ->postJson('/api/user-context', ['subject_slug' => 'math'])
            ->assertStatus(404);
    }

    public function test_context_updates_last_subject_on_new_visit(): void
    {
        $first = $this->seedSubject('math', 'الرياضيات');
        $second = $this->seedSubject('science', 'العلوم');
        $user = $this->createUserWithProfile();

        $this->actingAs($user)->postJson('/api/user-context', ['subject_slug' => 'math']);
        $this->actingAs($user)->postJson('/api/user-context', ['subject_slug' => 'science']);

        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $user->id,
            'last_subject_id' => $second->id,
        ]);

        $this->assertSame(1, StudentProfile::where('user_id', $user->id)->count());
        $this->assertNotSame($first->id, $user->profile->last_subject_id);
    }

    public function test_context_rejects_unknown_subject_slug(): void
    {
        $user = $this->createUserWithProfile();

        $this->actingAs($user)
            ->postJson('/api/user-context', ['subject_slug' => 'unknown'])
            ->assertStatus(422);
    }
}
