import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface RagResult {
  lessons: { id: number; title: string; summary: string | null }[];
  contentWindow: string;
  sources: { lessonId: number; lessonTitle: string }[];
}

@Injectable()
export class RagService {
  private static readonly MAX_CHARS = 12000;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * استرجاع نصي بسيط (بلا vector DB):
   * 1) يجلب دروس المادة/الصف الحالي.
   * 2) يقيّم كل درس بتطابق توكنات السؤال مع العنوان/الملخص/الأهداف.
   * 3) يختار الأعلى تطابقًا ويسحب فقراته نصوصًا → نافذة سياق.
   */
  async retrieve(
    question: string,
    opts: { subjectId?: number | null; gradeId?: number | null },
  ): Promise<RagResult> {
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

    const tokens = this.tokenize(question);
    const scored = lessons
      .map((lesson) => ({
        lesson,
        score: this.scoreLesson(lesson, tokens),
      }))
      .sort((a, b) => b.score - a.score);

    const selected = scored.slice(0, 4);

    const paragraphs = await this.prisma.paragraphs.findMany({
      where: {
        lesson_id: { in: selected.map((s) => s.lesson.id) },
      },
      select: { lesson_id: true, title: true, content: true },
    });

    const byLesson = new Map<number, string[]>();
    for (const p of paragraphs) {
      const list = byLesson.get(Number(p.lesson_id)) ?? [];
      list.push(p.content);
      byLesson.set(Number(p.lesson_id), list);
    }

    let contentWindow = '';
    const sources: RagResult['sources'] = [];
    for (const entry of selected) {
      if (contentWindow.length >= RagService.MAX_CHARS) break;
      const texts = byLesson.get(Number(entry.lesson.id)) ?? [];
      const body = `### ${entry.lesson.title}\n${texts.join('\n\n')}`;
      contentWindow += `${body}\n\n`;
      sources.push({
        lessonId: Number(entry.lesson.id),
        lessonTitle: entry.lesson.title,
      });
    }

    return {
      lessons: selected.map((s) => ({
        id: Number(s.lesson.id),
        title: s.lesson.title,
        summary: s.lesson.summary,
      })),
      contentWindow: contentWindow.slice(0, RagService.MAX_CHARS),
      sources,
    };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  private scoreLesson(
    lesson: { title: string; summary: string | null; learning_objectives: unknown },
    tokens: string[],
  ): number {
    const title = lesson.title.toLowerCase();
    const summary = (lesson.summary ?? '').toLowerCase();
    const objectives = Array.isArray(lesson.learning_objectives)
      ? lesson.learning_objectives.join(' ').toLowerCase()
      : '';

    let score = 0;
    for (const token of tokens) {
      if (title.includes(token)) score += 3;
      if (summary.includes(token)) score += 2;
      if (objectives.includes(token)) score += 1;
    }
    return score;
  }
}