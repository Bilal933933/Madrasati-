<?php

namespace App\Domains\Curriculum\Services;

use App\Domains\Curriculum\Models\Course;
use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Stage;
use App\Domains\Curriculum\Models\Subject;
use App\Support\ImageService;
use App\Support\Slugger;
use Illuminate\Database\Eloquent\Collection;

/**
 * ظ…ظ†ط·ظ‚ ط¹ظ…ظ„ظٹط§طھ ط¯ظˆظ…ظٹظ† ط§ظ„ظ…ظ†ظ‡ط¬ (Curriculum).
 * ط¹ظ…ظ„ظٹط§طھ ط¨ط³ظٹط·ط© ظˆظ…طھط±ط§ط¨ط·ط© â€” ظ„ط°ظ„ظƒ ظ†ط³طھط®ط¯ظ… ظ†ظ…ط· Service ط¨ط¯ظ„ظ‹ط§ ظ…ظ† Action.
 */
class CurriculumService
{
    public function __construct(private readonly ImageService $imageService) {}

    /* ---------------------------------- Stages ---------------------------------- */

    public function stages(): Collection
    {
        return Stage::query()->orderBy('sort_order')->get();
    }

    public function nextStageOrder(): int
    {
        return (Stage::query()->max('sort_order') ?? 0) + 1;
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

        if (($data['image'] ?? null) !== $stage->image) {
            $this->imageService->delete($stage->image);
        }

        $stage->update($data);

        return $stage;
    }

    public function deleteStage(int $id): void
    {
        $stage = Stage::findOrFail($id);

        $this->imageService->delete($stage->image);

        $stage->delete();
    }

    /* ---------------------------------- Grades ---------------------------------- */

    public function grades(?int $stageId = null): Collection
    {
        return Grade::query()
            ->when($stageId, fn ($q) => $q->where('stage_id', $stageId))
            ->orderBy('sort_order')
            ->get();
    }

    public function nextGradeOrder(int $stageId): int
    {
        return (Grade::query()->where('stage_id', $stageId)->max('sort_order') ?? 0) + 1;
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

        if (($data['image'] ?? null) !== $grade->image) {
            $this->imageService->delete($grade->image);
        }

        $grade->update($data);

        return $grade;
    }

    public function deleteGrade(int $id): void
    {
        $grade = Grade::findOrFail($id);

        $this->imageService->delete($grade->image);

        $grade->delete();
    }

    /* -------------------------------- Semesters -------------------------------- */

    public function semesters(?int $gradeId = null): Collection
    {
        return Semester::query()
            ->when($gradeId, fn ($q) => $q->where('grade_id', $gradeId))
            ->orderBy('sort_order')
            ->get();
    }

    public function nextSemesterOrder(int $gradeId): int
    {
        return (Semester::query()->where('grade_id', $gradeId)->max('sort_order') ?? 0) + 1;
    }

    public function publishedSemesters(?int $gradeId = null): Collection
    {
        return Semester::query()
            ->when($gradeId, fn ($q) => $q->where('grade_id', $gradeId))
            ->whereHas('grade', fn ($q) => $q->where('is_published', true)
                ->whereHas('stage', fn ($q2) => $q2->where('is_published', true)))
            ->with(['subjects' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();
    }

    public function findSemester(int $id): Semester
    {
        return Semester::findOrFail($id);
    }

    public function findPublishedSemester(int $id): Semester
    {
        return Semester::query()
            ->whereHas('grade', fn ($q) => $q->where('is_published', true)
                ->whereHas('stage', fn ($q2) => $q2->where('is_published', true)))
            ->with(['subjects' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function createSemester(array $data): Semester
    {
        return Semester::create($data);
    }

    public function updateSemester(int $id, array $data): Semester
    {
        $semester = Semester::findOrFail($id);
        $semester->update($data);

        return $semester;
    }

    public function deleteSemester(int $id): void
    {
        Semester::findOrFail($id)->delete();
    }

    /* --------------------------------- Subjects --------------------------------- */

    public function subjects(?int $gradeId = null, ?int $semesterId = null): Collection
    {
        return Subject::query()
            ->when($gradeId, fn ($q) => $q->where('grade_id', $gradeId))
            ->when($semesterId, fn ($q) => $q->where('semester_id', $semesterId))
            ->orderBy('sort_order')
            ->get();
    }

    public function nextSubjectOrder(int $gradeId): int
    {
        return (Subject::query()->where('grade_id', $gradeId)->max('sort_order') ?? 0) + 1;
    }

    public function publishedSubjects(): Collection
    {
        return Subject::query()
            ->where('is_published', true)
            ->whereHas('grade', fn ($q) => $q->where('is_published', true)
                ->whereHas('stage', fn ($q2) => $q2->where('is_published', true)))
            ->with(['courses' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
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
            ->with(['courses' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function findPublishedSubjectBySlug(string $slug): Subject
    {
        return Subject::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->whereHas('grade', fn ($q) => $q->where('is_published', true)
                ->whereHas('stage', fn ($q2) => $q2->where('is_published', true)))
            ->with(['courses' => fn ($q) => $q->where('is_published', true)->orderBy('sort_order')])
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

        if (($data['image'] ?? null) !== $subject->image) {
            $this->imageService->delete($subject->image);
        }

        $subject->update($data);

        return $subject;
    }

    public function deleteSubject(int $id): void
    {
        $subject = Subject::findOrFail($id);

        $this->imageService->delete($subject->image);

        $subject->delete();
    }

    /* ---------------------------------- Courses ---------------------------------- */

    public function courses(?int $subjectId = null): Collection
    {
        return Course::query()
            ->when($subjectId, fn ($q) => $q->where('subject_id', $subjectId))
            ->orderBy('sort_order')
            ->get();
    }

    public function nextCourseOrder(int $subjectId): int
    {
        return (Course::query()->where('subject_id', $subjectId)->max('sort_order') ?? 0) + 1;
    }

    public function publishedCourses(): Collection
    {
        return Course::query()
            ->where('is_published', true)
            ->whereHas('subject', fn ($q) => $q->where('is_published', true)
                ->whereHas('grade', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('stage', fn ($q3) => $q3->where('is_published', true))))
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
            ->whereHas('subject', fn ($q) => $q->where('is_published', true)
                ->whereHas('grade', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('stage', fn ($q3) => $q3->where('is_published', true))))
            ->findOrFail($id);
    }

    public function findPublishedCourseBySlug(string $slug): Course
    {
        return Course::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->whereHas('subject', fn ($q) => $q->where('is_published', true)
                ->whereHas('grade', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('stage', fn ($q3) => $q3->where('is_published', true))))
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

        if (($data['image'] ?? null) !== $course->image) {
            $this->imageService->delete($course->image);
        }

        $course->update($data);

        return $course;
    }

    public function deleteCourse(int $id): void
    {
        $course = Course::findOrFail($id);

        $this->imageService->delete($course->image);

        $course->delete();
    }
}
