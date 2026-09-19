import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AiAdminGuard } from '../auth/ai-admin.guard.js';
import {
  AdminThreadsService,
  type AdminThreadDetailDto,
  type AdminThreadListResultDto,
  type AdminThreadStatsDto,
} from './admin-threads.service.js';

/**
 * مراجعة جلسات المعلم الآلي من لوحة الأدمن — للقراءة فقط ومحمية
 * بحارس AiAdminGuard (دور المشرف). لا تنتمي لمسارات الطالب.
 */
@Controller('api/admin/ai-threads')
@UseGuards(AiAdminGuard)
export class AdminAiThreadsController {
  constructor(private readonly admin: AdminThreadsService) {}

  @Get('stats')
  async stats(): Promise<AdminThreadStatsDto> {
    return this.admin.stats();
  }

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('search') search?: string,
  ): Promise<AdminThreadListResultDto> {
    return this.admin.list({
      page: page != null ? Number(page) : undefined,
      perPage: perPage != null ? Number(perPage) : undefined,
      search,
    });
  }

  @Get(':id')
  async detail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminThreadDetailDto> {
    return this.admin.detail(id);
  }
}
