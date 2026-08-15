import { Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app-error.js';
import { ErrorCode } from '../common/errors/error-codes.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StudentContext } from './context.types.js';
import { PerformanceService } from './performance.service.js';
import { ProgressService } from './progress.service.js';

@Injectable()
export class ContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
    private readonly performance: PerformanceService,
  ) {}

  /**
   * يجمّع صورة الطالب الكاملة من PostgreSQL بقراءات مستقلة متوازية (Promise.all).
   * لا يُستخدم $transaction لأن كل القراءات SELECT مستقلة والسرعة أولوية.
   */
  async getStudentContext(userId: number): Promise<StudentContext> {
    const [user, profile, achievements, progress, perf] = await Promise.all([
      this.prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
      this.prisma.student_profiles.findUnique({
        where: { user_id: userId },
        select: {
          grade_id: true,
          semester_id: true,
          last_subject_id: true,
          grades: {
            select: { name: true, stages: { select: { name: true } } },
          },
          semesters: { select: { name: true } },
          subjects: { select: { name: true } },
        },
      }),
      this.prisma.user_achievements.findMany({
        where: { user_id: userId },
        select: {
          unlocked_at: true,
          achievements: { select: { id: true, title: true } },
        },
        orderBy: { unlocked_at: 'desc' },
      }),
      Promise.all([
        this.progress.completedCount(userId),
        this.progress.perSubject(userId),
        this.progress.lastLesson(userId),
        this.progress.dailyStreak(userId),
      ]),
      Promise.all([
        this.performance.summary(userId),
        this.performance.weakAreas(userId),
      ]),
    ]);

    if (!user || user.role !== 'student') {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        status: 404,
        userMessage: 'لم يتم العثور على حساب الطالب.',
        details: `Student not found or wrong role (id=${userId})`,
      });
    }

    const [completedCount, perSubject, lastLesson, dailyStreak] = progress;
    const [summary, weakAreas] = perf;

    return {
      student: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      placement: {
        gradeId: profile?.grade_id != null ? Number(profile.grade_id) : null,
        gradeName: profile?.grades?.name ?? null,
        stageName: profile?.grades?.stages?.name ?? null,
        semesterName: profile?.semesters?.name ?? null,
        currentSubjectId:
          profile?.last_subject_id != null
            ? Number(profile.last_subject_id)
            : null,
        currentSubjectName: profile?.subjects?.name ?? null,
      },
      progress: {
        completedCount,
        perSubject,
        lastLesson,
        dailyStreak,
      },
      performance: {
        attemptsCount: summary.attemptsCount,
        passedCount: summary.passedCount,
        averageScore: summary.averageScore,
        bestScore: summary.bestScore,
        weakestExamType: summary.weakestExamType,
      },
      weakAreas,
      achievements: achievements.map((a) => ({
        id: Number(a.achievements.id),
        title: a.achievements.title,
        unlockedAt: a.unlocked_at ? a.unlocked_at.toISOString() : null,
      })),
    };
  }
}
