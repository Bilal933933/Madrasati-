import { Injectable } from '@nestjs/common';
import { AiTicketService } from '../v1/auth/jwt.service.js';
import { GeminiService, type ChatTurn } from '../v1/ai/gemini.service.js';
import { PromptBuilder } from '../v1/ai/prompt-builder.js';
import { AppError } from '../v1/common/errors/app-error.js';
import { ErrorCode } from '../v1/common/errors/error-codes.js';
import { RagService } from '../v1/knowledge/rag.service.js';
import { ContextService } from '../v1/student-context/context.service.js';
import type { StudentContext } from '../v1/student-context/context.types.js';
import { ThreadsService } from '../v1/threads/threads.service.js';

export interface SmartAssistantStatus {
  name: string;
  status: 'ready';
  description: string;
}

/**
 * المساعد الذكي — البنية الأساسية فقط، مطابقة ChatService دون منطق إضافي.
 * - حد المعدل + السياق + المعرفة + الحفظ + البث.
 * - الأخطاء AppError فقط ليلتقطها الفلتر العام ويوحّد شكلها.
 */
@Injectable()
export class SmartAssistantService {
  private readonly maxQuestionsPerWindow = 20;
  private readonly windowMs = 60_000;
  private readonly requests = new Map<number, number[]>();

  constructor(
    private readonly contextService: ContextService,
    private readonly rag: RagService,
    private readonly promptBuilder: PromptBuilder,
    private readonly gemini: GeminiService,
    private readonly tickets: AiTicketService,
    readonly threads: ThreadsService,
  ) {}

  status(): SmartAssistantStatus {
    return {
      name: 'المساعد الذكي',
      status: 'ready',
      description: 'بنية أساسية جاهزة — نفس مسار ChatService.',
    };
  }

  /** يتحقق من التذكرة ويعيد معرف الطالب — مدخل موحّد للمصادقة. */
  resolveUserId(token: string | undefined): number {
    return this.tickets.verify(token ?? '').sub;
  }

  /** حد عدد الأسئلة لكل طالب في النافذة (منع إساءة الاستخدام). */
  assertWithinLimit(userId: number): void {
    const now = Date.now();
    const timestamps = (this.requests.get(userId) ?? []).filter(
      (t) => now - t < this.windowMs,
    );

    if (timestamps.length >= this.maxQuestionsPerWindow) {
      throw new AppError({
        code: ErrorCode.RATE_LIMIT,
        status: 429,
        userMessage: 'لقد أرسلت عددًا كبيرًا من الأسئلة. حاول بعد قليل.',
        details: `rate limit ${this.maxQuestionsPerWindow}/${this.windowMs}ms exceeded`,
      });
    }

    timestamps.push(now);
    this.requests.set(userId, timestamps);
  }

  async getContext(userId: number): Promise<StudentContext> {
    return this.contextService.getStudentContext(userId);
  }

  async retrieveKnowledge(
    question: string,
    context: StudentContext,
  ): Promise<ReturnType<RagService['retrieve']>> {
    return this.rag.retrieve(question, {
      subjectId: context.placement.currentSubjectId,
      gradeId: context.placement.gradeId,
    });
  }

  buildPrompt(
    context: StudentContext,
    rag: Awaited<ReturnType<RagService['retrieve']>>,
  ): string {
    return this.promptBuilder.build(context, rag);
  }

  /** يجلب نافذة السياق المنزلقة (آخر 20 رسالة نصية) مرتبة زمنيًا. */
  async getHistory(threadId: number): Promise<ChatTurn[]> {
    const recent = await this.threads.getRecentMessages(threadId);
    return recent.map((m) => ({
      role: m.sender === 'USER' ? 'user' : 'model',
      text: m.content,
    }));
  }

  /** يحفظ سؤال الطالب فورًا ويقتطع عنوان الجلسة من أول سؤال. */
  async saveUserQuestion(
    userId: number,
    threadId: number,
    question: string,
  ): Promise<void> {
    const thread = await this.threads.findOwnedThread(threadId, userId);
    if (!thread.title) {
      await this.threads.setTitleFromQuestion(threadId, question);
    }
    await this.threads.saveMessage(threadId, 'USER', 'text', question);
  }

  /** يحفظ رد المساعد كاملًا بعد انتهاء الدفق مع مصادر RAG. */
  async saveAssistantReply(
    threadId: number,
    text: string,
    sources: { lessonId: number; lessonTitle: string }[],
  ): Promise<void> {
    await this.threads.saveMessage(threadId, 'ASSISTANT', 'text', text, {
      sources,
    });
  }

  async *stream(
    system: string,
    history: ChatTurn[],
    question: string,
  ): AsyncGenerator<string> {
    yield* this.gemini.stream(system, history, question);
  }
}
