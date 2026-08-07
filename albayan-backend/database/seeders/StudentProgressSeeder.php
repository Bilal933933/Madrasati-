<?php

namespace Database\Seeders;

use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Grade;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

/**
 * يربط الطالب التجريبي بتقدّم واقعي في دروس فصله:
 * - اللغة العربية: مكتملة جزئيًا (مقرر كامل + درس بدأ ولم يُكمل) → in_progress.
 * - الرياضيات: مكتملة كليًا → completed.
 * - بقية المواد بلا نشاط → not_started.
 *
 * يُستدعى بعد بذر المنهج والدروس (الدروس موجودة) — فلا يمكن دمجه قبلها.
 */
class StudentProgressSeeder extends Seeder
{
    public function run(): void
    {
        $student = User::firstOrCreate(
            ['email' => 'student@example.com'],
            ['name' => 'طالب تجريبي', 'password' => 'password'],
        );

        $grade = Grade::findOrFail(SeedRegistry::$grades['primary_4']);
        $semester = $grade->semesters()->orderBy('sort_order')->firstOrFail();

        $subjects = $semester->subjects()
            ->where('is_published', true)
            ->with(['courses' => fn ($q) => $q
                ->where('is_published', true)
                ->orderBy('sort_order')
                ->with(['lessons' => fn ($q) => $q
                    ->where('is_published', true)
                    ->orderBy('sort_order')])])
            ->get();

        $arabic = $subjects->firstWhere('name', 'اللغة العربية');

        if ($arabic) {
            // المقرر الأول (النحو) مكتمل كاملًا.
            $firstCourse = $arabic->courses->sortBy('sort_order')->first();
            foreach ($firstCourse?->lessons ?? [] as $lesson) {
                $student->lessonCompletions()->updateOrCreate(
                    ['lesson_id' => $lesson->id],
                    ['started_at' => now(), 'completed_at' => now()],
                );
            }

            // أول درس في المقرر الثاني بدأ ولم يُكمل بعد — يُظهر "آخر درس".
            $secondCourse = $arabic->courses->sortBy('sort_order')->get(1);
            $firstLesson = $secondCourse?->lessons->sortBy('sort_order')->first();

            if ($firstLesson) {
                $student->lessonCompletions()->updateOrCreate(
                    ['lesson_id' => $firstLesson->id],
                    ['started_at' => now()],
                );
            }
        }

        $math = $subjects->firstWhere('name', 'الرياضيات');

        if ($math) {
            // الرياضيات مكتملة كليًا.
            foreach ($math->courses as $course) {
                foreach ($course->lessons as $lesson) {
                    $student->lessonCompletions()->updateOrCreate(
                        ['lesson_id' => $lesson->id],
                        ['started_at' => now(), 'completed_at' => now()],
                    );
                }
            }
        }
    }
}
