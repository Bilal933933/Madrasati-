import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service.js';
import { PromptBuilder } from './prompt-builder.js';

@Module({
  providers: [GeminiService, PromptBuilder],
  exports: [GeminiService, PromptBuilder],
})
export class AiModule {}
