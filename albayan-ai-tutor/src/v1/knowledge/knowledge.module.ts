import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service.js';
import { IndexerService } from './indexer.service.js';
import { MarkdownLoader } from './markdown-loader.js';
import { RagService } from './rag.service.js';
import { VectorService } from './vector.service.js';

@Module({
  providers: [
    RagService,
    MarkdownLoader,
    EmbeddingService,
    VectorService,
    IndexerService,
  ],
  exports: [RagService, IndexerService],
})
export class KnowledgeModule {}
