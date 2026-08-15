import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AiSessionGuard } from '../auth/ai-session.guard.js';
import { ChatService } from './chat.service.js';

interface QuestionPayload {
  threadId?: number;
  question?: string;
  subjectId?: number;
}

interface QuizPayload {
  threadId?: number;
}

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },
})
@UseGuards(AiSessionGuard)
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('question')
  async handleQuestion(
    @MessageBody() payload: QuestionPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.data.userId as number;
    const threadId = payload?.threadId;
    const question = payload?.question?.trim();

    if (!threadId || !Number.isInteger(Number(threadId))) {
      client.emit('error', { message: 'معرّف الجلسة مفقود أو غير صالح.' });
      return;
    }

    if (!question || question.length < 2) {
      client.emit('error', { message: 'السؤال فارغ أو قصير جدًا.' });
      return;
    }

    if (question.length > 2000) {
      client.emit('error', { message: 'السؤال أطول من المسموح (2000 حرف).' });
      return;
    }

    try {
      this.chatService.assertWithinLimit(userId);

      client.emit('status', {
        status: 'aggregating_context',
        message: 'جاري جمع سياقك الدراسي...',
      });
      await this.chatService.saveUserQuestion(
        userId,
        Number(threadId),
        question,
      );

      const context = await this.chatService.getContext(userId);

      client.emit('status', {
        status: 'searching_knowledge',
        message: 'جاري البحث في محتوى المادة...',
      });
      const rag = await this.chatService.retrieveKnowledge(question, context);

      client.emit('status', {
        status: 'generating',
        message: 'جاري إنشاء الإجابة...',
      });

      const systemPrompt = this.chatService.buildPrompt(context, rag);
      const history = await this.chatService.getHistory(Number(threadId));

      let fullResponse = '';
      for await (const chunk of this.chatService.stream(
        systemPrompt,
        history,
        question,
      )) {
        fullResponse += chunk;
        client.emit('response-chunk', { chunk });
      }

      await this.chatService.saveAssistantReply(
        Number(threadId),
        fullResponse,
        rag.sources,
      );

      client.emit('response-complete', {
        success: true,
        sources: rag.sources,
      });
    } catch (error) {
      this.logger.error(
        `Question failed for student ${userId}`,
        (error as Error).stack,
      );
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'حدث خطأ غير متوقع. حاول مرة أخرى.';
      client.emit('error', { message });
    }
  }

  @SubscribeMessage('generate-question')
  async handleGenerateQuestion(
    @MessageBody() payload: QuizPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.data.userId as number;
    const threadId = payload?.threadId;

    if (!threadId || !Number.isInteger(Number(threadId))) {
      client.emit('error', { message: 'معرّف الجلسة مفقود أو غير صالح.' });
      return;
    }

    try {
      this.chatService.assertWithinLimit(userId);

      client.emit('status', {
        status: 'generating_question',
        message: 'جاري إنشاء سؤال اختبار...',
      });
      const question = await this.chatService.generateQuizQuestion(userId);

      await this.chatService.threads.saveMessage(
        Number(threadId),
        'ASSISTANT',
        'quiz',
        JSON.stringify(question),
      );

      client.emit('quiz-question', { question });
      client.emit('response-complete', { success: true });
    } catch (error) {
      this.logger.error(
        `Quiz question failed for student ${userId}`,
        (error as Error).stack,
      );
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'حدث خطأ غير متوقع. حاول مرة أخرى.';
      client.emit('error', { message });
    }
  }
}
