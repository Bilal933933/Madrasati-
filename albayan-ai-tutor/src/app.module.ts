import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
