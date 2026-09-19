<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            // حالة الامتحان الموسعة: in_progress | submitted | graded
            $table->string('attempt_status')->default('in_progress')->after('status');
            // submitted_at موجود مسبقاً في الترحيل الأصلي
            $table->timestamp('graded_at')->nullable()->after('submitted_at');
            $table->boolean('is_locked')->default(false)->after('graded_at');
            $table->decimal('total_score', 6, 2)->default(0)->after('is_locked');
            $table->decimal('max_score', 6, 2)->default(0)->after('total_score');
            $table->decimal('percentage', 5, 2)->nullable()->after('max_score');
            $table->text('grading_errors')->nullable()->after('percentage');
            $table->string('grade_job_id')->nullable()->after('grading_errors');

            $table->index(['attempt_status', 'user_id']);
            $table->index(['grade_job_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->dropIndex(['attempt_status', 'user_id']);
            $table->dropIndex(['grade_job_id']);
            $table->dropColumn([
                'attempt_status',
                'graded_at',
                'is_locked',
                'total_score',
                'max_score',
                'percentage',
                'grading_errors',
                'grade_job_id',
            ]);
        });
    }
};
