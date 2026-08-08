<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * خيارات أسئلة بنك الأسئلة (اختيار من متعدد).
     * سؤال صح/خطأ لا يملك خيارات — تُخزَّن إجابته على مستوى السؤال.
     */
    public function up(): void
    {
        Schema::create('bank_question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_question_id')->constrained()->cascadeOnDelete();
            $table->string('content');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('bank_question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_question_options');
    }
};
