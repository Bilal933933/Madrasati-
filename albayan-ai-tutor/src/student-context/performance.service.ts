import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PerformanceSummary {
  attemptsCount: number;
  passedCount: number;
  averageScore: number | null;
  bestScore: number | null;
  weakestExamType: string | null;
}

export interface WeakArea {
  lessonId: number;
  lessonTitle: string;
  errorCount: number;
}

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: number): Promise<PerformanceSummary> {
    const attempts = await this.prisma.exam_attempts.findMany({
      where: { user_id: userId, status: 'completed' },
      select: {
        score_percentage: true,
        passed: true,
        exam_blueprints: { select: { exam_type: true } },
      },
    });

    if (attempts.length === 0) {
      return {
        attemptsCount: 0,
        passedCount: 0,
        averageScore: null,
        bestScore: null,
        weakestExamType: null,
      };
    }

    const scores = attempts
      .map((a) => a.score_percentage)
      .filter((s): s is number => s != null);

    const byType = new Map<string, { sum: number; count: number }>();
    for (const a of attempts) {
      const type = a.exam_blueprints?.exam_type ?? 'unknown';
      const entry = byType.get(type) ?? { sum: 0, count: 0 };
      if (a.score_percentage != null) {
        entry.sum += a.score_percentage;
        entry.count += 1;
      }
      byType.set(type, entry);
    }

    let weakestExamType: string | null = null;
    let weakestAvg = Infinity;
    for (const [type, entry] of byType.entries()) {
      if (entry.count === 0) continue;
      const avg = entry.sum / entry.count;
      if (avg < weakestAvg) {
        weakestAvg = avg;
        weakestExamType = type;
      }
    }

    const averageScore =
      scores.length > 0 ? scores.reduce((acc, s) => acc + s, 0) / scores.length : null;

    return {
      attemptsCount: attempts.length,
      passedCount: attempts.filter((a) => a.passed).length,
      averageScore,
      bestScore: scores.length > 0 ? Math.max(...scores) : null,
      weakestExamType,
    };
  }

  /**
   * نقاط الضعف: الأسئلة التي أجاب عنها الطالب خطأً في امتحانات مكتملة،
   * مجمَّعة على مستوى الدرس (عبر بِنك الأسئلة → درس)، ثم أعلى 5 تكرارًا.
   */
  async weakAreas(userId: number, limit = 5): Promise<WeakArea[]> {
    const failed = await this.prisma.exam_attempt_questions.findMany({
      where: {
        is_correct: false,
        exam_attempts: { user_id: userId, status: 'completed' },
      },
      select: {
        bank_questions: {
          select: { lessons: { select: { id: true, title: true } } },
        },
      },
    });

    const byLesson = new Map<number, WeakArea>();
    for (const row of failed) {
      const lesson = row.bank_questions?.lessons;
      if (!lesson) continue;

      const lessonId = Number(lesson.id);
      const current = byLesson.get(lessonId) ?? {
        lessonId,
        lessonTitle: lesson.title,
        errorCount: 0,
      };
      current.errorCount += 1;
      byLesson.set(lessonId, current);
    }

    return [...byLesson.values()]
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit);
  }
}