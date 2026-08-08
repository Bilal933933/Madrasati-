<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * إضافة رقم الشهر (1..4) للدروس — لتقسيم مادة الفصل إلى نطاقات شهرية للامتحانات.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->unsignedTinyInteger('month_no')->nullable()->index()->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn('month_no');
        });
    }
};