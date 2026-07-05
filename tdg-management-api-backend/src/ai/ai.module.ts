import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { GeminiModule } from 'src/common/gemini/gemini.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { LockManagementModule } from 'src/lock-management/lock-management.module';

import { AiController } from './controller/ai.controller';
import { EmbeddingService } from './services/embedding.service';
import { IndexingService } from './services/indexing.service';
import { IndexOutboxService } from './services/index-outbox.service';
import { AiAccessService } from './services/ai-access.service';
import { EstimationService } from './services/estimation.service';
import { RetrievalService } from './services/retrieval.service';
import { CopilotService } from './services/copilot.service';
import { EmbeddingRepository } from './repositories/embedding.repository';
import { OutboxRepository } from './repositories/outbox.repository';
import { IndexSweeperJob } from './jobs/index-sweeper.job';

/**
 * Vector-search foundation (Sprint 2 / M0) plus retrieval-based estimation
 * (Sprint 3 / M1): embedding, indexing and raw-SQL ANN over pgvector, the
 * permission-scoping service, and the k-NN estimation assistant. Sprint 4 / M2
 * adds the permission-scoped RAG copilot (retrieval + grounded generation with
 * citations) on top of these providers. Sprint 5 / M3 adds SSE answer streaming
 * and incremental freshness: the `IndexOutbox` write-path seam
 * (`IndexOutboxService`) plus the `IndexSweeperJob` cron that drains it and runs
 * a nightly reconciliation.
 */
@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    GeminiModule,
    TokensModule,
    LockManagementModule,
  ],
  controllers: [AiController],
  providers: [
    EmbeddingService,
    IndexingService,
    IndexOutboxService,
    AiAccessService,
    EstimationService,
    RetrievalService,
    CopilotService,
    EmbeddingRepository,
    OutboxRepository,
    IndexSweeperJob,
  ],
  exports: [
    EmbeddingService,
    IndexingService,
    IndexOutboxService,
    AiAccessService,
    EstimationService,
    RetrievalService,
    CopilotService,
    EmbeddingRepository,
  ],
})
export class AiModule {}
