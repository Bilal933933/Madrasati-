import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface AiSessionClaims {
  /** معرف الطالب (user.id) — المصدر الوحيد الموثوق، لا يُقبل من الفرونت */
  sub: number;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AiTicketService {
  constructor(private readonly jwt: JwtService) {}

  /**
   * يتحقق من تذكرة AI session الموقّعة من Laravel (HS256 بـ AI_SERVICE_SECRET)
   * ويعيد محتواها. يرفض أي تذكرة للطلبة فقط (role = student).
   * @throws UnauthorizedException عند توقيع غير صالح أو انتهاء أو دور غير طالب
   */
  verify(token: string): AiSessionClaims {
    if (!token) {
      throw new UnauthorizedException('Missing AI session token');
    }

    let payload: AiSessionClaims;
    try {
      payload = this.jwt.verify<AiSessionClaims>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired AI session token');
    }

    if (!payload.sub || payload.role !== 'student') {
      throw new UnauthorizedException('AI session is not authorized for this user');
    }

    return payload;
  }
}
