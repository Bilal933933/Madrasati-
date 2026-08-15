import { UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AiSessionGuard } from '../auth/ai-session.guard.js';
import { LoggerService } from '../common/logger/logger.service.js';
import { CustomValidationPipe } from '../common/pipes/validation.pipe.js';
import { corsOrigins } from '../common/security/cors.config.js';
import { ChatService } from './chat.service.js';
import { GenerateQuestionDto } from './dto/generate-question.dto.js';
import { SendQuestionDto } from './dto/send-question.dto.js';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: corsOrigins(),
  },
})
@UseGuards(AiSessionGuard)
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly loggerService: LoggerService,
  ) {}

  @SubscribeMessage('question')
  async handleQuestion(
    @MessageBody(CustomValidationPipe) payload: SendQuestionDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = (client.data as { userId: number }).userId;
    const { threadId, question } = payload;
    const start = Date.now();
    const requestId = randomUUID();
    (client.data as { requestId?: string }).requestId = requestId;

    this.loggerService.debug(
      { event: 'question_received', userId, threadId, requestId },
      'Student sent a question',
      { questionLength: question.length },
    );

    try {
      this.chatService.assertWithinLimit(userId);

      client.emit('status', {
        status: 'aggregating_context',
        message: 'جاري جمع سياقك الدراسي...',
      });
      await this.chatService.saveUserQuestion(userId, threadId, question);

      const context = await this.chatService.getContext(userId);

      client.emit('status', {
        status: 'searching_knowledge',
        message: 'جاري البحث في محتوى المادة...',
      });
      const ragStart = Date.now();
      const rag = await this.chatService.retrieveKnowledge(question, context);
      this.loggerService.performance(
        { event: 'rag_retrieval', userId, threadId, requestId },
        {
          operation: 'rag.retrieveKnowledge',
          duration: Date.now() - ragStart,
          status: 'success',
          itemsProcessed: rag.sources.length,
        },
      );

      client.emit('status', {
        status: 'generating',
        message: 'جاري إنشاء الإجابة...',
      });

      const systemPrompt = this.chatService.buildPrompt(context, rag);
      const history = await this.chatService.getHistory(threadId);

      const streamStart = Date.now();
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
        threadId,
        fullResponse,
        rag.sources,
      );

      this.loggerService.info(
        { event: 'question_answered', userId, threadId, requestId },
        'Question answered',
        {
          durationMs: Date.now() - start,
          streamDurationMs: Date.now() - streamStart,
          answerLength: fullResponse.length,
          sources: rag.sources.length,
        },
      );

      client.emit('response-complete', {
        success: true,
        sources: rag.sources,
      });
    } catch (error) {
      this.loggerService.error(
        { event: 'question_failed', userId, threadId, requestId },
        'Failed to answer question',
        error,
      );
      throw error;
    }
  }

  @SubscribeMessage('generate-question')
  async handleGenerateQuestion(
    @MessageBody(CustomValidationPipe) payload: GenerateQuestionDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = (client.data as { userId: number }).userId;
    const { threadId } = payload;
    const start = Date.now();
    const requestId = randomUUID();
    (client.data as { requestId?: string }).requestId = requestId;

    this.loggerService.debug(
      { event: 'quiz_generate_received', userId, threadId, requestId },
      'Student requested a quiz question',
    );

    try {
      this.chatService.assertWithinLimit(userId);

      client.emit('status', {
        status: 'generating_question',
        message: 'جاري إنشاء سؤال اختبار...',
      });
      const question = await this.chatService.generateQuizQuestion(userId);

      await this.chatService.threads.saveMessage(
        threadId,
        'ASSISTANT',
        'quiz',
        JSON.stringify(question),
      );

      this.loggerService.info(
        { event: 'quiz_generate_done', userId, threadId, requestId },
        'Quiz question generated',
        { durationMs: Date.now() - start },
      );

      client.emit('quiz-question', { question });
      client.emit('response-complete', { success: true });
    } catch (error) {
      this.loggerService.error(
        { event: 'quiz_generate_failed', userId, threadId, requestId },
        'Failed to generate quiz question',
        error,
      );
      throw error;
    }
  }
}
