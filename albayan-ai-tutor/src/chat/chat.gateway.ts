import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AiSessionGuard } from '../auth/ai-session.guard.js';
import { CustomValidationPipe } from '../common/pipes/validation.pipe.js';
import { ChatService } from './chat.service.js';
import { GenerateQuestionDto } from './dto/generate-question.dto.js';
import { SendQuestionDto } from './dto/send-question.dto.js';

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
    @MessageBody(CustomValidationPipe) payload: SendQuestionDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = (client.data as { userId: number }).userId;
    const { threadId, question } = payload;

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
    const rag = await this.chatService.retrieveKnowledge(question, context);

    client.emit('status', {
      status: 'generating',
      message: 'جاري إنشاء الإجابة...',
    });

    const systemPrompt = this.chatService.buildPrompt(context, rag);
    const history = await this.chatService.getHistory(threadId);

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

    client.emit('response-complete', {
      success: true,
      sources: rag.sources,
    });
  }

  @SubscribeMessage('generate-question')
  async handleGenerateQuestion(
    @MessageBody(CustomValidationPipe) payload: GenerateQuestionDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = (client.data as { userId: number }).userId;
    const { threadId } = payload;

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

    client.emit('quiz-question', { question });
    client.emit('response-complete', { success: true });
  }
}
