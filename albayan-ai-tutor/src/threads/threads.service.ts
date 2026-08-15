import { Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app-error.js';
import { ErrorCode } from '../common/errors/error-codes.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  chat_messagesModel,
  chat_threadsModel,
} from '../generated/prisma/models.js';

export interface MessageDto {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  kind: 'text' | 'quiz';
  content: string;
  metadata: unknown;
  createdAt: Date;
}

export interface ThreadSummaryDto {
  id: string;
  title: string;
  updatedAt: Date | null;
  messageCount: number;
  lastMessage: string | null;
}

export interface ThreadDetailDto {
  id: string;
  subjectId: string | null;
  lessonId: string | null;
  title: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  messages: MessageDto[];
}

/**
 * إدارة جلسات المحادثة (ChatThreads) ورسائلها (ChatMessages):
 * - CRUD للجلسات مع التحقق من ملكية الطالب.
 * - قراءة/كتابة الرسائل المستخدَمة من REST و WebSocket معًا.
 * - العنوان يُقتطع من أول سؤال (أول 60 حرفًا) دون استدعاء LLM إضافي.
 */
@Injectable()
export class ThreadsService {
  private static readonly MAX_RECENT_MESSAGES = 20;
  private static readonly TITLE_LIMIT = 60;

  constructor(private readonly prisma: PrismaService) {}

  async createThread(
    userId: number,
    opts: { subjectId?: number; lessonId?: number } = {},
  ): Promise<chat_threadsModel> {
    return this.prisma.chat_threads.create({
      data: {
        user_id: BigInt(userId),
        subject_id: opts.subjectId != null ? BigInt(opts.subjectId) : null,
        lesson_id: opts.lessonId != null ? BigInt(opts.lessonId) : null,
      },
    });
  }

  async listThreads(userId: number): Promise<ThreadSummaryDto[]> {
    const threads = await this.prisma.chat_threads.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        chat_messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: { content: true, kind: true },
        },
        _count: { select: { chat_messages: true } },
      },
      orderBy: { updated_at: 'desc' },
    });

    return threads.map((thread) => ({
      id: thread.id.toString(),
      title: thread.title ?? 'محادثة جديدة',
      updatedAt: thread.updated_at,
      messageCount: thread._count.chat_messages,
      lastMessage: this.preview(thread.chat_messages[0]),
    }));
  }

  async getThread(threadId: number, userId: number): Promise<ThreadDetailDto> {
    const thread = await this.findOwnedThread(threadId, userId);
    const messages = await this.prisma.chat_messages.findMany({
      where: { thread_id: thread.id },
      orderBy: { created_at: 'asc' },
    });

    return {
      id: thread.id.toString(),
      subjectId: thread.subject_id?.toString() ?? null,
      lessonId: thread.lesson_id?.toString() ?? null,
      title: thread.title,
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
      messages: messages.map((m) => this.toMessageDto(m)),
    };
  }

  async deleteThread(threadId: number, userId: number): Promise<void> {
    await this.findOwnedThread(threadId, userId);
    await this.prisma.chat_threads.delete({ where: { id: BigInt(threadId) } });
  }

  /**
   * آخر N رسالة مرتبة زمنيًا — نافذة السياق المنزلقة.
   * (desc ثم take ثم عكس للوصول لآخر N فعليًا بترتيب تصاعدي)
   */
  async getRecentMessages(threadId: number): Promise<chat_messagesModel[]> {
    const messages = await this.prisma.chat_messages.findMany({
      where: { thread_id: BigInt(threadId), kind: 'text' },
      orderBy: { created_at: 'desc' },
      take: ThreadsService.MAX_RECENT_MESSAGES,
    });
    return messages.reverse();
  }

  async saveMessage(
    threadId: number,
    sender: 'USER' | 'ASSISTANT',
    kind: 'text' | 'quiz',
    content: string,
    metadata?: unknown,
  ): Promise<chat_messagesModel> {
    await this.prisma.chat_threads.update({
      where: { id: BigInt(threadId) },
      data: { updated_at: new Date() },
    });

    return this.prisma.chat_messages.create({
      data: {
        thread_id: BigInt(threadId),
        sender,
        kind,
        content,
        metadata: (metadata ?? null) as never,
      },
    });
  }

  /** العنوان يُقتطع من أول سؤال (يُستدعى مرة واحدة عند أول رسالة). */
  async setTitleFromQuestion(
    threadId: number,
    question: string,
  ): Promise<void> {
    await this.prisma.chat_threads.update({
      where: { id: BigInt(threadId) },
      data: {
        title: question.trim().slice(0, ThreadsService.TITLE_LIMIT),
      },
    });
  }

  async findOwnedThread(
    threadId: number,
    userId: number,
  ): Promise<chat_threadsModel> {
    const thread = await this.prisma.chat_threads.findUnique({
      where: { id: BigInt(threadId) },
    });

    if (!thread || thread.user_id !== BigInt(userId)) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        status: 404,
        userMessage: 'لا يوجد محادثة بهذا المعرف.',
        details: `thread=${threadId} not owned by user=${userId}`,
      });
    }
    return thread;
  }

  private toMessageDto(message: chat_messagesModel): MessageDto {
    return {
      id: message.id.toString(),
      sender: message.sender as 'USER' | 'ASSISTANT',
      kind: message.kind as 'text' | 'quiz',
      content: message.content,
      metadata: message.metadata,
      createdAt: message.created_at,
    };
  }

  private preview(
    message: { content: string; kind: string } | undefined,
  ): string | null {
    if (!message) return null;
    if (message.kind === 'quiz') return '[سؤال اختبار]';
    const text = message.content.replace(/\s+/g, ' ').trim();
    return text.slice(0, 50) + (text.length > 50 ? '…' : '');
  }
}
