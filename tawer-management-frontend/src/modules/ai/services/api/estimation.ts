import { POST } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

/** Scope the estimate's neighbors were drawn from. */
export type EstimationScope = "PROJECT" | "BUSINESS_UNIT" | "NONE";

/** One completed task shown as evidence behind an estimate. */
export interface EstimationNeighbor {
  key: string;
  title: string;
  actualHours: number;
  storyPoints: number | null;
  /** Cosine similarity as a 0..1 fraction. */
  similarity: number;
}

export interface EstimateResult {
  predictedHours: number | null;
  rangeLow: number | null;
  rangeHigh: number | null;
  suggestedPoints: number | null;
  sampleSize: number;
  scope: EstimationScope;
  neighbors: EstimationNeighbor[];
}

export interface EstimateTaskInput {
  projectId: string;
  title: string;
  description?: string | null;
}

/**
 * POST /ai/estimate — retrieval-based effort estimate for a draft task, grounded
 * in the real `actualHours` of similar completed tasks. Mirrors the project-task
 * services: JWT from local storage + one refresh-token retry on 401.
 */
export async function estimateTask(
  input: EstimateTaskInput,
): Promise<EstimateResult> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/ai/estimate`, headers, input);
    return (res.data?.data ?? res.data) as EstimateResult;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      return await refreshToken(() => estimateTask(input));
    }
    throw error;
  }
}
