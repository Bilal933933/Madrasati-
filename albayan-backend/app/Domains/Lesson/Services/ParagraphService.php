<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Models\Paragraph;
use App\Support\HtmlSanitizerService;
use App\Support\ImageService;
use App\Support\Slugger;
use Illuminate\Database\Eloquent\Collection;

/**
 * منطق عمليات الفقرة (Paragraph) — إنشاء وتعديل وحذف وصور وتعقيم.
 */
class ParagraphService
{
    public function __construct(
        private readonly ImageService $imageService,
        private readonly HtmlSanitizerService $htmlSanitizerService,
    ) {}

    public function paragraphs(?int $lessonId = null): Collection
    {
        return Paragraph::query()
            ->when($lessonId, fn ($q) => $q->where('lesson_id', $lessonId))
            ->orderBy('sort_order')
            ->get();
    }

    public function nextParagraphOrder(int $lessonId): int
    {
        return (Paragraph::query()->where('lesson_id', $lessonId)->max('sort_order') ?? 0) + 1;
    }

    public function publishedParagraphs(): Collection
    {
        return Paragraph::query()
            ->whereHas('lesson', fn ($q) => $q->where('is_published', true)
                ->whereHas('course', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('subject', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('grade', fn ($q4) => $q4->where('is_published', true)
                            ->whereHas('stage', fn ($q5) => $q5->where('is_published', true))))))
            ->orderBy('sort_order')
            ->get();
    }

    public function findParagraph(int $id): Paragraph
    {
        return Paragraph::findOrFail($id);
    }

    public function findPublishedParagraphBySlug(string $slug): Paragraph
    {
        return Paragraph::query()
            ->where('slug', $slug)
            ->whereHas('lesson', fn ($q) => $q->where('is_published', true)
                ->whereHas('course', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('subject', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('grade', fn ($q4) => $q4->where('is_published', true)
                            ->whereHas('stage', fn ($q5) => $q5->where('is_published', true))))))
            ->firstOrFail();
    }

    public function createParagraph(array $data): Paragraph
    {
        $data['content'] = $this->htmlSanitizerService->sanitize($data['content'] ?? '');

        $paragraph = Paragraph::create($data);

        if (empty($paragraph->slug)) {
            $paragraph->forceFill(['slug' => Slugger::from($paragraph->title, $paragraph->id)])->save();
        }

        return $paragraph;
    }

    public function updateParagraph(int $id, array $data): Paragraph
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $paragraph = Paragraph::findOrFail($id);

        if (isset($data['content'])) {
            $data['content'] = $this->htmlSanitizerService->sanitize($data['content']);
        }

        if (($data['image'] ?? null) !== $paragraph->image) {
            $this->imageService->delete($paragraph->image);
        }

        $paragraph->update($data);

        return $paragraph;
    }

    public function deleteParagraph(int $id): void
    {
        $paragraph = Paragraph::findOrFail($id);

        $this->imageService->delete($paragraph->image);

        $paragraph->delete();
    }
}
