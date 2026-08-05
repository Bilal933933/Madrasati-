<?php

namespace App\Console\Commands;

use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Services\LessonTemplateBuilder;
use Illuminate\Console\Command;

/**
 * أداة ترحيل لمرة واحدة: يربط محتوى الدروس الحالي (فقرات/تقييمات/فيديو)
 * برحلة التعلم lesson_blocks. Idempotent — يمكن تشغيله بأمان أكثر من مرة.
 */
class SyncLessonBlocks extends Command
{
    protected $signature = 'lesson:sync-blocks';

    protected $description = 'يربط محتوى الدروس الحالي (فقرات/تقييمات/فيديو) بكتل رحلة التعلم lesson_blocks.';

    public function handle(LessonTemplateBuilder $builder): int
    {
        $lessons = Lesson::query()->orderBy('id')->get();

        if ($lessons->isEmpty()) {
            $this->info('لا توجد دروس لربطها.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($lessons->count());
        $bar->start();

        foreach ($lessons as $lesson) {
            $builder->attachExistingContent($lesson);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('تم ربط كتل جميع الدروس بنجاح.');

        return self::SUCCESS;
    }
}
