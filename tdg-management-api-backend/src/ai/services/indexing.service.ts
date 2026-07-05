import { Injectable } from '@nestjs/common';
import { EmbeddingEntityType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { EmbeddingService } from './embedding.service';
import { EmbeddingRepository } from '../repositories/embedding.repository';

/** A chunk of source content ready to be embedded and stored. */
interface ChunkRecord {
  projectId: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  contentHash: string;
}

export interface ReindexSummary {
  tasks: number;
  comments: number;
  epics: number;
  milestones: number;
  sprints: number;
  chunksTotal: number;
  chunksEmbedded: number;
  chunksSkipped: number;
}

/**
 * Turns app content into embedded `DocumentEmbedding` chunks (§4.2).
 *
 * Chunking strategy per entity type is centralized here. `upsertEmbedding` /
 * `deleteEmbedding` are the write primitives; `reindexAll` is the one-shot
 * backfill that (re)embeds all existing content, skipping chunks whose sha256
 * content hash is unchanged so re-runs are cheap and idempotent.
 */
@Injectable()
export class IndexingService {
  /** ~512 tokens ≈ 2000 chars; long text is split with ~15% overlap. */
  private readonly maxChunkChars = 2000;
  private readonly chunkOverlapChars = 300;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  // ─── Chunk builders (per entity type, §4.2) ────────────────────────────────

  /** Task → `[TASK-key] title / description` + a metadata line; split if long. */
  buildTaskChunks(task: {
    key: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    type: string;
    storyPoints: number | null;
    assignee: { name: string } | null;
    epic: { name: string } | null;
    milestone: { name: string } | null;
  }): string[] {
    const meta = [
      `status: ${task.status}`,
      `priority: ${task.priority}`,
      `type: ${task.type}`,
      task.assignee ? `assignee: ${task.assignee.name}` : null,
      task.epic ? `epic: ${task.epic.name}` : null,
      task.milestone ? `milestone: ${task.milestone.name}` : null,
      task.storyPoints != null ? `storyPoints: ${task.storyPoints}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    const text =
      `[${task.key}] ${task.title}` +
      (task.description ? `\n${task.description}` : '') +
      `\n(${meta})`;

    return this.splitIntoChunks(text);
  }

  /** Comment → `[Comment on TASK-key by author] content` (decisions hide here). */
  buildCommentChunks(comment: {
    content: string;
    author: { name: string };
    task: { key: string };
  }): string[] {
    const text = `[Comment on ${comment.task.key} by ${comment.author.name}] ${comment.content}`;
    return this.splitIntoChunks(text);
  }

  /** Epic / Milestone / Sprint → label + name + description/details. */
  buildNamedEntityChunks(
    label: string,
    entity: { name: string; description?: string | null; details?: string | null },
  ): string[] {
    const text = [
      `[${label}] ${entity.name}`,
      entity.description ?? '',
      entity.details ?? '',
    ]
      .filter((part) => part && part.trim().length > 0)
      .join('\n');
    return this.splitIntoChunks(text);
  }

  /**
   * Character-based splitter approximating ~512-token chunks with ~15% overlap.
   * Short content (the common case) returns a single chunk.
   */
  private splitIntoChunks(text: string): string[] {
    const trimmed = text.trim();
    if (trimmed.length <= this.maxChunkChars) return [trimmed];

    const chunks: string[] = [];
    const step = this.maxChunkChars - this.chunkOverlapChars;
    for (let start = 0; start < trimmed.length; start += step) {
      chunks.push(trimmed.slice(start, start + this.maxChunkChars));
      if (start + this.maxChunkChars >= trimmed.length) break;
    }
    return chunks;
  }

  private estimateTokens(content: string): number {
    return Math.max(1, Math.ceil(content.length / 4));
  }

  // ─── Write primitives ──────────────────────────────────────────────────────

  /**
   * (Re)embed one entity's chunks. Chunks whose content hash matches the stored
   * hash are skipped (no API call); stale trailing chunks (from a shrink) are
   * deleted. Returns how many chunks were embedded vs skipped.
   */
  async upsertEmbedding(params: {
    projectId: string;
    entityType: EmbeddingEntityType;
    entityId: string;
    chunks: string[];
  }): Promise<{ embedded: number; skipped: number }> {
    const { projectId, entityType, entityId, chunks } = params;

    const existing = await this.embeddingRepository.getExistingChunks(
      entityType,
      entityId,
    );
    const existingHashByIndex = new Map(
      existing.map((row) => [row.chunkIndex, row.contentHash]),
    );

    const changed: {
      chunkIndex: number;
      content: string;
      contentHash: string;
    }[] = [];
    let skipped = 0;

    chunks.forEach((content, chunkIndex) => {
      const contentHash = this.embeddingService.contentHash(content);
      if (existingHashByIndex.get(chunkIndex) === contentHash) {
        skipped += 1;
      } else {
        changed.push({ chunkIndex, content, contentHash });
      }
    });

    if (changed.length > 0) {
      const vectors = await this.embeddingService.embedBatch(
        changed.map((chunk) => chunk.content),
        'RETRIEVAL_DOCUMENT',
      );
      for (let i = 0; i < changed.length; i += 1) {
        const chunk = changed[i];
        await this.embeddingRepository.upsertChunk({
          projectId,
          entityType,
          entityId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: this.estimateTokens(chunk.content),
          embedding: vectors[i],
          contentHash: chunk.contentHash,
        });
      }
    }

    // Remove any previously-stored chunks beyond the new chunk count.
    const staleIndexes = existing
      .map((row) => row.chunkIndex)
      .filter((index) => index >= chunks.length);
    await this.embeddingRepository.deleteChunks(
      entityType,
      entityId,
      staleIndexes,
    );

    return { embedded: changed.length, skipped };
  }

  /** Remove all embeddings for an entity (e.g. when the source row is deleted). */
  async deleteEmbedding(
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<void> {
    await this.embeddingRepository.deleteByEntity(entityType, entityId);
  }

  // ─── One-shot backfill ─────────────────────────────────────────────────────

  /**
   * Embed all existing tasks, comments, epics, milestones and sprints. Safe to
   * re-run: unchanged content is skipped via the content hash. This backs both
   * the `ai:backfill` script and the admin reindex endpoint.
   */
  async reindexAll(): Promise<ReindexSummary> {
    const summary: ReindexSummary = {
      tasks: 0,
      comments: 0,
      epics: 0,
      milestones: 0,
      sprints: 0,
      chunksTotal: 0,
      chunksEmbedded: 0,
      chunksSkipped: 0,
    };

    const index = async (
      projectId: string,
      entityType: EmbeddingEntityType,
      entityId: string,
      chunks: string[],
    ) => {
      if (chunks.length === 0) return;
      const { embedded, skipped } = await this.upsertEmbedding({
        projectId,
        entityType,
        entityId,
        chunks,
      });
      summary.chunksTotal += chunks.length;
      summary.chunksEmbedded += embedded;
      summary.chunksSkipped += skipped;
    };

    // Tasks
    const tasks = await this.prismaService.task.findMany({
      select: {
        id: true,
        projectId: true,
        key: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        type: true,
        storyPoints: true,
        assignee: { select: { name: true } },
        epic: { select: { name: true } },
        milestone: { select: { name: true } },
      },
    });
    for (const task of tasks) {
      await index(
        task.projectId,
        EmbeddingEntityType.TASK,
        task.id,
        this.buildTaskChunks(task),
      );
      summary.tasks += 1;
    }

    // Task comments
    const comments = await this.prismaService.taskComment.findMany({
      select: {
        id: true,
        content: true,
        author: { select: { name: true } },
        task: { select: { key: true, projectId: true } },
      },
    });
    for (const comment of comments) {
      await index(
        comment.task.projectId,
        EmbeddingEntityType.TASK_COMMENT,
        comment.id,
        this.buildCommentChunks(comment),
      );
      summary.comments += 1;
    }

    // Epics
    const epics = await this.prismaService.epic.findMany({
      select: { id: true, projectId: true, name: true, description: true },
    });
    for (const epic of epics) {
      await index(
        epic.projectId,
        EmbeddingEntityType.EPIC,
        epic.id,
        this.buildNamedEntityChunks('Epic', epic),
      );
      summary.epics += 1;
    }

    // Milestones
    const milestones = await this.prismaService.milestone.findMany({
      select: { id: true, projectId: true, name: true, description: true },
    });
    for (const milestone of milestones) {
      await index(
        milestone.projectId,
        EmbeddingEntityType.MILESTONE,
        milestone.id,
        this.buildNamedEntityChunks('Milestone', milestone),
      );
      summary.milestones += 1;
    }

    // Sprints (name/description/details live in the English SprintContent row)
    const sprints = await this.prismaService.sprint.findMany({
      select: {
        id: true,
        projectId: true,
        contents: {
          select: { name: true, description: true, details: true, language: true },
        },
      },
    });
    for (const sprint of sprints) {
      const content =
        sprint.contents.find((row) => row.language === 'English') ??
        sprint.contents[0];
      if (content) {
        await index(
          sprint.projectId,
          EmbeddingEntityType.SPRINT,
          sprint.id,
          this.buildNamedEntityChunks('Sprint', content),
        );
      }
      summary.sprints += 1;
    }

    this.backgroundActivitiesLoggerService.log(
      `AI backfill complete: ${JSON.stringify(summary)}`,
      { service: 'Indexing Service', method: 'reindexAll' },
    );

    return summary;
  }
}
