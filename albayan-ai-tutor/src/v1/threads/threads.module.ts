import { Module } from '@nestjs/common';
import { AiAdminGuard } from '../auth/ai-admin.guard.js';
import { AdminAiThreadsController } from './admin-threads.controller.js';
import { AdminThreadsService } from './admin-threads.service.js';
import { ThreadsController } from './threads.controller.js';
import { ThreadsService } from './threads.service.js';

@Module({
  controllers: [ThreadsController, AdminAiThreadsController],
  providers: [ThreadsService, AdminThreadsService, AiAdminGuard],
  exports: [ThreadsService],
})
export class ThreadsModule {}
