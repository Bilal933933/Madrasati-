<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * بنك الأسئلة المستقل عن تقييمات الدروس — مصدر الأسئلة للامتحانات.
     * السؤال مرتبط بدرس (lesson_id) كأدنى نطاق تعليمي، ويمكن تصعيده بمادة/كورس/شهر.
     */
    public function up(): void
    {
        Schema::create('bank_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // mcq | true_false
            $table->text('content');
            $table->text('explanation')->nullable();
            $table->boolean('correct_answer')->nullable(); // لسؤال صح/خطأ فقط
            $table->string('difficulty')->default('medium'); // easy | medium | hard
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['lesson_id', 'is_active']);
            $table->index(['difficulty', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_questions');
    }
};