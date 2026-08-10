<?php

namespace Tests\Feature;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Domains\Lesson\Services\LessonService;
use App\Support\ExploreCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ExploreDomainTest extends TestCase
{
    use RefreshDatabase;

    private function seedTree(): array
    {
        $stage = Stage::create(['key' => 'primary', 'name' => 'المرحلة الابتدائية', 'sort_order' => 1, 'is_published' => true]);
        $grade = Grade::create(['stage_id' => $stage->id, 'key' => 'grade-1', 'name' => 'الصف الأول', 'sort_order' => 1, 'is_published' => true]);
        $semester = Semester::create(['grade_id' => $grade->id, 'key' => 'semester-1', 'name' => 'الفصل الأول', 'sort_order' => 0]);
        $subject = Subject::create(['grade_id' => $grade->id, 'semester_id' => $semester->id, 'name' => 'الرياضيات', 'slug' => 'math', 'sort_order' => 1, 'is_published' => true]);
        $course = Course::create(['subject_id' => $subject->id, 'name' => 'الوحدة الأولى', 'description' => 'مفاهيم أساسية', 'sort_order' => 1, 'is_published' => true]);

        return compact('stage', 'grade', 'semester', 'subject', 'course');
    }

    public function test_explore_is_public_and_returns_stages_with_keys(): void
    {
        $this->seedTree();

        $response = $this->getJson('/api/explore/stages');
        $response->assertStatus(200);

        $this->assertSame('primary', $response->json('data.0.key'));
        $this->assertSame(1, $response->json('data.0.grades_count'));
    }

    public function test_grades_by_stage_key(): void
    {
        $this->seedTree();

        $response = $this->getJson('/api/explore/stages/primary/grades');
        $response->assertStatus(200);

        $this->assertSame('grade-1', $response->json('data.0.key'));
        $this->assertSame(1, $response->json('data.0.semesters_count'));
    }

    public function test_semesters_by_grade_key(): void
    {
        $this->seedTree();

        $response = $this->getJson('/api/explore/stages/primary/grades/grade-1/semesters');
        $response->assertStatus(200);

        $this->assertSame('semester-1', $response->json('data.0.key'));
        $this->assertSame(1, $response->json('data.0.subjects_count'));
    }

    public function test_subjects_with_dynamic_counts(): void
    {
        $tree = $this->seedTree();
        app(LessonService::class)->createLesson([
            'course_id' => $tree['course']->id,
            'title' => 'درس الجمع',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/explore/stages/primary/grades/grade-1/semesters/semester-1/subjects');
        $response->assertStatus(200);

        $subject = $response->json('data.0');
        $this->assertSame('math', $subject['slug']);
        $this->assertSame(1, $subject['units_count']);
        $this->assertSame(1, $subject['lessons_count']);
        $this->assertNotEmpty($subject['description']);
    }

    public function test_subject_detail_deep_link_by_slug(): void
    {
        $tree = $this->seedTree();

        $response = $this->getJson('/api/explore/subjects/math');
        $response->assertStatus(200);

        $json = $response->json('data');
        $this->assertSame('الرياضيات', $json['name']);
        $this->assertSame('الوحدة الأولى', $json['units'][0]['name']);
    }

    public function test_lesson_preview_is_public_and_derives_duration_and_counts(): void
    {
        $tree = $this->seedTree();
        $lesson = app(LessonService::class)->createLesson([
            'course_id' => $tree['course']->id,
            'title' => 'درس الجمع',
            'summary' => 'نظرة عامة على الجمع',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $response = $this->getJson("/api/lessons/{$lesson->slug}/preview");
        $response->assertStatus(200);

        $preview = $response->json('data');
        $this->assertSame('درس الجمع', $preview['title']);
        $this->assertSame('الوحدة الأولى', $preview['unit']);
        $this->assertSame(3, $preview['blocks_count']);
        $this->assertSame(2, $preview['assessment_count']);
        $this->assertGreaterThanOrEqual(1, $preview['duration']);
    }

    public function test_unknown_stage_key_returns_404(): void
    {
        $this->seedTree();

        $this->getJson('/api/explore/stages/unknown/grades')->assertStatus(404);
    }

    public function test_explore_response_is_cached_as_plain_arrays(): void
    {
        $this->seedTree();

        $this->getJson('/api/explore/stages')->assertOk();

        $key = ExploreCache::key('stages');
        $this->assertTrue(Cache::has($key), 'يجب أن يُخزَّن خرج الاستكشاف في الكاش.');

        $cached = Cache::get($key);
        $this->assertIsArray($cached);
        $this->assertSame('primary', $cached[0]['key'] ?? null);
    }

    public function test_explore_cache_is_invalidated_when_content_changes(): void
    {
        $this->seedTree();

        $this->getJson('/api/explore/stages')->assertOk();
        $generationBefore = (int) Cache::get('explore.generation', 0);

        $stage = Stage::query()->firstOrFail();
        $stage->update(['name' => 'المرحلة الابتدائية (محدث)']);

        $this->assertGreaterThan(
            $generationBefore,
            (int) Cache::get('explore.generation'),
            'تعديل المنهج يجب أن يرفع جيل الكاش.'
        );

        $this->getJson('/api/explore/stages')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'المرحلة الابتدائية (محدث)');
    }
}
