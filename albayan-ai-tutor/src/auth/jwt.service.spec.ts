import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AiTicketService } from './jwt.service.js';

describe('AiTicketService', () => {
  let service: AiTicketService;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      providers: [AiTicketService],
    }).compile();

    service = moduleRef.get(AiTicketService);
    jwt = moduleRef.get(JwtService);
  });

  it('يعيد معرف الطالب من تذكرة صالحة', () => {
    const token = jwt.sign({ sub: 42, role: 'student' }, { expiresIn: '15m' });
    const claims = service.verify(token);
    expect(claims.sub).toBe(42);
    expect(claims.role).toBe('student');
  });

  it('يرفض التذكرة المفقودة', () => {
    expect(() => service.verify('')).toThrow(UnauthorizedException);
  });

  it('يرفض التذكرة المزورة', () => {
    const token = jwt.sign({ sub: 42, role: 'student' }, { expiresIn: '15m' });
    expect(() => service.verify(`${token}forged`)).toThrow(UnauthorizedException);
  });

  it('يرفض تذكرة غير طالب (admin)', () => {
    const token = jwt.sign({ sub: 1, role: 'admin' }, { expiresIn: '15m' });
    expect(() => service.verify(token)).toThrow(UnauthorizedException);
  });

  it('يرفض التذكرة منتهية الصلاحية', () => {
    const token = jwt.sign({ sub: 42, role: 'student' }, { expiresIn: '-1s' });
    expect(() => service.verify(token)).toThrow(UnauthorizedException);
  });
});
