import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { GeminiModule } from 'src/common/gemini/gemini.module';
import { TokensModule } from 'src/tokens/tokens.module';

import { AiController } from './controller/ai.controller';
import { EmbeddingService } from './services/embedding.service';
import { IndexingService } from './services/indexing.service';
import { EmbeddingRepository } from './repositories/embedding.repository';

/**
 * Vector-search foundation (Sprint 2 / M0): embedding, indexing and raw-SQL
 * ANN access over pgvector. Later sprints add retrieval, the copilot and
 * estimation on top of these providers.
 */
@Module({
  imports: [PrismaModule, LoggerModule, GeminiModule, TokensModule],
  controllers: [AiController],
  providers: [EmbeddingService, IndexingService, EmbeddingRepository],
  exports: [EmbeddingService, IndexingService, EmbeddingRepository],
})
export class AiModule {}
