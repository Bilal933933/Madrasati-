import { ExecutionContext, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from '../v1/ai/ai.module.js';
import { AuthModule } from '../v1/auth/auth.module.js';
import { LoggerModule } from '../v1/common/logger/logger.module.js';
import { GlobalExceptionFilter } from '../v1/common/errors/global-exception.filter.js';
import { ExamModule } from '../v1/exam/exam.module.js';
import { KnowledgeModule } from '../v1/knowledge/knowledge.module.js';
import { PrismaModule } from '../v1/prisma/prisma.module.js';
import { StudentContextModule } from '../v1/student-context/student-context.module.js';
import { ThreadsModule } from '../v1/threads/threads.module.js';
import { SmartAssistantModule } from './smart-assistant.module.js';

/**
 * حزمة الإصدار الثاني (v2) — المساعد الجديد.
 * يعيد استخدام البنية المشتركة من v1 (تُسجَّل هنا لا هناك — واحد فعال فقط).
 * تُسجَّل وحدها عندما يكون ACTIVE_ASSISTANT = smart-assistant/v2 (الافتراضي).
 */
@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
      // نفس سياسة v1: تخطي حارس HTTP للـ WebSocket (الحارس الحقيقي حد المعدل).
      skipIf: (context: ExecutionContext) => context.getType() === 'ws',
    }),
    PrismaModule,
    AuthModule,
    StudentContextModule,
    KnowledgeModule,
    AiModule,
    ThreadsModule,
    ExamModule,
    SmartAssistantModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class V2Module {}
