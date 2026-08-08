<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * مخططات الامتحانات (Blueprints) — "وصفة" الامتحان قبل أي محاولة.
     *
     * النطاق (Scope) صارم لكل نوع امتحان — عمود واحد فقط يُملأ حسب exam_type:
     *   lesson   → lesson_id
     *   unit     → course_id
     *   monthly  → subject_id + month_no
     *   semester → subject_id (المادة كلها خلال الفصل)
     *   full     → grade_id  (أو stage_id)
     */
    public function up(): void
    {
        Schema::create('exam_blueprints', function (Blueprint $table) {
            $table->id();
            $table->string('exam_type'); // lesson | unit | monthly | semester | full
            $table->string('title');
            $table->text('description')->nullable();

            $table->foreignId('lesson_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('grade_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('stage_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('month_no')->nullable();

            $table->unsignedInteger('duration_minutes')->default(30);
            $table->unsignedInteger('attempts_allowed')->default(2);
            $table->unsignedInteger('easy_count')->default(0);
            $table->unsignedInteger('medium_count')->default(0);
            $table->unsignedInteger('hard_count')->default(0);
            $table->unsignedTinyInteger('pass_threshold_percent')->default(60);
            $table->boolean('show_review_after_submit')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['exam_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_blueprints');
    }
};