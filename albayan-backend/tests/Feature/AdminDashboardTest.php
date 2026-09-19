<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::create([
            'name' => 'مشرف',
            'email' => 'admin@school.com',
            'password' => 'secret',
        ]);
        $admin->forceFill(['role' => 'admin'])->save();

        return $admin;
    }

    private function student(string $email = 'student@school.com'): User
    {
        $student = User::create([
            'name' => 'طالب',
            'email' => $email,
            'password' => 'secret',
        ]);
        $student->forceFill(['role' => 'student'])->save();

        return $student;
    }

    public function test_guest_cannot_list_users(): void
    {
        $this->getJson('/api/admin/users')->assertStatus(401);
    }

    public function test_student_cannot_access_admin_endpoints(): void
    {
        $student = $this->student();

        $this->actingAs($student)
            ->getJson('/api/admin/users')
            ->assertStatus(403);

        $this->actingAs($student)
            ->getJson('/api/admin/analytics/summary')
            ->assertStatus(403);
    }

    public function test_admin_lists_and_searches_users(): void
    {
        $admin = $this->admin();
        $this->student('first@school.com');
        $this->student('second@school.com');

        $this->actingAs($admin)
            ->getJson('/api/admin/users?per_page=1')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'email', 'role', 'is_active', 'created_at']],
                'meta' => ['current_page', 'last_page', 'total'],
            ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/users?search=second')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'second@school.com');
    }

    public function test_admin_can_update_role_and_status(): void
    {
        $admin = $this->admin();
        $student = $this->student();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$student->id}/role", ['role' => 'teacher'])
            ->assertStatus(200)
            ->assertJsonPath('data.role', 'teacher');

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$student->id}/status", ['is_active' => false])
            ->assertStatus(200)
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_cannot_change_own_role_or_deactivate_self(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}/role", ['role' => 'student'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('role');

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}/status", ['is_active' => false])
            ->assertStatus(422)
            ->assertJsonValidationErrors('is_active');
    }

    public function test_admin_can_read_and_update_settings(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->getJson('/api/admin/settings')
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['site_name', 'maintenance_mode']]);

        $this->actingAs($admin)
            ->putJson('/api/admin/settings', ['site_name' => 'مدرستي الجديدة', 'maintenance_mode' => true])
            ->assertStatus(200)
            ->assertJsonPath('data.site_name', 'مدرستي الجديدة')
            ->assertJsonPath('data.maintenance_mode', true);
    }
}
