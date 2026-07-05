import { Inject, Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { createHash } from 'crypto';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';

/**
 * Gemini task types. Documents (indexed content) and queries are embedded with
 * different task types — using the right one is a measurable retrieval-quality
 * lever (see §4.1 of the implementation plan).
 */
export type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

/**
 * Embedding strategy for the AI copilot (§4.1).
 *
 * - Model `gemini-embedding-001`, Matryoshka-truncated to 1536 dims to halve
 *   storage / speed up ANN with negligible quality loss.
 * - Reduced dimensions are NOT pre-normalized by the API, so we L2-normalize
 *   ourselves — required for cosine ANN to behave.
 * - Batching + exponential-backoff retry on 429/5xx.
 * - sha256 content hashing so unchanged content can skip the API call.
 */
@Injectable()
export class EmbeddingService {
  static readonly MODEL = 'gemini-embedding-001';
  static readonly DIMENSIONS = 1536;

  /** Max chunks sent in a single `embedContent` call. */
  private readonly batchSize = 100;
  /** Retry budget for transient (429 / 5xx) failures. */
  private readonly maxRetries = 5;

  constructor(
    @Inject('GEMINI_CLIENT') private readonly googleGenAI: GoogleGenAI,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  /** sha256 hex digest of the exact embedded text — used to skip no-op re-embeds. */
  contentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /** Embed a single string, returning an L2-normalized 1536-dim vector. */
  async embed(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
    const [vector] = await this.embedBatch([text], taskType);
    return vector;
  }

  /**
   * Embed many strings, returning L2-normalized 1536-dim vectors in the same
   * order. Inputs are split into batches of `batchSize`; each batch is retried
   * with exponential backoff on transient errors.
   */
  async embedBatch(
    texts: string[],
    taskType: EmbeddingTaskType,
  ): Promise<number[][]> {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const vectors = await this.embedBatchWithRetry(batch, taskType);
      out.push(...vectors);
    }
    return out;
  }

  private async embedBatchWithRetry(
    batch: string[],
    taskType: EmbeddingTaskType,
  ): Promise<number[][]> {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const response = await this.googleGenAI.models.embedContent({
          model: EmbeddingService.MODEL,
          contents: batch,
          config: {
            taskType,
            outputDimensionality: EmbeddingService.DIMENSIONS,
          },
        });

        const embeddings = response.embeddings ?? [];
        if (embeddings.length !== batch.length) {
          throw new Error(
            `Expected ${batch.length} embeddings, received ${embeddings.length}`,
          );
        }

        return embeddings.map((embedding) => {
          const values = embedding.values ?? [];
          if (values.length !== EmbeddingService.DIMENSIONS) {
            throw new Error(
              `Expected ${EmbeddingService.DIMENSIONS}-dim embedding, received ${values.length}`,
            );
          }
          return this.l2normalize(values);
        });
      } catch (error: unknown) {
        attempt += 1;
        const retryable = this.isRetryable(error) && attempt <= this.maxRetries;

        this.backgroundActivitiesLoggerService.log(
          `Embedding batch failed (attempt ${attempt}${retryable ? ', will retry' : ', giving up'}): ${
            error instanceof Error ? error.message : String(error)
          }`,
          { service: 'Embedding Service', method: 'embedBatchWithRetry' },
        );

        if (!retryable) throw error;

        // Exponential backoff with jitter: ~0.5s, 1s, 2s, 4s, 8s (+ jitter).
        const backoffMs = 500 * 2 ** (attempt - 1) + Math.random() * 250;
        await this.sleep(backoffMs);
      }
    }
  }

  /** L2-normalize a vector in place-safe manner (returns a new array). */
  private l2normalize(vector: number[]): number[] {
    let sumOfSquares = 0;
    for (const value of vector) sumOfSquares += value * value;
    const norm = Math.sqrt(sumOfSquares);
    if (norm === 0) return vector;
    return vector.map((value) => value / norm);
  }

  /** Retry only on rate-limit (429) and server (5xx) errors. */
  private isRetryable(error: unknown): boolean {
    const status = this.extractStatus(error);
    if (status === 429) return true;
    if (status !== undefined && status >= 500 && status <= 599) return true;

    const message = (
      error instanceof Error ? error.message : String(error)
    ).toLowerCase();
    return (
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('resource_exhausted') ||
      message.includes('unavailable') ||
      message.includes('internal error') ||
      message.includes('deadline')
    );
  }

  private extractStatus(error: unknown): number | undefined {
    if (typeof error === 'object' && error !== null) {
      const candidate = error as { status?: unknown; code?: unknown };
      if (typeof candidate.status === 'number') return candidate.status;
      if (typeof candidate.code === 'number') return candidate.code;
    }
    return undefined;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
