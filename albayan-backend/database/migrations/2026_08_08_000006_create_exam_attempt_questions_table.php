<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * لقطة سؤال داخل محاولة (Snapshot) — نسخة معزولة عن بنك الأسئلة.
     * لو عُدّل سؤال البنك لاحقًا لا تتأثر المحاولة؛ الحلول والتحدير من الـ snapshot.
     */
    public function up(): void
    {
        Schema::create('exam_attempt_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_question_id')->nullable()->constrained()->nullOnDelete();
            $table->json('question_snapshot'); // نص+خيارات+إجابات صحيحة (للتصحيح)
            $table->unsignedBigInteger('selected_option_id')->nullable();
            $table->boolean('selected_boolean')->nullable(); // لسؤال صح/خطأ
            $table->boolean('is_correct')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['exam_attempt_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempt_questions');
    }
};
