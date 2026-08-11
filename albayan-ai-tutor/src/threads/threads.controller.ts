import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AiRestGuard } from '../auth/ai-rest.guard.js';
import { ThreadsService, type ThreadDetailDto, type ThreadSummaryDto } from './threads.service.js';

interface AuthedRequest extends Request {
  user: { userId: number; role: string };
}

@Controller('api/threads')
@UseGuards(AiRestGuard)
export class ThreadsController {
  constructor(private readonly threads: ThreadsService) {}

  @Post()
  async create(
    @Req() req: AuthedRequest,
    @Body() body: { subjectId?: number; lessonId?: number },
  ): Promise<ThreadDetailDto> {
    const subjectId = Number(body?.subjectId) || undefined;
    const lessonId = Number(body?.lessonId) || undefined;
    const thread = await this.threads.createThread(req.user.userId, { subjectId, lessonId });
    return this.threads.getThread(Number(thread.id), req.user.userId);
  }

  @Get()
  async list(@Req() req: AuthedRequest): Promise<ThreadSummaryDto[]> {
    return this.threads.listThreads(req.user.userId);
  }

  @Get(':id')
  async get(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ThreadDetailDto> {
    return this.threads.getThread(id, req.user.userId);
  }

  @Delete(':id')
  async remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.threads.deleteThread(id, req.user.userId);
    return { success: true };
  }
}
