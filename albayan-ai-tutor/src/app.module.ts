import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StudentContextModule } from './student-context/student-context.module.js';
import { ThreadsModule } from './threads/threads.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StudentContextModule,
    KnowledgeModule,
    AiModule,
    ChatModule,
    ThreadsModule,
  ],
})
export class AppModule {}