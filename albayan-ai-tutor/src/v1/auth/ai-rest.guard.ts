import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AiTicketService } from './jwt.service.js';

/**
 * حارس مصادقة REST لطلبات إدارة الجلسات:
 * - يقرأ التذكرة من `Authorization: Bearer <token>`.
 * - يتحقق منها عبر AiTicketService ثم يخزن { userId, role } في request.user.
 * - أي فشل = UnauthorizedException.
 */
@Injectable()
export class AiRestGuard implements CanActivate {
  constructor(private readonly tickets: AiTicketService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing AI session token');
    }

    const token = header.substring(7);
    try {
      const claims = this.tickets.verify(token);
      (request as Request & { user?: { userId: number; role: string } }).user =
        {
          userId: claims.sub,
          role: claims.role,
        };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired AI session token');
    }
  }
}
