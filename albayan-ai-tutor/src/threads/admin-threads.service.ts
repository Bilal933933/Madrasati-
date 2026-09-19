import { Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app-error.js';
import { ErrorCode } from '../common/errors/error-codes.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { chat_messagesModel } from '../generated/prisma/models.js';

export interface AdminThreadStatsDto {
  totalThreads: number;
  totalMessages: number;
  activeStudents: number;
}

export interface AdminThreadListItemDto {
  id: string;
  title: string | null;
  subjectId: string | null;
  lessonId: string | null;
  student: { id: string; name: string; email: string };
  messageCount: number;
  updatedAt: Date | null;
}

export interface AdminThreadListResultDto {
  data: AdminThreadListItemDto[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminThreadDetailDto {
  id: string;
  title: string | null;
  subjectId: string | null;
  lessonId: string | null;
  student: { id: string; name: string; email: string };
  createdAt: Date | null;
  updatedAt: Date | null;
  messages: chat_messagesModel[];
}

/**
 * مراجعة جلسات المعلم الآلي من لوحة الأدمن (قراءة فقط):
 * - إحصاءات عامة (عدد الجلسات/الرسائل/الطلاب النشطين).
 * - قائمة الجلسات مع بيانات الطالب وبحث بالاسم/البريد.
 * - تفاصيل جلسة واحدة بكل رسائلها.
 *
 * يستعلم عن بيانات الطلاب وعدد الرسائل بطلبات منفصلة بدل الـ include
 * لتفادي اعتماد العميل المُولَّد على علاقات غير مُحدَّثة.
 */
@Injectable()
export class AdminThreadsService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<AdminThreadStatsDto> {
    const [totalThreads, totalMessages, activeStudents] = await Promise.all([
      this.prisma.chat_threads.count(),
      this.prisma.chat_messages.count(),
      this.prisma.chat_threads
        .groupBy({ by: ['user_id'] })
        .then((groups) => groups.length),
    ]);

    return { totalThreads, totalMessages, activeStudents };
  }

  async list(params: {
    page?: number;
    perPage?: number;
    search?: string;
  }): Promise<AdminThreadListResultDto> {
    const page = Math.max(1, params.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params.perPage ?? 20));
    const search = params.search?.trim();

    // البحث يجري على جدول المستخدمين أولًا ثم فلترة الجلسات بمعرّفاتهم.
    let userIds: bigint[] | undefined;
    if (search && search.length > 0) {
      const matched = await this.prisma.users.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      userIds = matched.map((user) => user.id);
      if (userIds.length === 0) {
        return {
          data: [],
          meta: { page, perPage, total: 0, totalPages: 1 },
        };
      }
    }

    const where =
      userIds !== undefined ? { user_id: { in: userIds } } : undefined;

    const [threads, total, messageGroups] = await Promise.all([
      this.prisma.chat_threads.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.chat_threads.count({ where }),
      this.prisma.chat_messages.groupBy({
        by: ['thread_id'],
        _count: { _all: true },
      }),
    ]);

    const userMap = await this.fetchUsers(threads);

    const countsByThread = new Map(
      messageGroups.map((group) => [group.thread_id, group._count._all]),
    );

    return {
      data: threads.map((thread) => ({
        id: thread.id.toString(),
        title: thread.title,
        subjectId: thread.subject_id?.toString() ?? null,
        lessonId: thread.lesson_id?.toString() ?? null,
        student: {
          id: userMap.get(thread.user_id)?.id.toString() ?? '',
          name: userMap.get(thread.user_id)?.name ?? 'مستخدم محذوف',
          email: userMap.get(thread.user_id)?.email ?? '',
        },
        messageCount: countsByThread.get(thread.id) ?? 0,
        updatedAt: thread.updated_at,
      })),
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      },
    };
  }

  async detail(threadId: number): Promise<AdminThreadDetailDto> {
    const thread = await this.prisma.chat_threads.findUnique({
      where: { id: BigInt(threadId) },
    });

    if (!thread) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        status: 404,
        userMessage: 'لا يوجد محادثة بهذا المعرف.',
        details: `thread=${threadId} not found`,
      });
    }

    const [messages, users] = await Promise.all([
      this.prisma.chat_messages.findMany({
        where: { thread_id: thread.id },
        orderBy: { created_at: 'asc' },
      }),
      this.prisma.users.findMany({ where: { id: thread.user_id } }),
    ]);

    const student = users[0];

    return {
      id: thread.id.toString(),
      title: thread.title,
      subjectId: thread.subject_id?.toString() ?? null,
      lessonId: thread.lesson_id?.toString() ?? null,
      student: {
        id: student?.id.toString() ?? '',
        name: student?.name ?? 'مستخدم محذوف',
        email: student?.email ?? '',
      },
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
      messages,
    };
  }

  /** تعيين user_id → مستخدم لعدة جلسات (طلبات منفصلة بدل الـ include). */
  private async fetchUsers(
    threads: { id: bigint; user_id: bigint }[],
  ): Promise<Map<bigint, { id: bigint; name: string; email: string }>> {
    const userIds = [...new Set(threads.map((t) => t.user_id))];
    if (userIds.length === 0) return new Map();

    const users = await this.prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    return new Map(
      users.map((user) => [
        user.id,
        { id: user.id, name: user.name, email: user.email },
      ]),
    );
  }
}
