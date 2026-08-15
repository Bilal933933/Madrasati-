import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from './logger.service.js';

interface RequestWithUser extends Request {
  requestId?: string;
  user?: { userId?: number };
}

/** يسجل كل طلب HTTP: المدة + requestId (من الهيدر أو مولّد) + userId. */
@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const request = req as RequestWithUser;
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    request.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = Date.now();
    res.on('finish', () => {
      this.loggerService.info(
        {
          event: 'http_request',
          requestId,
          userId: request.user?.userId,
        },
        `HTTP ${req.method} ${req.originalUrl} -> ${res.statusCode}`,
        { durationMs: Date.now() - start, statusCode: res.statusCode },
      );
    });

    next();
  }
}
