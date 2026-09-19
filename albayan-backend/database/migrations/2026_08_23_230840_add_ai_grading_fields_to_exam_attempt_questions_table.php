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
        Schema::table('exam_attempt_questions', function (Blueprint $table) {
            $table->text('selected_text')->nullable()->after('selected_boolean');
            $table->json('ai_grade')->nullable()->after('selected_text');
            $table->decimal('score', 5, 2)->default(0)->after('ai_grade');
            $table->boolean('is_correct')->default(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_attempt_questions', function (Blueprint $table) {
            $table->dropColumn(['selected_text', 'ai_grade', 'score']);
        });
    }
};
