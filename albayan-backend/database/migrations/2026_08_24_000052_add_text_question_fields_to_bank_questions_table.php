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
        Schema::table('bank_questions', function (Blueprint $table) {
            // الحقول المشتركة للأنواع النصية
            $table->text('model_answer')->nullable()->after('explanation');
            $table->json('accepted_answers')->nullable()->after('model_answer');
            $table->boolean('case_sensitive')->default(false)->after('accepted_answers');

            // الحقول للسؤال المقالي
            $table->json('rubric')->nullable()->after('case_sensitive');

            // الحقول للسؤال الرقمي
            $table->decimal('correct_value', 15, 6)->nullable()->after('rubric');
            $table->decimal('tolerance', 10, 6)->default(0)->after('correct_value');
            $table->string('units')->nullable()->after('tolerance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_questions', function (Blueprint $table) {
            $table->dropColumn([
                'model_answer',
                'accepted_answers',
                'case_sensitive',
                'rubric',
                'correct_value',
                'tolerance',
                'units',
            ]);
        });
    }
};
