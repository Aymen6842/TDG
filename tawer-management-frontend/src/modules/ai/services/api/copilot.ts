import { POST } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

/** The entity types the copilot can cite. */
export type CitationEntityType =
  | "TASK"
  | "TASK_COMMENT"
  | "EPIC"
  | "MILESTONE"
  | "SPRINT";

/** One clickable citation behind an answer, deep-linking to its source. */
export interface CopilotCitation {
  /** The `[n]` marker as it appears in the answer text. */
  marker: number;
  entityType: CitationEntityType;
  entityId: string;
  projectId: string;
  /** Task to open when deep-linking (TASK / TASK_COMMENT), else null. */
  taskId: string | null;
  /** Human task key for TASK / TASK_COMMENT citations, else null. */
  taskKey: string | null;
  /** Display label for the chip. */
  label: string;
  /** Short excerpt of the cited chunk (tooltip / preview). */
  snippet: string;
}

export interface CopilotAnswer {
  answer: string;
  citations: CopilotCitation[];
  /** True when retrieval was too weak / the model refused. */
  insufficientContext: boolean;
}

export interface CopilotQueryInput {
  /** Optional — scopes the answer; must be within the caller's allowed set. */
  projectId?: string | null;
  question: string;
}

/**
 * POST /ai/copilot/query — permission-scoped RAG answer grounded only in
 * retrieved project content, with citations. Mirrors the estimation service:
 * JWT from local storage + one refresh-token retry on 401.
 */
export async function askCopilot(
  input: CopilotQueryInput,
): Promise<CopilotAnswer> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/ai/copilot/query`, headers, input);
    return (res.data?.data ?? res.data) as CopilotAnswer;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      return await refreshToken(() => askCopilot(input));
    }
    throw error;
  }
}
