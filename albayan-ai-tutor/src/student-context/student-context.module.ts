import { Module } from '@nestjs/common';
import { ContextService } from './context.service.js';
import { PerformanceService } from './performance.service.js';
import { ProgressService } from './progress.service.js';

@Module({
  providers: [ContextService, ProgressService, PerformanceService],
  exports: [ContextService],
})
export class StudentContextModule {}