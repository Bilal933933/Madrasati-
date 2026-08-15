import {
  ExecutionContext,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { AppLoggerMiddleware } from './common/logger/app-logger.middleware.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { GlobalExceptionFilter } from './common/errors/global-exception.filter.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StudentContextModule } from './student-context/student-context.module.js';
import { ThreadsModule } from './threads/threads.module.js';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
      // ThrottlerGuard مخصص HTTP — نتخطاه للـ WebSocket حتى لا يكسر الدردشة
      // (حارس الـ WS الحقيقي هو assertWithinLimit في ChatService).
      skipIf: (context: ExecutionContext) => context.getType() === 'ws',
    }),
    PrismaModule,
    AuthModule,
    StudentContextModule,
    KnowledgeModule,
    AiModule,
    ChatModule,
    ThreadsModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
