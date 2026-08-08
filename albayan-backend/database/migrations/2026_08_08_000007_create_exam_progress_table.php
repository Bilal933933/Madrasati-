<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * تقدم الطالب داخل محاولة امتحان — الموضع الحالي والأسئلة المعلَّمة.
     * صف واحد لكل محاولة (upsert مشابه لـ lesson_completions).
     */
    public function up(): void
    {
        Schema::create('exam_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_attempt_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('current_index')->default(0);
            $table->json('flagged_question_ids')->nullable();
            $table->timestamps();

            $table->unique(['exam_attempt_id']);
            $table->index(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_progress');
    }
};
