import { Module } from '@nestjs/common';
import { MarkdownLoader } from './markdown-loader.js';
import { RagService } from './rag.service.js';

@Module({
  providers: [RagService, MarkdownLoader],
  exports: [RagService],
})
export class KnowledgeModule {}
