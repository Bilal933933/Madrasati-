<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * تنفيذ الـ Migration
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();

            // Nullable لأن المستخدم قد يسجّل بجوجل فقط بدون كلمة سر
            $table->string('password')->nullable();

            // Nullable لأن المستخدم قد يسجّل بإيميل/كلمة سر فقط بدون جوجل
            $table->string('google_id')->nullable()->unique();

            $table->string('avatar')->nullable();

            // موجود لأسباب توافق قياسية مع Laravel، غير مُستخدم في منطق التفعيل حاليًا
            $table->timestamp('email_verified_at')->nullable();

            $table->enum('role', ['student', 'admin'])->default('student');

            $table->rememberToken();
            $table->timestamps();
        });

        // جدول استرجاع كلمة السر (قياسي في Laravel)
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // جدول الجلسات — مطلوب لأننا نستخدم SESSION_DRIVER=database مع Sanctum SPA Mode
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * التراجع عن الـ Migration
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
