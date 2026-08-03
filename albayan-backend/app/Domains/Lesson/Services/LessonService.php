<?php

namespace App\Domains\Lesson\Services;

use App\Domains\Lesson\Models\Lesson;
use App\Domains\Lesson\Models\Paragraph;
use App\Support\Slugger;
use Illuminate\Database\Eloquent\Collection;

/**
 * ظ…ظ†ط·ظ‚ ط¹ظ…ظ„ظٹط§طھ ط¯ظˆظ…ظٹظ† ط§ظ„ط¯ط±ط³ (Lesson).
 * ط¹ظ…ظ„ظٹط§طھ CRUD ط¨ط³ظٹط·ط© ط­ط§ظ„ظٹظ‹ط§ â€” ظ†ظ…ط· Service. ط³ظٹطھط­ظˆظ„ ط¨ط¹ط¶ظ‡ط§ ط¥ظ„ظ‰ Action
 * ظ„ط§ط­ظ‚ظ‹ط§ ط¹ظ†ط¯ ط¸ظ‡ظˆط± طھط¹ظ‚ظٹط¯ ط­ظ‚ظٹظ‚ظٹ (طھظ‚ظٹظٹظ…ط§طھطŒ ط§ط®طھط¨ط§ط±ط§طھطŒ طھطھط¨ط¹ طھظ‚ط¯ظ‘ظ…).
 */
class LessonService
{
    /* ---------------------------------- Lessons ---------------------------------- */

    public function lessons(): Collection
    {
        return Lesson::query()->orderBy('sort_order')->get();
    }

    public function publishedLessons(): Collection
    {
        return Lesson::query()
            ->where('is_published', true)
            ->whereHas('course', fn ($q) => $q->where('is_published', true)
                ->whereHas('section', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('subject', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('grade', fn ($q4) => $q4->where('is_published', true)
                            ->whereHas('stage', fn ($q5) => $q5->where('is_published', true))))))
            ->with(['paragraphs' => fn ($q) => $q->orderBy('sort_order')])
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
            ->where('is_published', true)
            ->whereHas('course', fn ($q) => $q->where('is_published', true)
                ->whereHas('section', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('subject', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('grade', fn ($q4) => $q4->where('is_published', true)
                            ->whereHas('stage', fn ($q5) => $q5->where('is_published', true))))))
            ->with(['paragraphs' => fn ($q) => $q->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function findPublishedLessonBySlug(string $slug): Lesson
    {
        return Lesson::query()
            ->where('is_published', true)
            ->where('slug', $slug)
            ->whereHas('course', fn ($q) => $q->where('is_published', true)
                ->whereHas('section', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('subject', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('grade', fn ($q4) => $q4->where('is_published', true)
                            ->whereHas('stage', fn ($q5) => $q5->where('is_published', true))))))
            ->with(['paragraphs' => fn ($q) => $q->orderBy('sort_order')])
            ->firstOrFail();
    }

    public function createLesson(array $data): Lesson
    {
        $lesson = Lesson::create($data);

        if (empty($lesson->slug)) {
            $lesson->forceFill(['slug' => Slugger::from($lesson->title, $lesson->id)])->save();
        }

        return $lesson;
    }

    public function updateLesson(int $id, array $data): Lesson
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $lesson = Lesson::findOrFail($id);
        $lesson->update($data);

        return $lesson;
    }

    public function deleteLesson(int $id): void
    {
        Lesson::findOrFail($id)->delete();
    }

    /* ---------------------------------- Paragraphs ---------------------------------- */

    public function paragraphs(): Collection
    {
        return Paragraph::query()->orderBy('sort_order')->get();
    }

    public function publishedParagraphs(): Collection
    {
        return Paragraph::query()
            ->whereHas('lesson', fn ($q) => $q->where('is_published', true)
                ->whereHas('course', fn ($q2) => $q2->where('is_published', true)
                    ->whereHas('section', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('subject', fn ($q4) => $q4->where('is_published', true)
                            ->whereHas('grade', fn ($q5) => $q5->where('is_published', true)
                                ->whereHas('stage', fn ($q6) => $q6->where('is_published', true)))))))
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
                    ->whereHas('section', fn ($q3) => $q3->where('is_published', true)
                        ->whereHas('subject', fn ($q4) => $q4->where('is_published', true)
                            ->whereHas('grade', fn ($q5) => $q5->where('is_published', true)
                                ->whereHas('stage', fn ($q6) => $q6->where('is_published', true)))))))
            ->firstOrFail();
    }

    public function createParagraph(array $data): Paragraph
    {
        $paragraph = Paragraph::create($data);

        if (empty($paragraph->slug)) {
            $paragraph->forceFill(['slug' => Slugger::from('paragraph', $paragraph->id)])->save();
        }

        return $paragraph;
    }

    public function updateParagraph(int $id, array $data): Paragraph
    {
        if (empty($data['slug'] ?? null)) {
            unset($data['slug']);
        }

        $paragraph = Paragraph::findOrFail($id);
        $paragraph->update($data);

        return $paragraph;
    }

    public function deleteParagraph(int $id): void
    {
        Paragraph::findOrFail($id)->delete();
    }
}
