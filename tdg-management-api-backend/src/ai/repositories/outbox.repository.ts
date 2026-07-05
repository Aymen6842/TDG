import { Injectable } from '@nestjs/common';
import { EmbeddingEntityType, IndexOp, OutboxStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

/** A PENDING outbox row the sweeper has picked up to (re)index. */
export interface OutboxJob {
  id: string;
  projectId: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  op: IndexOp;
  attempts: number;
}

/**
 * All access to the `IndexOutbox` work queue (§3.2 / §4.2).
 *
 * Writes collapse repeated edits into a single PENDING row via the unique
 * `(entityType, entityId)` constraint, so a task edited ten times before the
 * sweeper runs is embedded once. The sweeper claims due rows, then marks each
 * DONE, scheduled-for-retry (with exponential backoff), or FAILED.
 */
@Injectable()
export class OutboxRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Enqueue (or re-arm) an indexing job for one entity. Idempotent per
   * `(entityType, entityId)`: an existing row is reset to PENDING with the new
   * op and a cleared retry state, collapsing repeated edits into one job.
   */
  async enqueue(params: {
    projectId: string;
    entityType: EmbeddingEntityType;
    entityId: string;
    op: IndexOp;
  }): Promise<void> {
    const { projectId, entityType, entityId, op } = params;
    await this.prismaService.indexOutbox.upsert({
      where: { entityType_entityId: { entityType, entityId } },
      create: { projectId, entityType, entityId, op },
      update: {
        projectId,
        op,
        status: OutboxStatus.PENDING,
        attempts: 0,
        nextAttemptAt: new Date(),
        lastError: null,
      },
    });
  }

  /** Claim up to `limit` due PENDING jobs, oldest first. */
  async claimDue(limit: number): Promise<OutboxJob[]> {
    return this.prismaService.indexOutbox.findMany({
      where: { status: OutboxStatus.PENDING, nextAttemptAt: { lte: new Date() } },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        projectId: true,
        entityType: true,
        entityId: true,
        op: true,
        attempts: true,
      },
    });
  }

  /** Mark a job successfully processed. */
  async markDone(id: string): Promise<void> {
    await this.prismaService.indexOutbox.update({
      where: { id },
      data: { status: OutboxStatus.DONE, attempts: { increment: 1 }, lastError: null },
    });
  }

  /** Reschedule a transiently-failed job for a later retry (stays PENDING). */
  async markRetry(id: string, nextAttemptAt: Date, error: string): Promise<void> {
    await this.prismaService.indexOutbox.update({
      where: { id },
      data: {
        status: OutboxStatus.PENDING,
        attempts: { increment: 1 },
        nextAttemptAt,
        lastError: error.slice(0, 500),
      },
    });
  }

  /** Give up on a job after the retry budget is exhausted. */
  async markFailed(id: string, error: string): Promise<void> {
    await this.prismaService.indexOutbox.update({
      where: { id },
      data: {
        status: OutboxStatus.FAILED,
        attempts: { increment: 1 },
        lastError: error.slice(0, 500),
      },
    });
  }
}
