import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IndexOp } from '@prisma/client';
import { LockManagementService } from 'src/lock-management/services/lock-management.service';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { IndexingService } from '../services/indexing.service';
import { OutboxRepository, OutboxJob } from '../repositories/outbox.repository';

/**
 * Incremental re-indexing worker (§4.2 freshness).
 *
 * Every minute it drains due `IndexOutbox` jobs — the rows app write paths
 * enqueue when tasks/comments/epics/milestones/sprints change — embedding each
 * through `IndexingService` off the request hot path. Transient failures are
 * retried with exponential backoff; jobs that exhaust the budget are marked
 * FAILED with the last error. A nightly reconciliation re-queues anything whose
 * source drifted newer than its embedding and removes orphaned embeddings, so
 * the index self-heals even if a write-path enqueue was ever missed.
 *
 * Both crons take a distributed lock (same pattern as `ReminderSchedulerService`)
 * so only one instance sweeps at a time.
 */
@Injectable()
export class IndexSweeperJob implements OnModuleInit {
  private readonly logger = new Logger(IndexSweeperJob.name);
  private readonly sweepLock = 'aiIndexSweepLock';
  private readonly reconcileLock = 'aiIndexReconcileLock';
  private readonly lockTTL = 55; // seconds — just under the 1-min cron cadence

  /** Jobs drained per sweep — bounded so a burst can't starve the tick. */
  private readonly batchSize = 25;
  /** Retry budget before a job is marked FAILED. */
  private readonly maxAttempts = 5;
  /** Backoff base and cap for transient failures. */
  private readonly backoffBaseSeconds = 30;
  private readonly backoffCapSeconds = 15 * 60;

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly indexingService: IndexingService,
    private readonly lockManagementService: LockManagementService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  onModuleInit() {
    this.lockManagementService.createOrUpdateLock(this.sweepLock, 'Unlocked', 0);
    this.lockManagementService.createOrUpdateLock(
      this.reconcileLock,
      'Unlocked',
      0,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep(): Promise<void> {
    try {
      const acquired = await this.lockManagementService.lock(
        this.sweepLock,
        'locked',
        this.lockTTL,
      );
      if (!acquired) return;

      const jobs = await this.outboxRepository.claimDue(this.batchSize);
      if (jobs.length === 0) return;

      this.logger.log(`Draining ${jobs.length} index outbox job(s)`);
      for (const job of jobs) {
        await this.processJob(job);
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error draining index outbox: ' +
          (error instanceof Error ? error.message : String(error)),
        { service: 'Index Sweeper Job', method: 'sweep' },
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async reconcile(): Promise<void> {
    try {
      const acquired = await this.lockManagementService.lock(
        this.reconcileLock,
        'locked',
        this.lockTTL,
      );
      if (!acquired) return;

      this.logger.log('Running nightly index reconciliation...');
      const { requeued, removed } = await this.indexingService.reconcile();
      this.logger.log(
        `Reconciliation queued ${requeued} re-index and ${removed} delete job(s)`,
      );
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error reconciling index: ' +
          (error instanceof Error ? error.message : String(error)),
        { service: 'Index Sweeper Job', method: 'reconcile' },
      );
    }
  }

  /** Embed (or delete) one job, marking it DONE, scheduled-for-retry, or FAILED. */
  private async processJob(job: OutboxJob): Promise<void> {
    try {
      if (job.op === IndexOp.DELETE) {
        await this.indexingService.deleteEmbedding(job.entityType, job.entityId);
      } else {
        await this.indexingService.syncEntity(job.entityType, job.entityId);
      }
      await this.outboxRepository.markDone(job.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const attempts = job.attempts + 1;
      if (attempts >= this.maxAttempts) {
        await this.outboxRepository.markFailed(job.id, message);
        this.backgroundActivitiesLoggerService.log(
          `Index job ${job.op} ${job.entityType}:${job.entityId} FAILED after ${attempts} attempts: ${message}`,
          { service: 'Index Sweeper Job', method: 'processJob' },
        );
      } else {
        await this.outboxRepository.markRetry(
          job.id,
          this.nextAttemptAt(attempts),
          message,
        );
      }
    }
  }

  /** Exponential backoff with jitter, capped: 30s, 60s, 120s, … ≤ 15 min. */
  private nextAttemptAt(attempts: number): Date {
    const seconds = Math.min(
      this.backoffBaseSeconds * 2 ** (attempts - 1),
      this.backoffCapSeconds,
    );
    const jitter = Math.random() * this.backoffBaseSeconds;
    return new Date(Date.now() + (seconds + jitter) * 1000);
  }
}
