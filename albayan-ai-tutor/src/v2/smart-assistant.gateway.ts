import { UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AiSessionGuard } from '../v1/auth/ai-session.guard.js';
import { LoggerService } from '../v1/common/logger/logger.service.js';
import { CustomValidationPipe } from '../v1/common/pipes/validation.pipe.js';
import { corsOrigins } from '../v1/common/security/cors.config.js';
import {
  codeOf,
  messageOf,
  statusOf,
} from '../v1/common/errors/global-exception.filter.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { SmartAssistantService } from './smart-assistant.service.js';

/**
 * بوابة المساعد الذكي — نفس قناة الفرونت (`chat`) تمامًا:
 * التبديل بين القديم والجديد شفاف للواجهة، يحدده ACTIVE_ASSISTANT فقط.
 */
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: corsOrigins(),
  },
})
@UseGuards(AiSessionGuard)
export class SmartAssistantGateway {
  constructor(
    private readonly assistant: SmartAssistantService,
    private readonly loggerService: LoggerService,
  ) {}

  @SubscribeMessage('question')
  async handleQuestion(
    @MessageBody(CustomValidationPipe) payload: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = (client.data as { userId: number }).userId;
    const { threadId, question } = payload;
    const start = Date.now();
    const requestId = randomUUID();
    (client.data as { requestId?: string }).requestId = requestId;

    this.loggerService.debug(
      { event: 'question_received', userId, threadId, requestId },
      'Smart assistant received a question',
      { questionLength: question.length },
    );

    try {
      this.assistant.assertWithinLimit(userId);

      client.emit('status', {
        status: 'aggregating_context',
        message: 'جاري جمع سياقك الدراسي...',
      });
      await this.assistant.saveUserQuestion(userId, threadId, question);

      const context = await this.assistant.getContext(userId);

      client.emit('status', {
        status: 'searching_knowledge',
        message: 'جاري البحث في محتوى المادة...',
      });
      const ragStart = Date.now();
      const rag = await this.assistant.retrieveKnowledge(question, context);
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

      const systemPrompt = this.assistant.buildPrompt(context, rag);
      const history = await this.assistant.getHistory(threadId);

      const streamStart = Date.now();
      let fullResponse = '';
      for await (const chunk of this.assistant.stream(
        systemPrompt,
        history,
        question,
      )) {
        fullResponse += chunk;
        client.emit('response-chunk', { chunk });
      }

      await this.assistant.saveAssistantReply(
        threadId,
        fullResponse,
        rag.sources,
      );

      this.loggerService.info(
        { event: 'question_answered', userId, threadId, requestId },
        'Smart assistant answered',
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
        'Smart assistant failed to answer',
        error,
      );
      // استجابة خطأ موحدة للسوكت — نفس شكل ChatGateway.
      client.emit('error', {
        code: codeOf(error),
        message: messageOf(error),
        statusCode: statusOf(error),
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
