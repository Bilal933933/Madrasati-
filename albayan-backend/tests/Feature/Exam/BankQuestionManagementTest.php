<?php

namespace Tests\Feature\Exam;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

class BankQuestionManagementTest extends BaseExamTestCase
{
    #[Test]
    public function guest_cannot_access_bank_question_endpoints(): void
    {
        $this->getJson('/api/admin/bank-questions')->assertStatus(401);
    }

    #[Test]
    public function student_cannot_access_admin_bank_question_endpoints(): void
    {
        $this->actingAs($this->student)
            ->getJson('/api/admin/bank-questions')
            ->assertStatus(403);
    }

    #[Test]
    public function admin_can_create_mcq_with_options(): void
    {
        $this->actingAs($this->admin);

        $response = $this->postJson('/api/admin/bank-questions', [
            'lesson_id' => $this->lessonOne->id,
            'type' => 'mcq',
            'content' => 'ما عاصمة فرنسا؟',
            'difficulty' => 'medium',
            'options' => [
                ['content' => 'باريس', 'is_correct' => true],
                ['content' => 'لندن', 'is_correct' => false],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.content', 'ما عاصمة فرنسا؟')
            ->assertJsonCount(2, 'data.options');

        $this->assertDatabaseHas('bank_question_options', [
            'content' => 'باريس',
            'is_correct' => true,
        ]);
    }

    #[Test]
    public function admin_can_create_true_false_question(): void
    {
        $this->actingAs($this->admin);

        $response = $this->postJson('/api/admin/bank-questions', [
            'lesson_id' => $this->lessonOne->id,
            'type' => 'true_false',
            'content' => 'الشمس تشرق من الشرق',
            'difficulty' => 'easy',
            'correct_answer' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.correct_answer', true);
    }

    #[Test]
    public function true_false_question_without_answer_is_rejected(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/bank-questions', [
            'lesson_id' => $this->lessonOne->id,
            'type' => 'true_false',
            'content' => 'عبارة بلاحسم',
            'difficulty' => 'easy',
        ])->assertStatus(422);
    }

    #[Test]
    public function mcq_question_requires_options(): void
    {
        $this->actingAs($this->admin);

        $this->postJson('/api/admin/bank-questions', [
            'lesson_id' => $this->lessonOne->id,
            'type' => 'mcq',
            'content' => 'سؤال بدون خيارات',
            'difficulty' => 'easy',
        ])->assertStatus(422);
    }

    #[Test]
    public function admin_can_update_question_with_options_replacement(): void
    {
        $this->actingAs($this->admin);

        $question = $this->makeMcq($this->lessonOne);

        $this->putJson("/api/admin/bank-questions/{$question->id}", [
            'lesson_id' => $this->lessonOne->id,
            'type' => 'mcq',
            'content' => 'نص محدّث',
            'difficulty' => 'hard',
            'options' => [
                ['content' => 'جديد أ', 'is_correct' => true],
                ['content' => 'جديد ب', 'is_correct' => false],
            ],
        ])->assertOk()->assertJsonPath('data.content', 'نص محدّث');

        $this->assertSame(2, $question->options()->count());
    }

    #[Test]
    public function admin_can_delete_bank_question(): void
    {
        $this->actingAs($this->admin);

        $question = $this->makeTrueFalse($this->lessonOne);

        $this->deleteJson("/api/admin/bank-questions/{$question->id}")
            ->assertOk();

        $this->assertDatabaseMissing('bank_questions', ['id' => $question->id]);
    }

    #[DataProvider('validTypesAndDifficulty')]
    #[Test]
    public function list_filters_by_type_and_difficulty(string $type, string $difficulty): void
    {
        $this->actingAs($this->admin);
        $this->makeMcq($this->lessonOne);
        $this->makeTrueFalse($this->lessonOne);

        $response = $this->getJson('/api/admin/bank-questions?type='.$type.'&difficulty='.$difficulty);

        $response->assertOk();
    }

    public static function validTypesAndDifficulty(): array
    {
        return [
            'mcq_easy' => ['mcq', 'easy'],
            'true_false_medium' => ['true_false', 'medium'],
        ];
    }
}
