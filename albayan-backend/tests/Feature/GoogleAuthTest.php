<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_callback_creates_user_and_api_session_works(): void
    {
        $mockUser = Mockery::mock(SocialiteUser::class);
        $mockUser->shouldReceive('getId')->andReturn('google-id-123');
        $mockUser->shouldReceive('getEmail')->andReturn('google.student@gmail.com');
        $mockUser->shouldReceive('getName')->andReturn('طالب جوجل');
        $mockUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.png');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($mockUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/auth/google/callback');

        $response->assertStatus(302);
        $response->assertRedirect(config('app.frontend_url').'/auth/callback');

        $this->assertDatabaseHas('users', [
            'email' => 'google.student@gmail.com',
            'google_id' => 'google-id-123',
            'role' => 'student',
        ]);

        $user = User::where('email', 'google.student@gmail.com')->first();
        $this->assertTrue($user->isActive());

        // الجلسة تُنشأ و /api/user تصدّق من نفس الكوكي
        $this->actingAs($user)->getJson('/api/user')->assertStatus(200);
    }

    public function test_google_callback_links_existing_email(): void
    {
        $existing = User::create([
            'name' => 'مستخدم موجود',
            'email' => 'existing@school.com',
            'password' => 'secret',
        ]);
        $existing->forceFill(['role' => 'student'])->save();

        $mockUser = Mockery::mock(SocialiteUser::class);
        $mockUser->shouldReceive('getId')->andReturn('google-id-456');
        $mockUser->shouldReceive('getEmail')->andReturn('existing@school.com');
        $mockUser->shouldReceive('getName')->andReturn('مستخدم موجود');
        $mockUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.png');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($mockUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $this->get('/auth/google/callback')->assertStatus(302);

        $this->assertSame(1, User::where('email', 'existing@school.com')->count());
        $this->assertSame('google-id-456', User::where('email', 'existing@school.com')->first()->google_id);
    }
}
