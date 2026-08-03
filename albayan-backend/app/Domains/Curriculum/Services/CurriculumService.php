<?php

namespace App\Domains\Curriculum\Services;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Section;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Support\Slugger;
use Illuminate\Database\Eloquent\Collection;

/**
 * ظ…ظ†ط·ظ‚ ط¹ظ…ظ„ظٹط§طھ ط¯ظˆظ…ظٹظ† ط§ظ„ظ…ظ†ظ‡ط¬ (Curriculum).
 * ط¹ظ…ظ„ظٹط§طھ ط¨ط³ظٹط·ط© ظˆظ…طھط±ط§ط¨ط·ط© â€” ظ„ط°ظ„ظƒ ظ†ط³طھط®ط¯ظ… ظ†ظ…ط· Service ط¨ط¯ظ„ظ‹ط§ ظ…ظ† Action.
 */
class CurriculumService
{
    /* ---------------------------------- Stages ---------------------------------- */

    public function stages(): Collection
    {
        return Stage::query()->orderBy('sort_order')->get();
    }

    public function publishedStages(): Collection
    {
        return Stage::query()
            ->where('is_published', true)
            ->with(['grades' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();
    }

    public function findStage(int $id): Stage
    {
        return Stage::findOrFail($id);
    }

    public function findPublishedStage(int $id): Stage
    {
        return Stage::query()
            ->where('is_published', true)
            ->with(['grades' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function findPublishedStageBySlug(string $slug): Stage
    {
        return Stage::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->with(['grades' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->firstOrFail();
    }

    public function createStage(array $data): Stage
    {
        $stage = Stage::create($data);

        if (empty($stage->slug)) {
            $stage->forceFill(['slug' => Slugger::from($stage->name, $stage->id)])->save();
        }

        return $stage;
    }

    public function updateStage(int $id, array $data): Stage
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $stage = Stage::findOrFail($id);
        $stage->update($data);

        return $stage;
    }

    public function deleteStage(int $id): void
    {
        Stage::findOrFail($id)->delete();
    }

    /* ---------------------------------- Grades ---------------------------------- */

    public function grades(): Collection
    {
        return Grade::query()->orderBy('sort_order')->get();
    }

    public function publishedGrades(): Collection
    {
        return Grade::query()
            ->where('is_published', true)
            ->whereHas('stage', fn ($q) => $q->where('is_published', true))
            ->with(['subjects' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();
    }

    public function findGrade(int $id): Grade
    {
        return Grade::findOrFail($id);
    }

    public function findPublishedGrade(int $id): Grade
    {
        return Grade::query()
            ->where('is_published', true)
            ->whereHas('stage', fn ($q) => $q->where('is_published', true))
            ->with(['subjects' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function findPublishedGradeBySlug(string $slug): Grade
    {
        return Grade::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->whereHas('stage', fn ($q) => $q->where('is_published', true))
            ->with(['subjects' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->firstOrFail();
    }

    public function createGrade(array $data): Grade
    {
        $grade = Grade::create($data);

        if (empty($grade->slug)) {
            $grade->forceFill(['slug' => Slugger::from($grade->name, $grade->id)])->save();
        }

        return $grade;
    }

    public function updateGrade(int $id, array $data): Grade
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $grade = Grade::findOrFail($id);
        $grade->update($data);

        return $grade;
    }

    public function deleteGrade(int $id): void
    {
        Grade::findOrFail($id)->delete();
    }

    /* --------------------------------- Subjects --------------------------------- */

    public function subjects(): Collection
    {
        return Subject::query()->orderBy('sort_order')->get();
    }

    public function publishedSubjects(): Collection
    {
        return Subject::query()
            ->where('is_published', true)
            ->whereHas('grade', fn ($q) => $q->where('is_published', true)
                ->whereHas('stage', fn ($q2) => $q2->where('is_published', true)))
            ->with(['sections' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();
    }

    public function findSubject(int $id): Subject
    {
        return Subject::findOrFail($id);
    }

    public function findPublishedSubject(int $id): Subject
    {
        return Subject::query()
            ->where('is_published', true)
            ->whereHas('grade', fn ($q) => $q->where('is_published', true)
                ->whereHas('stage', fn ($q2) => $q2->where('is_published', true)))
            ->with(['sections' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function findPublishedSubjectBySlug(string $slug): Subject
    {
        return Subject::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->whereHas('grade', fn ($q) => $q->where('is_published', true)
                ->whereHas('stage', fn ($q2) => $q2->where('is_published', true)))
            ->with(['sections' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->firstOrFail();
    }

    public function createSubject(array $data): Subject
    {
        $subject = Subject::create($data);

        if (empty($subject->slug)) {
            $subject->forceFill(['slug' => Slugger::from($subject->name, $subject->id)])->save();
        }

        return $subject;
    }

    public function updateSubject(int $id, array $data): Subject
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $subject = Subject::findOrFail($id);
        $subject->update($data);

        return $subject;
    }

    public function deleteSubject(int $id): void
    {
        Subject::findOrFail($id)->delete();
    }

    /* --------------------------------- Sections --------------------------------- */

    public function sections(): Collection
    {
        return Section::query()->orderBy('sort_order')->get();
    }

    public function publishedSections(): Collection
    {
        return Section::query()
            ->where('is_published', true)
            ->whereHas('subject', fn ($q) => $q->where('is_published', true)
                ->whereHas('grade', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('stage', fn ($q3) => $q3->where('is_published', true))))
            ->with(['courses' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();
    }

    public function findSection(int $id): Section
    {
        return Section::findOrFail($id);
    }

    public function findPublishedSection(int $id): Section
    {
        return Section::query()
            ->where('is_published', true)
            ->whereHas('subject', fn ($q) => $q->where('is_published', true)
                ->whereHas('grade', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('stage', fn ($q3) => $q3->where('is_published', true))))
            ->with(['courses' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function findPublishedSectionBySlug(string $slug): Section
    {
        return Section::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->whereHas('subject', fn ($q) => $q->where('is_published', true)
                ->whereHas('grade', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('stage', fn ($q3) => $q3->where('is_published', true))))
            ->with(['courses' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->firstOrFail();
    }

    public function createSection(array $data): Section
    {
        $section = Section::create($data);

        if (empty($section->slug)) {
            $section->forceFill(['slug' => Slugger::from($section->name, $section->id)])->save();
        }

        return $section;
    }

    public function updateSection(int $id, array $data): Section
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $section = Section::findOrFail($id);
        $section->update($data);

        return $section;
    }

    public function deleteSection(int $id): void
    {
        Section::findOrFail($id)->delete();
    }

    /* ---------------------------------- Courses ---------------------------------- */

    public function courses(): Collection
    {
        return Course::query()->orderBy('sort_order')->get();
    }

    public function publishedCourses(): Collection
    {
        return Course::query()
            ->where('is_published', true)
            ->whereHas('section', fn ($q) => $q->where('is_published', true)
                ->whereHas('subject', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('grade', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('stage', fn ($q4) => $q4->where('is_published', true)))))
            ->orderBy('sort_order')
            ->get();
    }

    public function findCourse(int $id): Course
    {
        return Course::findOrFail($id);
    }

    public function findPublishedCourse(int $id): Course
    {
        return Course::query()
            ->where('is_published', true)
            ->whereHas('section', fn ($q) => $q->where('is_published', true)
                ->whereHas('subject', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('grade', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('stage', fn ($q4) => $q4->where('is_published', true)))))
            ->findOrFail($id);
    }

    public function findPublishedCourseBySlug(string $slug): Course
    {
        return Course::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->whereHas('section', fn ($q) => $q->where('is_published', true)
                ->whereHas('subject', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('grade', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('stage', fn ($q4) => $q4->where('is_published', true)))))
            ->firstOrFail();
    }

    public function createCourse(array $data): Course
    {
        $course = Course::create($data);

        if (empty($course->slug)) {
            $course->forceFill(['slug' => Slugger::from($course->name, $course->id)])->save();
        }

        return $course;
    }

    public function updateCourse(int $id, array $data): Course
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $course = Course::findOrFail($id);
        $course->update($data);

        return $course;
    }

    public function deleteCourse(int $id): void
    {
        Course::findOrFail($id)->delete();
    }
}
