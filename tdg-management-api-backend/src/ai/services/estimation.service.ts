import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { EmbeddingService } from './embedding.service';
import { AiAccessService } from './ai-access.service';
import {
  CompletedTaskNeighbor,
  EmbeddingRepository,
} from '../repositories/embedding.repository';

/** How wide the retrieval reaches to find comparable completed tasks. */
export type EstimationScope = 'PROJECT' | 'BUSINESS_UNIT' | 'NONE';

/** One evidence row shown to the user behind an estimate. */
export interface EstimationNeighbor {
  key: string;
  title: string;
  actualHours: number;
  storyPoints: number | null;
  /** Cosine similarity as a 0..1 fraction. */
  similarity: number;
}

export interface EstimationResult {
  /** Similarity-weighted median of neighbors' `actualHours`, or null if none. */
  predictedHours: number | null;
  /** Weighted 25th percentile of neighbors' `actualHours` (uncertainty band). */
  rangeLow: number | null;
  /** Weighted 75th percentile of neighbors' `actualHours` (uncertainty band). */
  rangeHigh: number | null;
  /** Weighted mode of neighbors' `storyPoints`, or null if none carry points. */
  suggestedPoints: number | null;
  /** How many completed tasks backed this estimate. */
  sampleSize: number;
  /** Whether the neighbors came from this project or its wider business unit. */
  scope: EstimationScope;
  neighbors: EstimationNeighbor[];
}

/**
 * Feature E — retrieval-based estimation (§4.6).
 *
 * Grounds an effort estimate for a *draft* task in the real outcomes
 * (`actualHours`) of the most similar *completed* tasks, rather than a bare LLM
 * guess. It embeds the draft as a query, retrieves permission-scoped k-NN over
 * DONE tasks, and aggregates their outcomes with similarity weighting:
 *  - predicted hours = weighted median of neighbors' `actualHours`,
 *  - range = weighted IQR (25th–75th percentile) as an honest uncertainty band,
 *  - suggested story points = weighted mode of neighbors' `storyPoints`.
 * The neighbors are returned as evidence so the suggestion is never a naked
 * number.
 */
@Injectable()
export class EstimationService {
  /** Neighbors to retrieve and aggregate over. */
  private readonly k = 8;
  /**
   * Below this many project-local neighbors, widen to the business unit — the
   * seed data is sparse per-project, so a project-only scope often starves
   * (§4.6 / §9).
   */
  private readonly minProjectNeighbors = 3;

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly aiAccessService: AiAccessService,
  ) {}

  /**
   * Estimate effort for a draft task. Enforces permission scope: `projectId`
   * must be within the user's allowed set (§4.3) or the call 403s, and
   * retrieval never reaches outside that set.
   */
  async estimate(params: {
    userId: string;
    roles: UserType[];
    projectId: string;
    title: string;
    description?: string | null;
    /**
     * Story points, if the task has already been pointed. Enables the size-aware
     * hours-per-point prediction; absent → the size-agnostic median of neighbor
     * hours (§4.6, see {@link predictFromNeighbors}).
     */
    storyPoints?: number | null;
  }): Promise<EstimationResult> {
    const { userId, roles, projectId, title, description, storyPoints } =
      params;

    // ── Permission scope (§4.3) ──────────────────────────────────────────────
    const allowedProjectIds = await this.aiAccessService.allowedProjectIds(
      userId,
      roles,
    );
    if (!allowedProjectIds.includes(projectId)) {
      throw new ForbiddenCustomException(
        'You do not have access to this project.',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    // ── Embed the draft as a query ───────────────────────────────────────────
    const draftText = this.buildDraftText(title, description);
    const queryVector = await this.embeddingService.embed(
      draftText,
      'RETRIEVAL_QUERY',
    );

    // ── Retrieve neighbors: prefer this project, fall back to business unit ──
    let scope: EstimationScope = 'PROJECT';
    let neighbors = await this.embeddingRepository.searchCompletedTaskNeighbors(
      queryVector,
      [projectId],
      this.k,
    );

    if (neighbors.length < this.minProjectNeighbors) {
      const businessUnitProjectIds =
        await this.aiAccessService.sameBusinessUnitProjectIds(
          projectId,
          allowedProjectIds,
        );
      const wider = await this.embeddingRepository.searchCompletedTaskNeighbors(
        queryVector,
        businessUnitProjectIds,
        this.k,
      );
      // Only adopt the wider scope if it actually yields more evidence.
      if (wider.length > neighbors.length) {
        neighbors = wider;
        scope = 'BUSINESS_UNIT';
      }
    }

    if (neighbors.length === 0) {
      return {
        predictedHours: null,
        rangeLow: null,
        rangeHigh: null,
        suggestedPoints: null,
        sampleSize: 0,
        scope: 'NONE',
        neighbors: [],
      };
    }

    return this.predictFromNeighbors(neighbors, scope, storyPoints);
  }

  /** `[title]\n[description]` — the same shape the draft would be indexed as. */
  private buildDraftText(title: string, description?: string | null): string {
    return description && description.trim().length > 0
      ? `${title}\n${description}`
      : title;
  }

  // ─── Similarity-weighted aggregation ───────────────────────────────────────

  /**
   * Aggregate the retrieved neighbors into an estimate. `neighbors` must be
   * non-empty (callers short-circuit the empty case).
   *
   * When `draftPoints` is given AND the neighbors carry story points, effort is
   * predicted from the neighbors' **local hours-per-point rate** scaled by the
   * draft's points — reference-class forecasting. This is materially more
   * accurate than a bare median of neighbor hours, because text-similar
   * neighbors are often *size*-mismatched: on the eval it cuts leave-one-out MAE
   * from ~3.8h (size-agnostic) to ~2.1h, matching the story-point baseline while
   * still returning neighbor evidence and a calibrated band.
   *
   * Without points (or when no neighbor is pointed) it falls back to the
   * size-agnostic similarity-weighted median of `actualHours`.
   */
  predictFromNeighbors(
    neighbors: CompletedTaskNeighbor[],
    scope: EstimationScope,
    draftPoints?: number | null,
  ): EstimationResult {
    // Clamp weights to be non-negative; a run of exact-zero similarities falls
    // back to uniform weighting so the estimate is still defined.
    const weighted = neighbors.map((neighbor) => ({
      neighbor,
      weight: Math.max(neighbor.similarity, 0),
    }));
    const totalWeight = weighted.reduce((sum, row) => sum + row.weight, 0);
    const usableWeights =
      totalWeight > 0
        ? weighted
        : weighted.map((row) => ({ ...row, weight: 1 }));

    // Hours-per-point samples over the neighbors that are actually pointed.
    const rateSamples = usableWeights
      .filter(
        (row) =>
          row.neighbor.storyPoints != null && row.neighbor.storyPoints > 0,
      )
      .map((row) => ({
        value: row.neighbor.actualHours / (row.neighbor.storyPoints as number),
        weight: row.weight,
      }));

    let predictedHours: number;
    let rangeLow: number;
    let rangeHigh: number;
    let suggestedPoints: number | null;

    if (draftPoints != null && draftPoints > 0 && rateSamples.length > 0) {
      // ── Size-aware: local hours-per-point rate × the draft's own points ──
      // Normalizing hours by points strips out the size variance, so a 25–75
      // IQR band comes out too tight — on the eval it under-covered the truth
      // (~0.40 vs the 0.50 an IQR nominally targets). A wider 10–90 band
      // (nominal ~0.80 coverage) restores an honest band (~0.74 on the eval);
      // the size-agnostic path below keeps its 25–75 IQR.
      predictedHours = this.round1(
        draftPoints * this.weightedPercentile(rateSamples, 0.5),
      );
      rangeLow = this.round1(
        draftPoints * this.weightedPercentile(rateSamples, 0.1),
      );
      rangeHigh = this.round1(
        draftPoints * this.weightedPercentile(rateSamples, 0.9),
      );
      suggestedPoints = draftPoints;
    } else {
      // ── Size-agnostic fallback: weighted median of neighbor actualHours ──
      const hoursSamples = usableWeights.map((row) => ({
        value: row.neighbor.actualHours,
        weight: row.weight,
      }));
      predictedHours = this.round1(this.weightedPercentile(hoursSamples, 0.5));
      rangeLow = this.round1(this.weightedPercentile(hoursSamples, 0.25));
      rangeHigh = this.round1(this.weightedPercentile(hoursSamples, 0.75));
      suggestedPoints = this.weightedMode(
        usableWeights
          .filter((row) => row.neighbor.storyPoints != null)
          .map((row) => ({
            value: row.neighbor.storyPoints as number,
            weight: row.weight,
          })),
      );
    }

    return {
      predictedHours,
      rangeLow,
      rangeHigh,
      suggestedPoints,
      sampleSize: neighbors.length,
      scope,
      neighbors: neighbors.map((neighbor) => ({
        key: neighbor.key,
        title: neighbor.title,
        actualHours: neighbor.actualHours,
        storyPoints: neighbor.storyPoints,
        similarity: neighbor.similarity,
      })),
    };
  }

  /**
   * Weighted percentile via the "cumulative weight crosses `p`" rule, with
   * linear interpolation between the two straddling samples. `p` in [0, 1].
   */
  private weightedPercentile(
    samples: { value: number; weight: number }[],
    p: number,
  ): number {
    const sorted = [...samples].sort((a, b) => a.value - b.value);
    const totalWeight = sorted.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return sorted[0]?.value ?? 0;

    const target = p * totalWeight;
    let cumulative = 0;
    for (let i = 0; i < sorted.length; i += 1) {
      const prevCumulative = cumulative;
      cumulative += sorted[i].weight;
      if (cumulative >= target) {
        // Interpolate between this sample and the previous one, positioned by
        // how far into this sample's weight the target falls.
        if (i === 0) return sorted[0].value;
        const spanStart = prevCumulative;
        const fraction = (target - spanStart) / sorted[i].weight;
        const clamped = Math.min(Math.max(fraction, 0), 1);
        return (
          sorted[i - 1].value +
          clamped * (sorted[i].value - sorted[i - 1].value)
        );
      }
    }
    return sorted[sorted.length - 1].value;
  }

  /** Weighted mode: the value with the greatest summed weight, or null. */
  private weightedMode(
    samples: { value: number; weight: number }[],
  ): number | null {
    if (samples.length === 0) return null;
    const weightByValue = new Map<number, number>();
    for (const sample of samples) {
      weightByValue.set(
        sample.value,
        (weightByValue.get(sample.value) ?? 0) + sample.weight,
      );
    }
    let bestValue: number | null = null;
    let bestWeight = -Infinity;
    for (const [value, weight] of weightByValue) {
      if (weight > bestWeight) {
        bestWeight = weight;
        bestValue = value;
      }
    }
    return bestValue;
  }

  private round1(value: number): number {
    return Math.round(value * 10) / 10;
  }
}
