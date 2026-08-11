import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { AiTicketService } from './jwt.service.js';

/**
 * حارس مصادقة اتصالات الـ WebSocket:
 * - يقرأ التذكرة من client.handshake.auth.token (لا من الجسم ولا من الـ URL).
 * - يتحقق منها عبر AiTicketService ثم يخزن { userId, role } في client.data.
 * - أي فشل = UnauthorizedException (يُرسل للعميل كحدث خطأ ويُغلق الاتصال).
 */
@Injectable()
export class AiSessionGuard implements CanActivate {
  constructor(private readonly tickets: AiTicketService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake?.auth?.token as string | undefined;

    try {
      const claims = this.tickets.verify(token ?? '');
      client.data.userId = claims.sub;
      client.data.role = claims.role;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        client.emit('error', { message: 'مصادقة AI Tutor مرفوضة. أعد تسجيل الدخول.' });
        client.disconnect();
        return false;
      }
      throw error;
    }
  }
}
