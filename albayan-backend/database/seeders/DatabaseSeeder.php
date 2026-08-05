<?php

namespace Database\Seeders;

use App\Domains\Assessment\Models\Assessment;
use App\Domains\Assessment\Models\Option;
use App\Domains\Assessment\Models\Question;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Models\Paragraph;
use App\Support\Slugger;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    private const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    public function run(): void
    {
        $this->seedUsers();
        $this->seedCurriculum();
    }

    private function seedUsers(): void
    {
        foreach (['admin@example.com' => 'مدير المنصة', 'blalalnjar294@gmail.com' => 'بلال النجار'] as $email => $name) {
            $admin = User::firstOrCreate(['email' => $email], [
                'name' => $name,
                'password' => Hash::make('password'),
            ]);
            $admin->role = 'admin';
            $admin->save();
        }

        User::firstOrCreate(['email' => 'student@example.com'], [
            'name' => 'طالب تجريبي',
            'password' => Hash::make('password'),
        ]);
    }

    private function seedCurriculum(): void
    {
        $stages = [
            ['name' => 'المرحلة الابتدائية', 'icon' => 'School', 'color' => '#10b981'],
            ['name' => 'المرحلة الإعدادية', 'icon' => 'BookOpen', 'color' => '#3b82f6'],
            ['name' => 'المرحلة الثانوية', 'icon' => 'GraduationCap', 'color' => '#8b5cf6'],
        ];

        $gradesByStage = [
            'المرحلة الابتدائية' => [
                'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي',
                'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
            ],
            'المرحلة الإعدادية' => ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'],
            'المرحلة الثانوية' => ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'],
        ];

        $subjectsByStage = [
            'المرحلة الابتدائية' => [
                ['name' => 'اللغة العربية', 'icon' => 'BookMarked', 'color' => '#f59e0b'],
                ['name' => 'اللغة الإنجليزية', 'icon' => 'Languages', 'color' => '#06b6d4'],
                ['name' => 'الرياضيات', 'icon' => 'Calculator', 'color' => '#ef4444'],
                ['name' => 'العلوم', 'icon' => 'Atom', 'color' => '#22c55e'],
                ['name' => 'الدراسات الاجتماعية', 'icon' => 'Globe2', 'color' => '#a855f7'],
                ['name' => 'المهارات المهنية', 'icon' => 'Wrench', 'color' => '#64748b'],
                ['name' => 'التربية الدينية', 'icon' => 'Landmark', 'color' => '#84cc16'],
            ],
            'المرحلة الإعدادية' => [
                ['name' => 'اللغة العربية', 'icon' => 'BookMarked', 'color' => '#f59e0b'],
                ['name' => 'اللغة الإنجليزية', 'icon' => 'Languages', 'color' => '#06b6d4'],
                ['name' => 'الرياضيات', 'icon' => 'Calculator', 'color' => '#ef4444'],
                ['name' => 'العلوم', 'icon' => 'FlaskConical', 'color' => '#22c55e'],
                ['name' => 'الدراسات الاجتماعية', 'icon' => 'Globe2', 'color' => '#a855f7'],
                ['name' => 'الحاسب الآلي', 'icon' => 'Cpu', 'color' => '#6366f1'],
                ['name' => 'التربية الدينية', 'icon' => 'Landmark', 'color' => '#84cc16'],
            ],
            'المرحلة الثانوية' => [
                ['name' => 'اللغة العربية', 'icon' => 'BookMarked', 'color' => '#f59e0b'],
                ['name' => 'اللغة الإنجليزية', 'icon' => 'Languages', 'color' => '#06b6d4'],
                ['name' => 'اللغة الفرنسية', 'icon' => 'Languages', 'color' => '#0ea5e9'],
                ['name' => 'الرياضيات', 'icon' => 'FunctionSquare', 'color' => '#ef4444'],
                ['name' => 'الفيزياء', 'icon' => 'Atom', 'color' => '#3b82f6'],
                ['name' => 'الكيمياء', 'icon' => 'TestTube', 'color' => '#22c55e'],
                ['name' => 'الأحياء', 'icon' => 'Microscope', 'color' => '#10b981'],
                ['name' => 'التاريخ', 'icon' => 'Landmark', 'color' => '#a855f7'],
                ['name' => 'الجغرافيا', 'icon' => 'Globe2', 'color' => '#f97316'],
                ['name' => 'الفلسفة والمنطق', 'icon' => 'Brain', 'color' => '#64748b'],
            ],
        ];

        foreach ($stages as $stageIndex => $stageData) {
            $stage = Stage::create(array_merge($stageData, ['sort_order' => $stageIndex]));
            $stage->slug = Slugger::from($stage->name, $stage->id);
            $stage->save();

            foreach ($gradesByStage[$stage->name] as $gradeIndex => $gradeName) {
                $grade = Grade::create([
                    'stage_id' => $stage->id,
                    'name' => $gradeName,
                    'sort_order' => $gradeIndex,
                ]);
                $grade->slug = Slugger::from($grade->name, $grade->id);
                $grade->save();

                foreach (['الفصل الدراسي الأول', 'الفصل الدراسي الثاني'] as $semesterIndex => $semesterName) {
                    $semester = Semester::create([
                        'grade_id' => $grade->id,
                        'name' => $semesterName,
                        'sort_order' => $semesterIndex,
                    ]);

                    foreach ($subjectsByStage[$stage->name] as $subjectIndex => $subjectData) {
                        $subject = Subject::create([
                            'grade_id' => $grade->id,
                            'semester_id' => $semester->id,
                            'name' => $subjectData['name'],
                            'icon' => $subjectData['icon'],
                            'color' => $subjectData['color'],
                            'sort_order' => $subjectIndex,
                        ]);
                        $subject->slug = Slugger::from($subject->name, $subject->id);
                        $subject->save();

                        $course = Course::create([
                            'subject_id' => $subject->id,
                            'name' => $semesterIndex === 0 ? 'الوحدة الأولى' : 'الوحدة الثانية',
                            'description' => $semesterIndex === 0
                                ? 'محتوى الفصل الدراسي الأول لـ '.$subjectData['name'].' — التعرف على المفاهيم الأساسية وتطبيقاتها.'
                                : 'محتوى الفصل الدراسي الثاني لـ '.$subjectData['name'].' — تعميق الفهم وتمارين محلولة.',
                            'icon' => $subject->icon,
                            'color' => $subject->color,
                            'sort_order' => 0,
                        ]);
                        $course->slug = Slugger::from($course->name, $course->id);
                        $course->save();

                        foreach ($this->lessonTitles() as $lessonIndex => $lessonTitle) {
                            $lesson = Lesson::create([
                                'course_id' => $course->id,
                                'title' => $lessonTitle,
                                'summary' => "ملخص {$lessonTitle}: نتعرف من خلاله على أهم المفاهيم بأسلوب مبسط ومنظم.",
                                'video' => $lessonIndex === 0 ? self::SAMPLE_VIDEO : null,
                                'icon' => $subject->icon,
                                'color' => $subject->color,
                                'sort_order' => $lessonIndex,
                            ]);
                            $lesson->slug = Slugger::from($lesson->title, $lesson->id);
                            $lesson->save();

                            $this->seedParagraphs($lesson);
                            $this->seedAssessment($lesson);
                        }
                    }
                }
            }
        }
    }

    private function seedParagraphs(Lesson $lesson): void
    {
        $paragraphs = [
            [
                'title' => 'مقدمة',
                'type' => 'text',
                'content' => '<h2>مقدمة</h2><p>في هذا الجزء نتعرف على المفاهيم الأساسية للدرس بشكل مبسط وواضح.</p><ul><li>الفكرة الأولى</li><li>الفكرة الثانية</li><li>الفكرة الثالثة</li></ul>',
            ],
            [
                'title' => 'الشرح المفصل',
                'type' => 'video',
                'video' => $lesson->video,
                'content' => '<h2>الشرح المفصل</h2><p>شاهد الفيديو التوضيحي ثم راجع الملخص التالي لترسيخ المعلومة.</p>',
            ],
        ];

        foreach ($paragraphs as $index => $data) {
            $paragraph = Paragraph::create(array_merge($data, [
                'lesson_id' => $lesson->id,
                'sort_order' => $index,
            ]));
            $paragraph->slug = Slugger::from($paragraph->title, $paragraph->id);
            $paragraph->save();
        }
    }

    private function seedAssessment(Lesson $lesson): void
    {
        $assessment = Assessment::create([
            'lesson_id' => $lesson->id,
            'type' => 'formative',
            'title' => "تقييم {$lesson->title}",
            'sort_order' => 0,
        ]);

        $mcq = Question::create([
            'assessment_id' => $assessment->id,
            'type' => 'mcq',
            'content' => 'أي مما يلي يُعد من أبرز النقاط التي تمت دراستها في هذا الدرس؟',
            'explanation' => 'الخيار الأول هو الإجابة الصحيحة وفق ما ورد في الدرس.',
            'sort_order' => 0,
        ]);

        foreach (['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'] as $index => $text) {
            Option::create([
                'question_id' => $mcq->id,
                'content' => $text,
                'is_correct' => $index === 0,
                'sort_order' => $index,
            ]);
        }

        Question::create([
            'assessment_id' => $assessment->id,
            'type' => 'true_false',
            'content' => 'صح أم خطأ: هذا الدرس جزء من المقرر الدراسي المعتمد.',
            'explanation' => 'الدرس جزء من المقرر الدراسي، وبالتالي العبارة صحيحة.',
            'correct_answer' => true,
            'sort_order' => 1,
        ]);
    }

    private function lessonTitles(): array
    {
        return ['الدرس الأول', 'الدرس الثاني'];
    }
}
