import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * حارس مصادقة آخر-خدمة (Service-to-Service) لمسار التصحيح:
 * Laravel يرسل `x-ai-service-key` في الترويسة مطابقة لبيئة `AI_SERVICE_KEY`.
 * لا يُستخدم تذكرة الطالب هنا — طلب التصحيح صادر من الخادم لا من المتصفح.
 */
@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-ai-service-key'];
    const expected = this.config.get<string>('AI_SERVICE_KEY');

    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid AI service key');
    }

    return true;
  }
}