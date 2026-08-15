import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  completed: number;
}

export interface LastLesson {
  id: number;
  title: string;
  courseName: string;
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async completedCount(userId: number): Promise<number> {
    return this.prisma.lesson_completions.count({ where: { user_id: userId } });
  }

  async perSubject(userId: number): Promise<SubjectProgress[]> {
    const rows = await this.prisma.lesson_completions.findMany({
      where: { user_id: userId },
      select: {
        lessons: {
          select: {
            courses: {
              select: {
                subject_id: true,
                subjects: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const bySubject = new Map<number, SubjectProgress>();
    for (const row of rows) {
      const subjectId = row.lessons?.courses?.subject_id;
      const subjectName = row.lessons?.courses?.subjects?.name;
      if (subjectId == null || !subjectName) continue;

      const key = Number(subjectId);
      const current = bySubject.get(key) ?? {
        subjectId: key,
        subjectName,
        completed: 0,
      };
      current.completed += 1;
      bySubject.set(key, current);
    }

    return [...bySubject.values()].sort((a, b) => b.completed - a.completed);
  }

  async lastLesson(userId: number): Promise<LastLesson | null> {
    const completion = await this.prisma.lesson_completions.findFirst({
      where: { user_id: userId, completed_at: { not: null } },
      orderBy: { completed_at: 'desc' },
      select: {
        lessons: {
          select: {
            id: true,
            title: true,
            courses: { select: { name: true } },
          },
        },
      },
    });

    const lesson = completion?.lessons;
    if (!lesson) return null;

    return {
      id: Number(lesson.id),
      title: lesson.title,
      courseName: lesson.courses?.name ?? '',
    };
  }

  /**
   * عدد الأيام المتتالية التي أنجز فيها الطالب درسًا واحدًا على الأقل
   * (يوم = أي تاريخ distinct في lesson_completions.completed_at).
   */
  async dailyStreak(userId: number): Promise<number> {
    const completions = await this.prisma.lesson_completions.findMany({
      where: { user_id: userId, completed_at: { not: null } },
      select: { completed_at: true },
      orderBy: { completed_at: 'desc' },
      take: 90,
    });

    const days = new Set<string>();
    for (const c of completions) {
      if (c.completed_at) {
        days.add(this.dayKey(c.completed_at));
      }
    }

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.has(this.dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  private dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
}
