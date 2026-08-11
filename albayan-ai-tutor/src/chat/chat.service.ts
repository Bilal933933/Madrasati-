import { Injectable } from '@nestjs/common';
import { AiTicketService } from '../auth/jwt.service.js';
import { GeminiService, type ChatTurn } from '../ai/gemini.service.js';
import { PromptBuilder } from '../ai/prompt-builder.js';
import { RagService } from '../knowledge/rag.service.js';
import { ContextService } from '../student-context/context.service.js';
import type { StudentContext } from '../student-context/context.types.js';
import { ThreadsService } from '../threads/threads.service.js';
import { QUIZ_QUESTION_SCHEMA, type QuizQuestion } from './quiz.types.js';

@Injectable()
export class ChatService {
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

  /**
   * يتحقق من التذكرة ويعيد معرف الطالب — مدخل موحّد للمصادقة في معالجي الـ WS.
   */
  resolveUserId(token: string | undefined): number {
    return this.tickets.verify(token ?? '').sub;
  }

  /**
   * حد بسيط لعدد الأسئلة لكل طالب في النافذة الزمنية (منع إساءة الاستخدام).
   * يحذف الإدخالات القديمة ثم يحسب عدد الطلبات خلال النافذة الحالية.
   */
  assertWithinLimit(userId: number): void {
    const now = Date.now();
    const timestamps = (this.requests.get(userId) ?? []).filter(
      (t) => now - t < this.windowMs,
    );

    if (timestamps.length >= this.maxQuestionsPerWindow) {
      throw new Error('لقد أرسلت عددًا كبيرًا من الأسئلة. حاول بعد قليل.');
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
  async saveUserQuestion(userId: number, threadId: number, question: string): Promise<void> {
    const thread = await this.threads.findOwnedThread(threadId, userId);
    if (!thread.title) {
      await this.threads.setTitleFromQuestion(threadId, question);
    }
    await this.threads.saveMessage(threadId, 'USER', 'text', question);
  }

  /** يحفظ رد المعلم كاملًا بعد انتهاء الدفق مع مصادر RAG. */
  async saveAssistantReply(
    threadId: number,
    text: string,
    sources: { lessonId: number; lessonTitle: string }[],
  ): Promise<void> {
    await this.threads.saveMessage(threadId, 'ASSISTANT', 'text', text, { sources });
  }

  async *stream(
    system: string,
    history: ChatTurn[],
    question: string,
  ): AsyncGenerator<string> {
    yield* this.gemini.stream(system, history, question);
  }

  /**
   * يولّد سؤال اختبار واحد (اختيار من متعدد) مبنيًّا على سياق الطالب ومحتوى
   * المادة، باستخدام مخرجات JSON المنظمة من Gemini (responseSchema).
   */
  async generateQuizQuestion(userId: number): Promise<QuizQuestion> {
    const context = await this.getContext(userId);
    const seed = 'أنشئ سؤالًا واحدًا حول مادة الطالب الحالية.';
    const rag = await this.rag.retrieve(seed, {
      subjectId: context.placement.currentSubjectId,
      gradeId: context.placement.gradeId,
    });

    const s = context.student;
    const p = context.placement;

    const system = [
      'أنت معلم متخصص في منصة تعليمية تنشئ سؤال اختيار من متعدد واحدًا لطالب.',
      `الطالب: ${s.name} في ${p.gradeName ?? 'مرحلة غير محددة'} (المادة الحالية: ${p.currentSubjectName ?? 'غير محددة'}).`,
      '',
      'المحتوى الدراسي المرفق هو المرجع الوحيد للسؤال:',
      rag.contentWindow || '(لا يوجد محتوى مطابق — أنشئ سؤالًا عامًا مناسبًا للمرحلة.)',
      '',
      'قواعد السؤال:',
      '- سؤال واحد فقط، واضح ومناسب لمستوى الطالب، مبني على المحتوى المرفق أولًا.',
      '- 4 خيارات: خيار صحيح واحد وثلاثة خيارات خاطئة واضحة ومتساوية الطول تقريبًا.',
      '- اجعل correctAnswerIndex يشير إلى موضع الخيار الصحيح (0 إلى 3).',
      '- أضف شرحًا مختصرًا للخيار الصحيح في explanation.',
    ].join('\n');

    const question = await this.gemini.generateStructured<QuizQuestion>({
      system,
      userText: 'أنشئ السؤال الآن وأعد JSON مطابقًا للمخطط المطلوب.',
      schema: QUIZ_QUESTION_SCHEMA,
    });

    if (
      !question ||
      !question.question?.trim() ||
      !Array.isArray(question.options) ||
      question.options.length < 2
    ) {
      throw new Error('تعذّر توليد سؤال صالح. حاول مجددًا.');
    }

    const index = Number(question.correctAnswerIndex);
    question.correctAnswerIndex = Number.isInteger(index) && index >= 0 && index < question.options.length
      ? index
      : 0;

    return question;
  }
}