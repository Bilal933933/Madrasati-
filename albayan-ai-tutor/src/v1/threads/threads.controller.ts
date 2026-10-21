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
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { AiRestGuard } from '../auth/ai-rest.guard.js';
import { CustomValidationPipe } from '../common/pipes/validation.pipe.js';
import { CreateThreadDto } from './dto/create-thread.dto.js';
import {
  ThreadsService,
  type ThreadDetailDto,
  type ThreadSummaryDto,
} from './threads.service.js';

interface AuthedRequest extends Request {
  user: { userId: number; role: string };
}

@Controller('api/threads')
@UseGuards(AiRestGuard)
@UsePipes(CustomValidationPipe)
export class ThreadsController {
  constructor(private readonly threads: ThreadsService) {}

  @Post()
  async create(
    @Req() req: AuthedRequest,
    @Body() dto: CreateThreadDto,
  ): Promise<ThreadDetailDto> {
    const thread = await this.threads.createThread(req.user.userId, {
      subjectId: dto.subjectId,
      lessonId: dto.lessonId,
    });
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
