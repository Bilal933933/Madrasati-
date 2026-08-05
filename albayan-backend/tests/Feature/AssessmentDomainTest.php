<?php

namespace Tests\Feature;

use App\Domains\Assessment\Models\Assessment;
use App\Domains\Assessment\Models\Option;
use App\Domains\Assessment\Models\Question;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Models\Lesson;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentDomainTest extends TestCase
{
    use RefreshDatabase;

    private function seedAssessmentTree(): int
    {
        $stage = Stage::create(['name' => 'الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $grade = Grade::create(['stage_id' => $stage->id, 'name' => 'الأول', 'sort_order' => 1, 'is_published' => true]);
        $subject = Subject::create(['grade_id' => $grade->id, 'name' => 'الرياضيات', 'sort_order' => 1, 'is_published' => true]);
        $course = Course::create(['subject_id' => $subject->id, 'name' => 'الوحدة الأولى', 'sort_order' => 1, 'is_published' => true]);
        $lesson = Lesson::create(['course_id' => $course->id, 'title' => 'درس الجمع', 'sort_order' => 1, 'is_published' => true]);

        $assessment = Assessment::create(['lesson_id' => $lesson->id, 'type' => 'pre', 'title' => 'مبدئي', 'sort_order' => 1]);
        $q1 = Question::create(['assessment_id' => $assessment->id, 'type' => 'mcq', 'content' => 'كم يساوي 2+2؟', 'explanation' => 'لأن 2+2=4', 'sort_order' => 1]);
        Option::create(['question_id' => $q1->id, 'content' => '4', 'is_correct' => true, 'sort_order' => 1]);
        Option::create(['question_id' => $q1->id, 'content' => '3', 'is_correct' => false, 'sort_order' => 2]);
        Question::create(['assessment_id' => $assessment->id, 'type' => 'true_false', 'content' => 'الأرض كروية', 'correct_answer' => true, 'sort_order' => 2]);

        return $assessment->id;
    }

    public function test_admin_sees_correct_answers(): void
    {
        $admin = User::create(['name' => 'مدير', 'email' => 'admin@test.com', 'password' => 'secret']);
        $admin->role = 'admin';
        $admin->save();
        $id = $this->seedAssessmentTree();

        $this->actingAs($admin);

        $response = $this->getJson("/api/admin/assessments/{$id}");
        $response->assertStatus(200);

        $json = $response->json('data');
        $this->assertTrue($json['questions'][0]['options'][0]['is_correct'] === true, 'المشرف يجب أن يرى is_correct');
        $this->assertSame(true, $json['questions'][1]['correct_answer'], 'المشرف يجب أن يرى correct_answer');
    }

    public function test_student_never_sees_correct_answers(): void
    {
        $student = User::create(['name' => 'طالب', 'email' => 'student@test.com', 'password' => 'secret', 'role' => 'student']);
        $id = $this->seedAssessmentTree();

        $this->actingAs($student);

        $response = $this->getJson("/api/assessments/{$id}");
        $response->assertStatus(200);

        $json = $response->json('data');
        $this->assertArrayNotHasKey('is_correct', $json['questions'][0]['options'][0], 'الطالب يجب ألا يرى is_correct');
        $this->assertArrayNotHasKey('correct_answer', $json['questions'][1], 'الطالب يجب ألا يرى correct_answer');
    }
}
