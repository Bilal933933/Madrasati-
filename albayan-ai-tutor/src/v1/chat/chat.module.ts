import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { StudentContextModule } from '../student-context/student-context.module.js';
import { ThreadsModule } from '../threads/threads.module.js';
import { ChatGateway } from './chat.gateway.js';
import { ChatService } from './chat.service.js';

@Module({
  imports: [StudentContextModule, KnowledgeModule, AiModule, ThreadsModule],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
