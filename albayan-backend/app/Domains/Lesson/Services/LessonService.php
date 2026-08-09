<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Models\Lesson;
use App\Support\ImageService;
use App\Support\Slugger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * منطق عمليات الدرس (Lesson) — CRUD وتوليد القالب الافتراضي لرحلة التعلم.
 *
 * لا يتولى الفقرات/التقييمات تعريفًا؛ إذ لكل منها Service مستقل،
 * بينما يبني رحلة التعلم LessonFlowService.
 */
class LessonService
{
    public function __construct(
        private readonly ImageService $imageService,
        private readonly LessonTemplateBuilder $templateBuilder,
    ) {}

    /* ---------------------------------- Lessons ---------------------------------- */

    /**
     * قائمة الدروس مع ترقيم وفلترة تسلسلية عبر كل مستويات المنهج.
     */
    public function lessons(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Lesson::query()
            ->when(($filters['course_id'] ?? null), fn ($q, $id) => $q->where('course_id', $id))
            ->when(($filters['subject_id'] ?? null), fn ($q, $id) => $q->whereHas('course', fn ($q2) => $q2->where('subject_id', $id)))
            ->when(($filters['semester_id'] ?? null), fn ($q, $id) => $q->whereHas('course.subject', fn ($q2) => $q2->where('semester_id', $id)))
            ->when(($filters['grade_id'] ?? null), fn ($q, $id) => $q->whereHas('course.subject', fn ($q2) => $q2->where('grade_id', $id)))
            ->when(($filters['stage_id'] ?? null), fn ($q, $id) => $q->whereHas('course.subject.grade', fn ($q2) => $q2->where('stage_id', $id)))
            ->withCount(['paragraphs', 'blocks'])
            ->orderBy('sort_order')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function nextLessonOrder(int $courseId): int
    {
        return (Lesson::query()->where('course_id', $courseId)->max('sort_order') ?? 0) + 1;
    }

    public function publishedLessons(): Collection
    {
        return Lesson::query()
            ->fullyPublished()
            ->orderBy('sort_order')
            ->get();
    }

    public function findLesson(int $id): Lesson
    {
        return Lesson::findOrFail($id);
    }

    public function findPublishedLesson(int $id): Lesson
    {
        return Lesson::query()
            ->fullyPublished()
            ->findOrFail($id);
    }

    public function findPublishedLessonBySlug(string $slug): Lesson
    {
        return Lesson::query()
            ->fullyPublished()
            ->where('slug', $slug)
            ->firstOrFail();
    }

    /**
     * الدرس المنشور التالي في نفس المقرر (course) — يُستخدم في شاشة النهاية.
     * يرجع null إذا كان هذا آخر درس منشور في المقرر.
     */
    public function nextPublishedLesson(Lesson $lesson): ?Lesson
    {
        return Lesson::query()
            ->fullyPublished()
            ->where('course_id', $lesson->course_id)
            ->where(function (Builder $q) use ($lesson) {
                $q->where('sort_order', '>', $lesson->sort_order)
                    ->orWhere(function (Builder $q2) use ($lesson) {
                        $q2->where('sort_order', $lesson->sort_order)
                            ->where('id', '>', $lesson->id);
                    });
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->first();
    }

    public function createLesson(array $data): Lesson
    {
        $lesson = Lesson::create($data);

        if (empty($lesson->slug)) {
            $lesson->forceFill(['slug' => Slugger::from($lesson->title, $lesson->id)])->save();
        }

        // قالب رحلة افتراضي: تقييم قبلي ← فقرة ← تقييم ختامي.
        $this->templateBuilder->buildDefault($lesson);

        return $lesson;
    }

    public function updateLesson(int $id, array $data): Lesson
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $lesson = Lesson::findOrFail($id);

        if (($data['image'] ?? null) !== $lesson->image) {
            $this->imageService->delete($lesson->image);
        }

        $lesson->update($data);

        return $lesson;
    }

    public function deleteLesson(int $id): void
    {
        $lesson = Lesson::findOrFail($id);

        $this->imageService->delete($lesson->image);

        $lesson->delete();
    }
}
