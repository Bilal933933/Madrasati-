import { LoggerService } from '../common/logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { extractTipTapText } from './tiptap.js';
import { computeLessonTokenWeights, scoreLesson } from './rag.scoring.js';

export interface Layer1Result {
  block: string;
  lessons: { id: number; title: string; summary: string | null }[];
  sources: { lessonId: number; lessonTitle: string }[];
}

/**
 * الطبقة 1: دروس منصة من DB تُقيَّم بالسؤال ثم تُسحب فقراتها كنصوص.
 * المصدر يُسجَّل للدرس فقط إن وُجد نصه الفعلي ضمن النافذة (لا استشهاد
 * بلا نص) — إغلاق التسريب الذي كان يدفع كل الدروس المختارة مهما كانت
 * فقراتها فارغة.
 */
export class Layer1Builder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger?: LoggerService,
  ) {}

  async build(
    opts: { subjectId?: number | null; gradeId?: number | null },
    tokens: string[],
  ): Promise<Layer1Result> {
    const lessons = await this.prisma.lessons.findMany({
      where: {
        is_published: true,
        ...(opts.subjectId != null
          ? { courses: { subject_id: opts.subjectId } }
          : opts.gradeId != null
            ? { courses: { subjects: { grade_id: opts.gradeId } } }
            : {}),
      },
      select: {
        id: true,
        title: true,
        summary: true,
        learning_objectives: true,
      },
      take: 200,
      orderBy: { sort_order: 'asc' },
    });

    const lessonWeights = computeLessonTokenWeights(lessons, tokens);

    const scored = lessons
      .map((lesson) => ({
        lesson,
        score: scoreLesson(lesson, tokens, lessonWeights),
      }))
      .sort((a, b) => b.score - a.score);

    // استبعاد الدروس عديمة الصلة تمامًا (score=0) حتى لا تُزحم النافذة.
    const selected = scored.filter((s) => s.score > 0).slice(0, 4);

    const paragraphs = await this.prisma.paragraphs.findMany({
      where: {
        lesson_id: { in: selected.map((s) => s.lesson.id) },
      },
      select: { id: true, lesson_id: true, title: true, content: true },
    });

    const byLesson = new Map<number, string[]>();
    for (const p of paragraphs) {
      const extracted = extractTipTapText(p.content);
      if (!extracted.ok) {
        this.logger?.warn(
          { event: 'rag.paragraph_extract_failed' },
          'فشل استخراج نص فقرة من JSON تيبتاب',
          {
            lessonId: Number(p.lesson_id),
            paragraphId: Number(p.id),
            paragraphTitle: p.title,
            contentPreview: p.content.slice(0, 120),
          },
        );
        continue;
      }
      if (extracted.text.length === 0) {
        continue;
      }
      const list = byLesson.get(Number(p.lesson_id)) ?? [];
      list.push(extracted.text);
      byLesson.set(Number(p.lesson_id), list);
    }

    const lessonsBlock: string[] = [];
    const sources: Layer1Result['sources'] = [];
    for (const entry of selected) {
      const texts = byLesson.get(Number(entry.lesson.id)) ?? [];
      if (texts.length === 0) continue;
      lessonsBlock.push(`### ${entry.lesson.title}\n${texts.join('\n\n')}`);
      sources.push({
        lessonId: Number(entry.lesson.id),
        lessonTitle: entry.lesson.title,
      });
    }

    const block =
      lessonsBlock.length > 0
        ? `## الطبقة 1: الدرس على المنصة\n${lessonsBlock.join('\n\n')}`
        : '';

    return {
      block,
      lessons: selected.map((s) => ({
        id: Number(s.lesson.id),
        title: s.lesson.title,
        summary: s.lesson.summary,
      })),
      sources,
    };
  }
}
