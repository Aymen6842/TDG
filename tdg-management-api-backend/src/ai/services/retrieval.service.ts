import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { EmbeddingService } from './embedding.service';
import { AiAccessService } from './ai-access.service';
import {
  EmbeddingRepository,
  VectorSearchResult,
} from '../repositories/embedding.repository';

/** A permission-scoped retrieval hit, ready to be numbered into a prompt. */
export type RetrievalCandidate = VectorSearchResult;

export interface RetrievalResult {
  /** Top-k candidates ordered by descending cosine similarity. */
  candidates: RetrievalCandidate[];
  /** Highest similarity among the candidates, or null when none were found. */
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
 * `RETRIEVAL_QUERY`, and runs the vector ANN search filtered to that scope *in
 * SQL* — there is no code path that can surface a chunk from a project the user
 * cannot access. If a `projectId` is supplied it must be within the allowed set
 * (else 403), and the search is narrowed to it. A low top score is reported as
 * `sufficient: false` so the copilot can refuse instead of hallucinating.
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

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly aiAccessService: AiAccessService,
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

    // ── Embed the question as a query and run scoped ANN ─────────────────────
    const queryVector = await this.embeddingService.embed(
      question,
      'RETRIEVAL_QUERY',
    );

    const candidates = await this.embeddingRepository.searchVector(
      queryVector,
      scopedProjectIds,
      {},
      k,
    );

    const topScore = candidates.length > 0 ? candidates[0].score : null;
    const sufficient =
      topScore !== null && topScore >= RetrievalService.MIN_CONFIDENCE;

    return { candidates, topScore, sufficient, scopedProjectIds };
  }
}
