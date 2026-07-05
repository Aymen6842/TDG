/**
 * Pure metric functions shared by the eval scripts (§6). No I/O, no DB — just
 * the maths, so they're trivially correct and unit-testable.
 *
 * Retrieval (binary relevance over a ranked list of canonical refs):
 *   Recall@k, Precision@k, MRR, nDCG@k.
 * Regression (estimation): MAE, RMSE, % within a tolerance, and a couple of
 *   baselines (mean, ordinary-least-squares linear fit).
 */

// ─── Retrieval metrics ────────────────────────────────────────────────────────

/** Fraction of the relevant set that appears in the top-k of `ranked`. */
export function recallAtK(
  ranked: string[],
  relevant: Set<string>,
  k: number,
): number {
  if (relevant.size === 0) return 0;
  const topK = ranked.slice(0, k);
  let hits = 0;
  for (const ref of topK) if (relevant.has(ref)) hits += 1;
  return hits / relevant.size;
}

/** Fraction of the top-k that is relevant (denominator is always `k`). */
export function precisionAtK(
  ranked: string[],
  relevant: Set<string>,
  k: number,
): number {
  if (k === 0) return 0;
  const topK = ranked.slice(0, k);
  let hits = 0;
  for (const ref of topK) if (relevant.has(ref)) hits += 1;
  return hits / k;
}

/** Reciprocal rank of the first relevant hit (0 if none in the list). */
export function reciprocalRank(
  ranked: string[],
  relevant: Set<string>,
): number {
  for (let i = 0; i < ranked.length; i += 1) {
    if (relevant.has(ranked[i])) return 1 / (i + 1);
  }
  return 0;
}

/**
 * Normalized DCG at k with binary gains. DCG sums `1/log2(rank+1)` over relevant
 * hits in the top-k; IDCG is the same for the ideal ranking (all relevant first).
 */
export function ndcgAtK(
  ranked: string[],
  relevant: Set<string>,
  k: number,
): number {
  let dcg = 0;
  const topK = ranked.slice(0, k);
  for (let i = 0; i < topK.length; i += 1) {
    if (relevant.has(topK[i])) dcg += 1 / Math.log2(i + 2);
  }
  const idealHits = Math.min(relevant.size, k);
  let idcg = 0;
  for (let i = 0; i < idealHits; i += 1) idcg += 1 / Math.log2(i + 2);
  return idcg === 0 ? 0 : dcg / idcg;
}

/** Arithmetic mean, or 0 for an empty list. */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// ─── Regression metrics ───────────────────────────────────────────────────────

export interface RegressionScores {
  mae: number;
  rmse: number;
  /** Share of predictions within `tol` relative error of the truth. */
  withinTolerance: number;
  /** Number of (prediction, truth) pairs scored. */
  n: number;
}

/**
 * MAE / RMSE / within-tolerance for a set of (predicted, actual) pairs.
 * Pairs whose prediction is null (predictor abstained) are dropped from all
 * three and only counted via `n`.
 */
export function regressionScores(
  pairs: { predicted: number | null; actual: number }[],
  tol = 0.25,
): RegressionScores {
  const scored = pairs.filter(
    (p): p is { predicted: number; actual: number } => p.predicted !== null,
  );
  if (scored.length === 0) return { mae: 0, rmse: 0, withinTolerance: 0, n: 0 };

  let absSum = 0;
  let sqSum = 0;
  let within = 0;
  for (const { predicted, actual } of scored) {
    const err = predicted - actual;
    absSum += Math.abs(err);
    sqSum += err * err;
    // Relative error against the truth; guard against a zero denominator.
    const denom = actual === 0 ? 1 : Math.abs(actual);
    if (Math.abs(err) / denom <= tol) within += 1;
  }
  return {
    mae: absSum / scored.length,
    rmse: Math.sqrt(sqSum / scored.length),
    withinTolerance: within / scored.length,
    n: scored.length,
  };
}

/** Ordinary least-squares fit `y = slope*x + intercept`. */
export function linearFit(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
} {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const meanX = mean(points.map((p) => p.x));
  const meanY = mean(points.map((p) => p.y));
  let num = 0;
  let den = 0;
  for (const { x, y } of points) {
    num += (x - meanX) * (y - meanY);
    den += (x - meanX) * (x - meanX);
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: meanY - slope * meanX };
}

// ─── Weighted aggregation (mirrors EstimationService — kept local so the eval
//     stays self-contained and never mutates product code) ─────────────────────

export interface WeightedSample {
  value: number;
  weight: number;
}

/**
 * Weighted percentile via the "cumulative weight crosses `p`" rule with linear
 * interpolation between the two straddling samples. Mirrors
 * `EstimationService.weightedPercentile` so the eval measures the same predictor.
 */
export function weightedPercentile(
  samples: WeightedSample[],
  p: number,
): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((sum, s) => sum + s.weight, 0);
  if (total === 0) return sorted[0].value;

  const target = p * total;
  let cumulative = 0;
  for (let i = 0; i < sorted.length; i += 1) {
    const prev = cumulative;
    cumulative += sorted[i].weight;
    if (cumulative >= target) {
      if (i === 0) return sorted[0].value;
      const fraction = (target - prev) / sorted[i].weight;
      const clamped = Math.min(Math.max(fraction, 0), 1);
      return (
        sorted[i - 1].value + clamped * (sorted[i].value - sorted[i - 1].value)
      );
    }
  }
  return sorted[sorted.length - 1].value;
}

export function round(value: number, dp = 3): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}
