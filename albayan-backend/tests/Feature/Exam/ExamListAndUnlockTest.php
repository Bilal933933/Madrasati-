<?php

namespace Tests\Feature\Exam;

use App\Domains\Exam\Models\ExamBlueprint;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

class ExamListAndUnlockTest extends BaseExamTestCase
{
    #[Test]
    public function guest_cannot_list_exams(): void
    {
        $this->getJson('/api/exams')->assertStatus(401);
    }

    #[Test]
    public function list_returns_only_active_blueprints_with_unlock_state(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();

        $this->makeBlueprint(); // نشط
        $this->makeBlueprint(['title' => 'امتحان معطّل', 'is_active' => false]);

        $response = $this->actingAs($this->student)->getJson('/api/exams');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'امتحان الدرس')
            ->assertJsonPath('data.0.unlock_progress.unlocked', true)
            ->assertJsonPath('data.0.unlock_progress.completed', 1)
            ->assertJsonPath('data.0.unlock_progress.total', 1);
    }

    #[Test]
    public function list_reports_locked_state_before_completion(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->makeBlueprint();

        $response = $this->actingAs($this->student)->getJson('/api/exams');

        $response->assertOk()
            ->assertJsonPath('data.0.unlock_progress.unlocked', false)
            ->assertJsonPath('data.0.unlock_progress.completed', 0)
            ->assertJsonPath('data.0.unlock_progress.total', 1);
    }

    #[Test]
    public function show_reports_attempts_left_and_best_score(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->completeScopeForStudent();
        $blueprint = $this->makeBlueprint(['easy_count' => 1]);

        $this->actingAs($this->student);

        $attempt = $this->postJson("/api/exams/{$blueprint->id}/start")->json('data');
        $this->postJson("/api/exams/attempts/{$attempt['id']}/submit")->assertOk();

        $response = $this->getJson("/api/exams/{$blueprint->id}");

        $response->assertOk()
            ->assertJsonPath('data.attempts_left', 1)
            ->assertJsonPath('data.best_score', $attempt['score_percentage'] ?? 0);
    }

    /* --------------------- نطاقات الفتح (الأنواع الخمسة) --------------------- */

    #[DataProvider('scopeTypes')]
    #[Test]
    public function unlock_scope_sets(string $scopeLabel, callable $createBlueprint): void
    {
        $this->makeMcq($this->lessonOne);
        $this->makeMcq($this->lessonTwo);
        $this->makeMcq($this->lessonThree);

        $this->completeScopeForStudent($this->lessonOne);
        $this->completeLessonFor($this->student, $this->lessonTwo);
        $this->completeLessonFor($this->student, $this->lessonThree);

        $blueprint = $createBlueprint($this);

        $response = $this->actingAs($this->student)->getJson("/api/exams/{$blueprint->id}");

        $response->assertOk()
            ->assertJsonPath('data.title', $blueprint->title)
            ->assertJsonPath('data.unlock_progress.unlocked', true)
            ->assertJsonPath('data.total_questions', $blueprint->easy_count + $blueprint->medium_count + $blueprint->hard_count);
    }

    #[Test]
    public function unit_scope_requires_only_lessons_of_that_course(): void
    {
        $this->makeMcq($this->lessonOne);
        $this->makeMcq($this->lessonTwo);

        // إكمال درسي "الأعداد" فقط — الوحدة تُفتح دون إكمال "الهندسة"
        $this->completeLessonFor($this->student, $this->lessonOne);
        $this->completeLessonFor($this->student, $this->lessonTwo);

        $blueprint = ExamBlueprint::create([
            'exam_type' => 'unit',
            'title' => 'امتحان وحدة الأعداد',
            'course_id' => $this->courseOne->id,
            'duration_minutes' => 30,
            'easy_count' => 1,
            'medium_count' => 0,
            'hard_count' => 0,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->student)->getJson("/api/exams/{$blueprint->id}");

        $response->assertOk()
            ->assertJsonPath('data.unlock_progress.unlocked', true)
            ->assertJsonPath('data.unlock_progress.total', 2);
    }

    /* ---------------------- بيانات موفّمة للنطاقات الأخرى ---------------------- */

    public static function scopeTypes(): array
    {
        return [
            'lesson' => ['lesson', function ($case) {
                return $case->makeBlueprint([
                    'title' => 'امتحان الدرس — نطاق',
                    'easy_count' => 1,
                ]);
            }],
            'unit' => ['unit', function ($case) {
                return ExamBlueprint::create([
                    'exam_type' => 'unit',
                    'title' => 'امتحان الوحدة — نطاق',
                    'course_id' => $case->courseOne->id,
                    'duration_minutes' => 30,
                    'easy_count' => 1,
                    'medium_count' => 0,
                    'hard_count' => 0,
                    'is_active' => true,
                ]);
            }],
            'monthly' => ['monthly', function ($case) {
                return ExamBlueprint::create([
                    'exam_type' => 'monthly',
                    'title' => 'امتحان الشهر — نطاق',
                    'subject_id' => $case->subject->id,
                    'month_no' => 1,
                    'duration_minutes' => 30,
                    'easy_count' => 1,
                    'medium_count' => 0,
                    'hard_count' => 0,
                    'is_active' => true,
                ]);
            }],
            'semester' => ['semester', function ($case) {
                return ExamBlueprint::create([
                    'exam_type' => 'semester',
                    'title' => 'امتحان الفصل — نطاق',
                    'subject_id' => $case->subject->id,
                    'duration_minutes' => 30,
                    'easy_count' => 1,
                    'medium_count' => 0,
                    'hard_count' => 0,
                    'is_active' => true,
                ]);
            }],
            'full' => ['full', function ($case) {
                return ExamBlueprint::create([
                    'exam_type' => 'full',
                    'title' => 'الامتحان الشامل — نطاق',
                    'grade_id' => $case->grade->id,
                    'duration_minutes' => 30,
                    'easy_count' => 1,
                    'medium_count' => 0,
                    'hard_count' => 0,
                    'is_active' => true,
                ]);
            }],
        ];
    }
}
