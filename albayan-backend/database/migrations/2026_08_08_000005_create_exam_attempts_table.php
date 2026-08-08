<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * محاولات الطالب للامتحانات — كل سطر = محاولة.
     * المؤقّت محسوب خادمًا (deadline_at)؛ التصحيح فوري عند التسليم.
     */
    public function up(): void
    {
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blueprint_id')->constrained('exam_blueprints')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('attempt_number')->default(1);
            $table->string('status')->default('in_progress'); // in_progress | completed
            $table->timestamp('started_at')->nullable();
            $table->timestamp('deadline_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedInteger('total_questions')->default(0);
            $table->unsignedInteger('correct_count')->default(0);
            $table->float('score_percentage', 5, 2)->nullable();
            $table->boolean('passed')->nullable();
            $table->timestamps();

            $table->unique(['blueprint_id', 'user_id', 'attempt_number']);
            $table->index(['user_id', 'status']);
            $table->index(['status', 'deadline_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};