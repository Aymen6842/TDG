import { Injectable } from '@nestjs/common';
import { Prisma, EmbeddingEntityType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { EmbeddingService } from '../services/embedding.service';

/** A single ANN hit returned by {@link EmbeddingRepository.searchVector}. */
export interface VectorSearchResult {
  id: string;
  projectId: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  chunkIndex: number;
  content: string;
  /** Cosine similarity in [0, 1] (1 = identical direction). */
  score: number;
}

export interface VectorSearchFilters {
  entityType?: EmbeddingEntityType;
}

/**
 * A completed task retrieved as a k-NN estimation neighbor: the DONE task whose
 * embedding is nearest the draft, carrying its real outcome (`actualHours`) and
 * `storyPoints` as the regression targets (§4.6).
 */
export interface CompletedTaskNeighbor {
  key: string;
  title: string;
  /** Real logged effort of the completed task (`Task.actualHours`, hours). */
  actualHours: number;
  storyPoints: number | null;
  /** Cosine similarity in [0, 1] between the draft and this task's embedding. */
  similarity: number;
}

/**
 * All raw-SQL access to the pgvector `DocumentEmbedding.embedding` column.
 *
 * Prisma cannot type the `vector` column, so every read/write of it goes
 * through `$queryRaw` / `$executeRaw` here. Vectors cross the wire as the
 * pgvector text literal `[v1,v2,...]` cast with `::vector`.
 */
@Injectable()
export class EmbeddingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /** pgvector text literal, e.g. `[0.1,0.2,0.3]`. */
  private toVectorLiteral(vector: number[]): string {
    return `[${vector.join(',')}]`;
  }

  /** Existing chunks for an entity, so the indexer can skip unchanged content. */
  async getExistingChunks(
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<{ chunkIndex: number; contentHash: string }[]> {
    return this.prismaService.documentEmbedding.findMany({
      where: { entityType, entityId },
      select: { chunkIndex: true, contentHash: true },
      orderBy: { chunkIndex: 'asc' },
    });
  }

  /** Insert or replace one embedded chunk (keyed by entityType+entityId+chunkIndex). */
  async upsertChunk(params: {
    projectId: string;
    entityType: EmbeddingEntityType;
    entityId: string;
    chunkIndex: number;
    content: string;
    tokenCount: number;
    embedding: number[];
    contentHash: string;
  }): Promise<void> {
    const vectorLiteral = this.toVectorLiteral(params.embedding);

    await this.prismaService.$executeRaw`
      INSERT INTO "DocumentEmbedding"
        ("projectId", "entityType", "entityId", "chunkIndex", "content",
         "tokenCount", "embedding", "contentHash", "model", "updatedAt")
      VALUES (
        ${params.projectId},
        ${params.entityType}::"EmbeddingEntityType",
        ${params.entityId},
        ${params.chunkIndex},
        ${params.content},
        ${params.tokenCount},
        ${vectorLiteral}::vector,
        ${params.contentHash},
        ${EmbeddingService.MODEL},
        NOW()
      )
      ON CONFLICT ("entityType", "entityId", "chunkIndex")
      DO UPDATE SET
        "projectId"   = EXCLUDED."projectId",
        "content"     = EXCLUDED."content",
        "tokenCount"  = EXCLUDED."tokenCount",
        "embedding"   = EXCLUDED."embedding",
        "contentHash" = EXCLUDED."contentHash",
        "model"       = EXCLUDED."model",
        "updatedAt"   = NOW();
    `;
  }

  /** Delete every chunk of an entity (used on entity delete / re-chunk shrink). */
  async deleteByEntity(
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<void> {
    await this.prismaService.documentEmbedding.deleteMany({
      where: { entityType, entityId },
    });
  }

  /** Delete specific chunk indexes of an entity (stale tail after re-chunking). */
  async deleteChunks(
    entityType: EmbeddingEntityType,
    entityId: string,
    chunkIndexes: number[],
  ): Promise<void> {
    if (chunkIndexes.length === 0) return;
    await this.prismaService.documentEmbedding.deleteMany({
      where: { entityType, entityId, chunkIndex: { in: chunkIndexes } },
    });
  }

  /**
   * Permission-scoped ANN search: nearest `k` chunks to `queryVector` among the
   * allowed projects, ordered by pgvector cosine distance (`<=>`). The
   * `projectId = ANY(...)` filter is applied in SQL *before* ranking — there is
   * no code path that can return a chunk from a project outside the allowed set.
   */
  async searchVector(
    queryVector: number[],
    allowedProjectIds: string[],
    filters: VectorSearchFilters,
    k: number,
  ): Promise<VectorSearchResult[]> {
    if (allowedProjectIds.length === 0) return [];

    const vectorLiteral = this.toVectorLiteral(queryVector);
    const entityTypeFilter = filters.entityType
      ? Prisma.sql`AND "entityType" = ${filters.entityType}::"EmbeddingEntityType"`
      : Prisma.empty;

    const rows = await this.prismaService.$queryRaw<VectorSearchResult[]>`
      SELECT
        "id",
        "projectId",
        "entityType",
        "entityId",
        "chunkIndex",
        "content",
        1 - ("embedding" <=> ${vectorLiteral}::vector) AS score
      FROM "DocumentEmbedding"
      WHERE "projectId" = ANY(${allowedProjectIds})
        ${entityTypeFilter}
      ORDER BY "embedding" <=> ${vectorLiteral}::vector
      LIMIT ${k};
    `;

    return rows;
  }

  /**
   * Permission-scoped lexical (BM25-style) search: the `k` chunks whose generated
   * `contentTsv` best matches `query` by `ts_rank_cd`, among the allowed projects
   * (§4.4). This is the keyword arm of hybrid retrieval — it shines on the queries
   * pure-vector search is weakest on (exact task keys like "NDF-3", error codes,
   * acronyms, proper nouns). The query is parsed with `websearch_to_tsquery`,
   * which tolerates arbitrary user input (quotes, `or`, `-term`) without throwing,
   * so no query is ever "malformed". Like {@link searchVector}, the
   * `projectId = ANY(...)` filter runs in SQL before ranking — no code path can
   * surface a chunk from a project outside the allowed set.
   *
   * `score` is the raw `ts_rank_cd` (unbounded, corpus-relative), returned for
   * transparency only; hybrid fusion ranks by *position*, not this magnitude, so
   * it is never mixed with the cosine scale.
   */
  async searchLexical(
    query: string,
    allowedProjectIds: string[],
    filters: VectorSearchFilters,
    k: number,
  ): Promise<VectorSearchResult[]> {
    if (allowedProjectIds.length === 0) return [];
    if (query.trim().length === 0) return [];

    const entityTypeFilter = filters.entityType
      ? Prisma.sql`AND "entityType" = ${filters.entityType}::"EmbeddingEntityType"`
      : Prisma.empty;

    const rows = await this.prismaService.$queryRaw<VectorSearchResult[]>`
      SELECT
        "id",
        "projectId",
        "entityType",
        "entityId",
        "chunkIndex",
        "content",
        ts_rank_cd("contentTsv", websearch_to_tsquery('english', ${query})) AS score
      FROM "DocumentEmbedding"
      WHERE "projectId" = ANY(${allowedProjectIds})
        AND "contentTsv" @@ websearch_to_tsquery('english', ${query})
        ${entityTypeFilter}
      ORDER BY score DESC
      LIMIT ${k};
    `;

    return rows;
  }

  /**
   * Permission-scoped k-NN over *completed* tasks: the `k` DONE tasks (with real
   * logged effort) whose embedding is nearest `queryVector`, among `projectIds`.
   *
   * Joins `DocumentEmbedding` (entityType TASK) to `Task` and keeps only
   * `status = 'DONE'` rows with `actualHours > 0` (the column is non-nullable
   * with a `0` default, so `> 0` is the real "has an outcome" test). A task can
   * have several chunks; `DISTINCT ON (t.id)` keeps only its nearest chunk
   * before the outer query ranks tasks by similarity. Like `searchVector`, the
   * `projectId = ANY(...)` filter runs in SQL before ranking.
   */
  async searchCompletedTaskNeighbors(
    queryVector: number[],
    projectIds: string[],
    k: number,
  ): Promise<CompletedTaskNeighbor[]> {
    if (projectIds.length === 0) return [];

    const vectorLiteral = this.toVectorLiteral(queryVector);

    const rows = await this.prismaService.$queryRaw<CompletedTaskNeighbor[]>`
      SELECT "key", "title", "actualHours", "storyPoints", "similarity"
      FROM (
        SELECT DISTINCT ON (t."id")
          t."key"          AS "key",
          t."title"        AS "title",
          t."actualHours"  AS "actualHours",
          t."storyPoints"  AS "storyPoints",
          1 - (de."embedding" <=> ${vectorLiteral}::vector) AS "similarity"
        FROM "DocumentEmbedding" de
        JOIN "Task" t ON t."id" = de."entityId"
        WHERE de."entityType" = 'TASK'::"EmbeddingEntityType"
          AND de."projectId" = ANY(${projectIds})
          AND t."status" = 'DONE'
          AND t."actualHours" > 0
        ORDER BY t."id", de."embedding" <=> ${vectorLiteral}::vector
      ) neighbors
      ORDER BY "similarity" DESC
      LIMIT ${k};
    `;

    return rows;
  }
}
