<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_get_ai_session(): void
    {
        $this->postJson('/api/ai/session')->assertStatus(401);
    }

    public function test_student_gets_short_lived_ai_token(): void
    {
        $student = User::create([
            'name' => 'أحمد',
            'email' => 'ahmed@school.com',
            'password' => 'secret',
        ]);
        $student->forceFill(['role' => 'student'])->save();

        $response = $this->actingAs($student)->postJson('/api/ai/session');

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'expires_in']);

        $payload = JWT::decode(
            $response->json('token'),
            new \Firebase\JWT\Key((string) config('services.ai.service_secret'), 'HS256')
        );

        $this->assertSame((int) $student->id, (int) $payload->sub);
        $this->assertSame('student', $payload->role);
        $this->assertGreaterThan($payload->iat, $payload->exp);
        // المدة الافتراضية 15 دقيقة
        $this->assertLessThanOrEqual(15 * 60, $payload->exp - $payload->iat);
    }

    public function test_admin_cannot_get_ai_session(): void
    {
        $admin = User::create([
            'name' => 'مشرف',
            'email' => 'admin@school.com',
            'password' => 'secret',
        ]);
        $admin->forceFill(['role' => 'admin'])->save();

        $this->actingAs($admin)->postJson('/api/ai/session')->assertStatus(403);
    }
}