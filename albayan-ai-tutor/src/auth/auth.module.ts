import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AiSessionGuard } from './ai-session.guard.js';
import { AiTicketService } from './jwt.service.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('AI_SERVICE_SECRET'),
      }),
    }),
  ],
  providers: [AiTicketService, AiSessionGuard],
  exports: [AiTicketService, AiSessionGuard],
})
export class AuthModule {}
