import { Injectable } from '@nestjs/common';
import { EmbeddingEntityType, IndexOp } from '@prisma/client';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { OutboxRepository } from '../repositories/outbox.repository';

/**
 * The write-path seam for incremental indexing (§4.2 freshness).
 *
 * App write flows (task/comment/epic/milestone/sprint create·update·delete) call
 * these one-liners alongside their existing side effects (reminders,
 * notifications). Each is a single UPSERT into `IndexOutbox` — no embedding, no
 * network call — so the user request never blocks on Gemini. The `IndexSweeperJob`
 * cron drains the queue asynchronously. Enqueue failures are swallowed and logged:
 * a missed index row is caught by the nightly reconciliation, and must never break
 * the task save that triggered it.
 */
@Injectable()
export class IndexOutboxService {
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  /** Queue an entity to be (re)embedded on the next sweep. */
  async enqueueUpsert(
    projectId: string,
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<void> {
    await this.enqueue(projectId, entityType, entityId, IndexOp.UPSERT);
  }

  /** Queue an entity's embeddings to be removed from the index. */
  async enqueueDelete(
    projectId: string,
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<void> {
    await this.enqueue(projectId, entityType, entityId, IndexOp.DELETE);
  }

  private async enqueue(
    projectId: string,
    entityType: EmbeddingEntityType,
    entityId: string,
    op: IndexOp,
  ): Promise<void> {
    try {
      await this.outboxRepository.enqueue({ projectId, entityType, entityId, op });
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Failed to enqueue index job (${op} ${entityType}:${entityId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
        { service: 'Index Outbox Service', method: 'enqueue' },
      );
    }
  }
}
