/**
 * Pluggable retrievers for the retrieval ablation study (§6, §4.4).
 *
 * Every config produces a ranked list of (entityType, entityId, score) for a
 * question; the eval turns those into canonical refs and scores them. Two
 * backends:
 *
 *  - `pgvector` — the REAL production path: embed the query via `EmbeddingService`
 *    and run the permission-scoped ANN in `EmbeddingRepository.searchVector`.
 *    This measures what ships. Its only knob is the *query* task type (documents
 *    are already stored at 1536-dim / RETRIEVAL_DOCUMENT), which gives the
 *    "correct vs wrong query task-type" ablation for free.
 *
 *  - `memory` — a self-contained brute-force retriever that RE-embeds the whole
 *    (tiny) corpus at a chosen dimensionality and document task-type, then does
 *    cosine top-k in JS. This is what makes the "1536 vs 3072 dims" ablation
 *    genuinely runnable without a second production index. It talks to the Gemini
 *    client directly so product code (`EmbeddingService`, fixed at 1536) is never
 *    touched.
 *
 * Hybrid (BM25+RRF) and reranking are deliberately OUT of scope this sprint (M5);
 * the config names are reserved so they can be dropped in and measured next.
 */
import { GoogleGenAI } from '@google/genai';
import { EmbeddingEntityType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import {
  EmbeddingService,
  EmbeddingTaskType,
} from '../../services/embedding.service';
import { EmbeddingRepository } from '../../repositories/embedding.repository';

export interface RetrievalHit {
  entityType: EmbeddingEntityType;
  entityId: string;
  score: number;
}

export interface Retriever {
  readonly name: string;
  readonly description: string;
  retrieve(question: string, k: number): Promise<RetrievalHit[]>;
}

export interface RetrievalConfig {
  name: string;
  backend: 'pgvector' | 'memory';
  queryTaskType: EmbeddingTaskType;
  /** Document task type — only meaningful for the `memory` backend. */
  docTaskType?: EmbeddingTaskType;
  dims: 1536 | 3072;
  note: string;
}

/** The ablation grid this sprint can actually run (plus reserved future rows). */
export const RETRIEVAL_CONFIGS: Record<string, RetrievalConfig> = {
  baseline: {
    name: 'baseline',
    backend: 'pgvector',
    queryTaskType: 'RETRIEVAL_QUERY',
    dims: 1536,
    note: 'Production path: pgvector ANN, correct RETRIEVAL_QUERY task type, 1536 dims.',
  },
  'wrong-task-type': {
    name: 'wrong-task-type',
    backend: 'pgvector',
    queryTaskType: 'RETRIEVAL_DOCUMENT',
    dims: 1536,
    note: 'Ablation: query embedded with the WRONG task type (RETRIEVAL_DOCUMENT).',
  },
  'dims-1536': {
    name: 'dims-1536',
    backend: 'memory',
    queryTaskType: 'RETRIEVAL_QUERY',
    docTaskType: 'RETRIEVAL_DOCUMENT',
    dims: 1536,
    note: 'In-memory re-embed at 1536 dims (reproduces baseline; validates the backend).',
  },
  'dims-3072': {
    name: 'dims-3072',
    backend: 'memory',
    queryTaskType: 'RETRIEVAL_QUERY',
    docTaskType: 'RETRIEVAL_DOCUMENT',
    dims: 3072,
    note: 'Ablation: full 3072-dim embeddings (max quality, 2x storage).',
  },
};

/** Config names reserved for the M5 stretch — recognized but not implemented. */
export const RESERVED_CONFIGS = ['hybrid', 'rerank'];

// ─── pgvector (production) retriever ───────────────────────────────────────────

export class PgVectorRetriever implements Retriever {
  readonly name: string;
  readonly description: string;

  constructor(
    private readonly config: RetrievalConfig,
    private readonly embeddingService: EmbeddingService,
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly allowedProjectIds: string[],
  ) {
    this.name = config.name;
    this.description = config.note;
  }

  async retrieve(question: string, k: number): Promise<RetrievalHit[]> {
    const vector = await this.embeddingService.embed(
      question,
      this.config.queryTaskType,
    );
    const rows = await this.embeddingRepository.searchVector(
      vector,
      this.allowedProjectIds,
      {},
      k,
    );
    return rows.map((row) => ({
      entityType: row.entityType,
      entityId: row.entityId,
      score: row.score,
    }));
  }
}

// ─── in-memory (ablation) retriever ────────────────────────────────────────────

interface CorpusRow {
  entityType: EmbeddingEntityType;
  entityId: string;
  vector: number[];
}

export class InMemoryRetriever implements Retriever {
  readonly name: string;
  readonly description: string;
  private corpus: CorpusRow[] | null = null;

  constructor(
    private readonly config: RetrievalConfig,
    private readonly client: GoogleGenAI,
    private readonly prisma: PrismaService,
    private readonly allowedProjectIds: string[],
  ) {
    this.name = config.name;
    this.description = config.note;
  }

  /** Embed and cache the whole corpus at this config's dims / document task type. */
  private async ensureCorpus(): Promise<CorpusRow[]> {
    if (this.corpus) return this.corpus;

    const rows = await this.prisma.documentEmbedding.findMany({
      where: { projectId: { in: this.allowedProjectIds } },
      select: { entityType: true, entityId: true, content: true },
    });

    const vectors = await this.embed(
      rows.map((r) => r.content),
      this.config.docTaskType ?? 'RETRIEVAL_DOCUMENT',
    );
    this.corpus = rows.map((row, i) => ({
      entityType: row.entityType,
      entityId: row.entityId,
      vector: vectors[i],
    }));
    return this.corpus;
  }

  async retrieve(question: string, k: number): Promise<RetrievalHit[]> {
    const corpus = await this.ensureCorpus();
    const [queryVec] = await this.embed([question], this.config.queryTaskType);

    // Vectors are L2-normalized, so cosine similarity is just the dot product.
    return corpus
      .map((row) => ({
        entityType: row.entityType,
        entityId: row.entityId,
        score: dot(queryVec, row.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  /** Direct Gemini embed at an arbitrary dimensionality, L2-normalized. */
  private async embed(
    texts: string[],
    taskType: EmbeddingTaskType,
  ): Promise<number[][]> {
    const out: number[][] = [];
    const batchSize = 100;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await this.embedBatchWithRetry(batch, taskType);
      const embeddings = response.embeddings ?? [];
      for (const embedding of embeddings) {
        out.push(l2normalize(embedding.values ?? []));
      }
    }
    return out;
  }

  /**
   * The ablation re-embeds the whole corpus, which easily trips the Gemini
   * free-tier per-minute quota; retry on 429/RESOURCE_EXHAUSTED with a long
   * backoff so a `dims-*` run just slows down instead of failing.
   */
  private async embedBatchWithRetry(
    batch: string[],
    taskType: EmbeddingTaskType,
    maxRetries = 6,
  ): Promise<Awaited<ReturnType<GoogleGenAI['models']['embedContent']>>> {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await this.client.models.embedContent({
          model: EmbeddingService.MODEL,
          contents: batch,
          config: { taskType, outputDimensionality: this.config.dims },
        });
      } catch (error: unknown) {
        attempt += 1;
        const message = error instanceof Error ? error.message : String(error);
        const rateLimited =
          message.includes('429') || message.includes('RESOURCE_EXHAUSTED');
        if (!rateLimited || attempt > maxRetries) throw error;
        const waitMs = extractRetryDelayMs(message) ?? 32_000;
        console.log(
          `    (rate-limited; waiting ${Math.round(waitMs / 1000)}s before retry ${attempt}/${maxRetries})`,
        );
        await sleep(waitMs);
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pull the `retryDelay: "28s"` hint out of a Gemini 429 error message, in ms. */
function extractRetryDelayMs(message: string): number | null {
  const match = message.match(/"retryDelay"\s*:\s*"(\d+)s"/);
  if (!match) return null;
  // Add a small margin so we clear the window rather than racing its edge.
  return (Number(match[1]) + 2) * 1000;
}

function dot(a: number[], b: number[]): number {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) sum += a[i] * b[i];
  return sum;
}

function l2normalize(vector: number[]): number[] {
  let sumSq = 0;
  for (const v of vector) sumSq += v * v;
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}
