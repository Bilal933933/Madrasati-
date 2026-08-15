import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AiSessionGuard } from '../auth/ai-session.guard.js';
import { ValidationError } from '../common/errors/validation-error.js';
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
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('question')
  async handleQuestion(
    @MessageBody() payload: QuestionPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = (client.data as { userId: number }).userId;
    const threadId = payload?.threadId;
    const question = payload?.question?.trim();

    if (!threadId || !Number.isInteger(Number(threadId))) {
      throw new ValidationError('معرّف الجلسة مفقود أو غير صالح.');
    }

    if (!question || question.length < 2) {
      throw new ValidationError('السؤال فارغ أو قصير جدًا.');
    }

    if (question.length > 2000) {
      throw new ValidationError('السؤال أطول من المسموح (2000 حرف).');
    }

    this.chatService.assertWithinLimit(userId);

    client.emit('status', {
      status: 'aggregating_context',
      message: 'جاري جمع سياقك الدراسي...',
    });
    await this.chatService.saveUserQuestion(userId, Number(threadId), question);

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
  }

  @SubscribeMessage('generate-question')
  async handleGenerateQuestion(
    @MessageBody() payload: QuizPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = (client.data as { userId: number }).userId;
    const threadId = payload?.threadId;

    if (!threadId || !Number.isInteger(Number(threadId))) {
      throw new ValidationError('معرّف الجلسة مفقود أو غير صالح.');
    }

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
  }
}
