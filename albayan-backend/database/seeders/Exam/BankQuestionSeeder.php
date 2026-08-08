<?php

namespace Database\Seeders\Exam;

use App\Domains\Exam\Services\ExamBankService;
use App\Domains\Lesson\Models\Lesson;
use Database\Seeders\Data\ExamBank;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

/**
 * يبذر بنك أسئلة الامتحانات (bank_questions + bank_question_options) عبر
 * ExamBankService::createQuestion — نقطة الإنشاء الرسمية للبنك.
 *
 * يطابق كل درس من الصف الرابع الابتدائي بأسئلته الجديدة المكتوبة خصيصًا
 * (مفتاح الـ Data = عنوان الدرس الحقيقي من خطط المحتوى).
 * نطاق الصف يمنع تكرار نفس الأسئلة على دروس صفوفٍ أُخرى بنفس العنوان.
 */
class BankQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $bankService = app(ExamBankService::class);
        $catalog = ExamBank::questions();
        $gradeId = SeedRegistry::$grades['primary_4'] ?? null;

        if ($gradeId === null) {
            return;
        }

        $lessonIds = Lesson::query()
            ->whereHas('course.subject.grade', fn ($q) => $q->whereKey($gradeId))
            ->pluck('id');

        foreach ($lessonIds as $lessonId) {
            $lesson = Lesson::find($lessonId);
            $title = $lesson->title;

            if (! isset($catalog[$title])) {
                continue;
            }

            foreach ($catalog[$title] as $question) {
                $bankService->createQuestion(array_merge($question, ['lesson_id' => $lessonId]));
            }
        }
    }
}
