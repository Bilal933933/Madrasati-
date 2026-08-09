<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Models\Paragraph;
use App\Support\ImageService;
use App\Support\Slugger;
use App\Support\TiptapSanitizerService;
use Illuminate\Database\Eloquent\Collection;

/**
 * منطق عمليات الفقرة (Paragraph) — إنشاء وتعديل وحذف وصور وتعقيم.
 */
class ParagraphService
{
    public function __construct(
        private readonly ImageService $imageService,
        private readonly TiptapSanitizerService $tiptapSanitizerService,
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
            ->withinPublishedLesson()
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
            ->withinPublishedLesson()
            ->firstOrFail();
    }

    public function createParagraph(array $data): Paragraph
    {
        $data['content'] = $this->tiptapSanitizerService->sanitize($data['content'] ?? '');

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
            $data['content'] = $this->tiptapSanitizerService->sanitize($data['content']);
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
