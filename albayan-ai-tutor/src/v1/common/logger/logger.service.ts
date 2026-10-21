import { Injectable, Optional } from '@nestjs/common';
import { inspect } from 'node:util';
import { createLogger } from 'winston';
import type { Logger } from 'winston';
import { getWinstonConfig } from './winston.config.js';

export interface LogContext {
  event: string;
  userId?: number;
  threadId?: number;
  requestId?: string;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  status: 'success' | 'failure';
  itemsProcessed?: number;
}

/** فوقها تُسجَّل العملية كـ warn (بطيء فعلاً). */
const SLOW_OP_MS = 2000;
/** فوقها تُسجَّل العملية كـ info (ملحوظة — خط أساس يظهر في production). */
const NOTABLE_OP_MS = 500;

/** غلاف منظم حول Winston — كل سجل يحمل event + سياق (userId/threadId/requestId). */
@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor(@Optional() logger?: Logger) {
    this.logger = logger ?? createLogger(getWinstonConfig());
  }

  debug(context: LogContext, message: string, data?: unknown): void {
    this.logger.debug(message, this.metaOf(context, data));
  }

  info(context: LogContext, message: string, data?: unknown): void {
    this.logger.info(message, this.metaOf(context, data));
  }

  warn(context: LogContext, message: string, data?: unknown): void {
    this.logger.warn(message, this.metaOf(context, data));
  }

  error(
    context: LogContext,
    message: string,
    error?: unknown,
    details?: unknown,
  ): void {
    const meta: Record<string, unknown> = { ...context };
    if (error instanceof Error) {
      meta.errorMessage = error.message;
      meta.stack = error.stack;
    } else if (error !== undefined) {
      meta.errorDetail = inspect(error, { depth: 1 });
    }
    if (details !== undefined) meta.details = details;
    this.logger.error(message, meta);
  }

  performance(context: LogContext, metrics: PerformanceMetrics): void {
    const meta = {
      ...context,
      operation: metrics.operation,
      duration: metrics.duration,
      status: metrics.status,
      ...(metrics.itemsProcessed !== undefined
        ? { itemsProcessed: metrics.itemsProcessed }
        : {}),
    };
    const message = `Performance: ${metrics.operation}`;
    if (metrics.duration > SLOW_OP_MS) {
      this.logger.warn(message, meta);
    } else if (metrics.duration > NOTABLE_OP_MS) {
      this.logger.info(message, meta);
    } else {
      this.logger.debug(message, meta);
    }
  }

  private metaOf(context: LogContext, data?: unknown): Record<string, unknown> {
    return {
      ...context,
      ...(data !== undefined ? { data } : {}),
    };
  }
}
