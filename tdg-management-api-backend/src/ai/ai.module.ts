import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { GeminiModule } from 'src/common/gemini/gemini.module';
import { TokensModule } from 'src/tokens/tokens.module';

import { AiController } from './controller/ai.controller';
import { EmbeddingService } from './services/embedding.service';
import { IndexingService } from './services/indexing.service';
import { AiAccessService } from './services/ai-access.service';
import { EstimationService } from './services/estimation.service';
import { EmbeddingRepository } from './repositories/embedding.repository';

/**
 * Vector-search foundation (Sprint 2 / M0) plus retrieval-based estimation
 * (Sprint 3 / M1): embedding, indexing and raw-SQL ANN over pgvector, the
 * permission-scoping service, and the k-NN estimation assistant. Later sprints
 * add the copilot on top of these providers.
 */
@Module({
  imports: [PrismaModule, LoggerModule, GeminiModule, TokensModule],
  controllers: [AiController],
  providers: [
    EmbeddingService,
    IndexingService,
    AiAccessService,
    EstimationService,
    EmbeddingRepository,
  ],
  exports: [
    EmbeddingService,
    IndexingService,
    AiAccessService,
    EstimationService,
    EmbeddingRepository,
  ],
})
export class AiModule {}
