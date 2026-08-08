<?php

namespace Tests\Feature\Exam;

use PHPUnit\Framework\Attributes\Test;

class BlueprintManagementTest extends BaseExamTestCase
{
    #[Test]
    public function guest_cannot_access_blueprint_endpoints(): void
    {
        $this->getJson('/api/admin/exam-blueprints')->assertStatus(401);
    }

    #[Test]
    public function student_cannot_access_admin_blueprint_endpoints(): void
    {
        $this->actingAs($this->student)
            ->getJson('/api/admin/exam-blueprints')
            ->assertStatus(403);
    }

    #[Test]
    public function admin_can_create_lesson_blueprint(): void
    {
        $this->actingAs($this->admin);

        $response = $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'lesson',
            'title' => 'امتحان درس الجمع',
            'lesson_id' => $this->lessonOne->id,
            'duration_minutes' => 25,
            'attempts_allowed' => 3,
            'easy_count' => 2,
            'medium_count' => 1,
            'hard_count' => 0,
            'pass_threshold_percent' => 60,
            'show_review_after_submit' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'امتحان درس الجمع')
            ->assertJsonPath('data.total_questions', 3);
    }

    #[Test]
    public function lesson_blueprint_without_lesson_is_rejected(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'lesson',
            'title' => 'بلا درس',
            'duration_minutes' => 30,
            'easy_count' => 1,
        ])->assertStatus(422);
    }

    #[Test]
    public function lesson_blueprint_with_foreign_scope_columns_is_rejected(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'lesson',
            'title' => 'نطاق خاطئ',
            'duration_minutes' => 30,
            'easy_count' => 1,
            'lesson_id' => $this->lessonOne->id,
            'subject_id' => $this->subject->id,
        ])->assertStatus(422);
    }

    #[Test]
    public function zero_questions_blueprint_is_rejected(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'lesson',
            'title' => 'بلا أسئلة',
            'lesson_id' => $this->lessonOne->id,
            'duration_minutes' => 30,
            'easy_count' => 0,
            'medium_count' => 0,
            'hard_count' => 0,
        ])->assertStatus(422);
    }

    #[Test]
    public function admin_can_create_unit_blueprint(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'unit',
            'title' => 'امتحان الوحدة',
            'course_id' => $this->courseOne->id,
            'duration_minutes' => 40,
            'attempts_allowed' => 2,
            'easy_count' => 1,
            'medium_count' => 1,
            'hard_count' => 1,
            'pass_threshold_percent' => 60,
        ])->assertStatus(201)->assertJsonPath('data.exam_type', 'unit');
    }

    #[Test]
    public function admin_can_create_monthly_blueprint(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'monthly',
            'title' => 'امتحان شهر أكتوبر',
            'subject_id' => $this->subject->id,
            'month_no' => 10,
            'duration_minutes' => 40,
            'attempts_allowed' => 2,
            'easy_count' => 1,
            'medium_count' => 1,
            'pass_threshold_percent' => 60,
        ])->assertStatus(201)->assertJsonPath('data.exam_type', 'monthly');
    }

    #[Test]
    public function monthly_blueprint_without_month_is_rejected(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'monthly',
            'title' => 'شهري بدون شهر',
            'subject_id' => $this->subject->id,
            'duration_minutes' => 40,
            'easy_count' => 1,
        ])->assertStatus(422);
    }

    #[Test]
    public function admin_can_create_semester_blueprint(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'semester',
            'title' => 'امتحان الفصل',
            'subject_id' => $this->subject->id,
            'duration_minutes' => 60,
            'attempts_allowed' => 2,
            'easy_count' => 2,
            'medium_count' => 1,
            'pass_threshold_percent' => 60,
        ])->assertStatus(201)->assertJsonPath('data.exam_type', 'semester');
    }

    #[Test]
    public function admin_can_create_full_blueprint_by_grade(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'full',
            'title' => 'الامتحان الشامل',
            'grade_id' => $this->grade->id,
            'duration_minutes' => 120,
            'attempts_allowed' => 2,
            'easy_count' => 3,
            'medium_count' => 2,
            'hard_count' => 1,
            'pass_threshold_percent' => 60,
        ])->assertStatus(201)->assertJsonPath('data.exam_type', 'full');
    }

    #[Test]
    public function full_blueprint_requires_grade_or_stage(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/exam-blueprints', [
            'exam_type' => 'full',
            'title' => 'شامل بدون نطاق',
            'duration_minutes' => 120,
            'easy_count' => 1,
        ])->assertStatus(422);
    }

    #[Test]
    public function admin_can_update_and_delete_blueprint(): void
    {
        $this->actingAs($this->admin);
        $blueprint = $this->makeBlueprint();

        $this->putJson("/api/admin/exam-blueprints/{$blueprint->id}", [
            'exam_type' => 'lesson',
            'title' => 'عنوان محدّث',
            'lesson_id' => $this->lessonOne->id,
            'duration_minutes' => 45,
            'attempts_allowed' => 2,
            'easy_count' => 1,
            'medium_count' => 0,
            'hard_count' => 0,
            'pass_threshold_percent' => 60,
        ])->assertOk()->assertJsonPath('data.title', 'عنوان محدّث');

        $this->deleteJson("/api/admin/exam-blueprints/{$blueprint->id}")
            ->assertOk();

        $this->assertDatabaseMissing('exam_blueprints', ['id' => $blueprint->id]);
    }

    #[Test]
    public function blueprint_total_questions_equals_counts_sum(): void
    {
        $this->actingAs($this->admin);
        $blueprint = $this->makeBlueprint(['easy_count' => 2, 'medium_count' => 1, 'hard_count' => 1]);

        $response = $this->getJson("/api/admin/exam-blueprints/{$blueprint->id}");

        $response->assertOk()->assertJsonPath('data.total_questions', 4);
    }
}
