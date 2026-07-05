import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { EmbeddingService } from './embedding.service';
import { AiAccessService } from './ai-access.service';
import { RerankerService } from './reranker.service';
import {
  EmbeddingRepository,
  VectorSearchResult,
  VectorSearchFilters,
} from '../repositories/embedding.repository';

/** A permission-scoped retrieval hit, ready to be numbered into a prompt. */
export type RetrievalCandidate = VectorSearchResult;

/** How a retrieval request should combine the lexical and vector arms (§4.4). */
export interface RetrievalOptions {
  /**
   * Fuse a lexical (BM25-style FTS) ranking with the vector ANN ranking via RRF.
   * `false` reproduces the original vector-only path exactly (kept for ablation).
   * Defaults to {@link RetrievalService.HYBRID_DEFAULT}.
   */
  hybrid?: boolean;
  /**
   * Run the LLM reranker over the fused top-N and keep its top-k. Defaults to
   * {@link RetrievalService.RERANK_DEFAULT}.
   */
  rerank?: boolean;
}

export interface RetrievalResult {
  /** Top-k candidates ordered by descending relevance (fused / reranked). */
  candidates: RetrievalCandidate[];
  /**
   * Highest cosine similarity seen in the vector arm, or null when none were
   * found. This stays on the cosine scale regardless of hybrid/rerank so the
   * confidence gate (§4.5) keeps the same meaning it had for vector-only.
   */
  topScore: number | null;
  /**
   * Whether the best hit clears the confidence threshold. When false the caller
   * should refuse rather than let the model answer from weak context (§4.5).
   */
  sufficient: boolean;
  /** The projectIds the search was actually scoped to (for telemetry/debug). */
  scopedProjectIds: string[];
}

/**
 * Permission-scoped retrieval for the RAG copilot (§4.4).
 *
 * Resolves the user's allowed projects (§4.3), embeds the question as a
 * `RETRIEVAL_QUERY`, and runs the search filtered to that scope *in SQL* — there
 * is no code path that can surface a chunk from a project the user cannot access.
 * If a `projectId` is supplied it must be within the allowed set (else 403), and
 * the search is narrowed to it. A low top score is reported as `sufficient: false`
 * so the copilot can refuse instead of hallucinating.
 *
 * Two ranking modes share the same permission scope:
 *  - **vector-only** — pgvector cosine ANN (the original path; still the ablation
 *    baseline).
 *  - **hybrid** — the vector ANN fused with a Postgres full-text (BM25-style)
 *    ranking via Reciprocal Rank Fusion, optionally followed by an LLM reranker.
 *    Hybrid is the default because it strictly dominates vector-only on
 *    keyword-heavy queries (task keys, error codes, proper nouns) at no extra LLM
 *    cost; the reranker is an extra flag-gated pass.
 */
@Injectable()
export class RetrievalService {
  /** Candidates pulled for the prompt (before the model narrows via citations). */
  static readonly DEFAULT_K = 8;
  /**
   * Minimum cosine similarity of the best hit for retrieval to be considered
   * usable. Normalized `gemini-embedding-001` query/document vectors put a
   * genuinely on-topic match comfortably above this; unrelated questions fall
   * below it and trigger the refusal path.
   */
  static readonly MIN_CONFIDENCE = 0.5;
  /**
   * How many candidates each arm contributes to the fusion pool. Larger than the
   * final `k` so a hit ranked highly by only one arm can still be recovered by
   * RRF. The tiny corpus makes a deeper pool essentially free.
   */
  static readonly FUSION_DEPTH = 20;
  /**
   * RRF damping constant (the canonical `k=60` from Cormack et al.). It flattens
   * the contribution of rank position so no single arm dominates and deep hits
   * still matter; the fused score of a doc is `Σ 1 / (RRF_K + rank)` over the
   * arms it appears in (rank is 1-based).
   */
  static readonly RRF_K = 60;

  /** Default ranking mode: hybrid on, reranker off (see class doc). Env-overridable. */
  static readonly HYBRID_DEFAULT = readBoolEnv('AI_RETRIEVAL_HYBRID', true);
  static readonly RERANK_DEFAULT = readBoolEnv('AI_RETRIEVAL_RERANK', false);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly aiAccessService: AiAccessService,
    private readonly rerankerService: RerankerService,
  ) {}

  /**
   * Retrieve the top-k permission-scoped chunks for `question`. Throws
   * `ForbiddenCustomException` if `projectId` is outside the caller's scope.
   */
  async retrieve(params: {
    userId: string;
    roles: UserType[];
    question: string;
    projectId?: string | null;
    k?: number;
    options?: RetrievalOptions;
  }): Promise<RetrievalResult> {
    const { userId, roles, question, projectId } = params;
    const k = params.k ?? RetrievalService.DEFAULT_K;

    // ── Permission scope (§4.3) ──────────────────────────────────────────────
    const allowedProjectIds = await this.aiAccessService.allowedProjectIds(
      userId,
      roles,
    );

    let scopedProjectIds = allowedProjectIds;
    if (projectId) {
      if (!allowedProjectIds.includes(projectId)) {
        throw new ForbiddenCustomException(
          'You do not have access to this project.',
          ErrorCode.INSUFFICIENT_PERMISSION,
        );
      }
      // Narrow to the single requested project when one is given and allowed.
      scopedProjectIds = [projectId];
    }

    if (scopedProjectIds.length === 0) {
      return {
        candidates: [],
        topScore: null,
        sufficient: false,
        scopedProjectIds,
      };
    }

    const { candidates, topScore } = await this.searchScoped({
      question,
      scopedProjectIds,
      k,
      options: params.options,
    });

    const sufficient =
      topScore !== null && topScore >= RetrievalService.MIN_CONFIDENCE;

    return { candidates, topScore, sufficient, scopedProjectIds };
  }

  /**
   * Core scored search over an already-resolved project scope. Split out from
   * {@link retrieve} so the eval harness can drive the exact production ranking
   * (vector / hybrid / hybrid+rerank) against a precomputed `scopedProjectIds`
   * without re-running permission resolution. Returns the ranked candidates plus
   * the best *cosine* similarity (for the confidence gate), independent of which
   * arm ultimately ordered them.
   */
  async searchScoped(params: {
    question: string;
    scopedProjectIds: string[];
    k: number;
    filters?: VectorSearchFilters;
    options?: RetrievalOptions;
  }): Promise<{ candidates: RetrievalCandidate[]; topScore: number | null }> {
    const { question, scopedProjectIds, k } = params;
    const filters = params.filters ?? {};
    const hybrid = params.options?.hybrid ?? RetrievalService.HYBRID_DEFAULT;
    const rerank = params.options?.rerank ?? RetrievalService.RERANK_DEFAULT;

    if (scopedProjectIds.length === 0) {
      return { candidates: [], topScore: null };
    }

    const queryVector = await this.embeddingService.embed(
      question,
      'RETRIEVAL_QUERY',
    );

    // Vector arm always runs: it provides both the semantic ranking and the
    // cosine top-score the confidence gate depends on.
    const vectorDepth = hybrid ? RetrievalService.FUSION_DEPTH : k;
    const vectorHits = await this.embeddingRepository.searchVector(
      queryVector,
      scopedProjectIds,
      filters,
      vectorDepth,
    );
    const topScore = vectorHits.length > 0 ? vectorHits[0].score : null;

    let ranked: RetrievalCandidate[];
    if (!hybrid) {
      ranked = vectorHits.slice(0, k);
    } else {
      const lexicalHits = await this.embeddingRepository.searchLexical(
        question,
        scopedProjectIds,
        filters,
        RetrievalService.FUSION_DEPTH,
      );
      ranked = this.fuseRrf([vectorHits, lexicalHits]);
    }

    if (rerank && ranked.length > 1) {
      // Rerank the fused pool (top-N), then keep the best k. For vector-only the
      // pool is already k-deep, so the reranker just re-orders those k.
      const pool = hybrid ? ranked : vectorHits.slice(0, vectorDepth);
      ranked = await this.rerankerService.rerank(question, pool, k);
    } else {
      ranked = ranked.slice(0, k);
    }

    return { candidates: ranked, topScore };
  }

  /**
   * Reciprocal Rank Fusion of several ranked lists into one. Each document's
   * fused score is `Σ 1 / (RRF_K + rank)` over the lists it appears in (rank is
   * 1-based within each list); documents are keyed by their `DocumentEmbedding`
   * row id, so the same chunk retrieved by both arms accumulates both
   * contributions. Position-based by design — it never mixes the incomparable
   * cosine and `ts_rank` magnitudes.
   */
  private fuseRrf(lists: RetrievalCandidate[][]): RetrievalCandidate[] {
    const scoreById = new Map<string, number>();
    const rowById = new Map<string, RetrievalCandidate>();

    for (const list of lists) {
      list.forEach((row, index) => {
        const contribution = 1 / (RetrievalService.RRF_K + index + 1);
        scoreById.set(row.id, (scoreById.get(row.id) ?? 0) + contribution);
        if (!rowById.has(row.id)) rowById.set(row.id, row);
      });
    }

    return Array.from(scoreById.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => rowById.get(id)!);
  }
}

/**
 * Read a boolean feature flag from the environment, falling back to `fallback`
 * when it is unset. Accepts `1/true/yes/on` (case-insensitive) as true and
 * `0/false/no/off` as false; any other value uses the fallback.
 */
function readBoolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}
