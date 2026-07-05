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

/** The payload of the terminal `final` SSE event. */
export interface CopilotStreamFinal {
  citations: CopilotCitation[];
  insufficientContext: boolean;
}

/** Callbacks the panel supplies to render an SSE answer as it arrives. */
export interface CopilotStreamHandlers {
  /** A generated text delta — append it to the answer being rendered. */
  onToken: (text: string) => void;
  /** Fired once when generation finishes, carrying the resolved citations. */
  onFinal: (payload: CopilotStreamFinal) => void;
  /** Fired for an out-of-scope project / server error event. */
  onError?: (message: string) => void;
}

/**
 * GET /ai/copilot/stream — the SSE counterpart of {@link askCopilot}. Uses a
 * `fetch` reader rather than `EventSource` so we can send the `Authorization`
 * header, then parses the `token` / `final` / `error` SSE frames and dispatches
 * them to `handlers`. Retries once through `refreshToken` on a 401, and honours
 * an `AbortSignal` so switching projects (or asking again) cancels the stream.
 */
export async function streamCopilot(
  input: CopilotQueryInput,
  handlers: CopilotStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const { access } = extractJWTokens();

  const params = new URLSearchParams();
  params.set("question", input.question);
  if (input.projectId) params.set("projectId", input.projectId);
  const url = `${process.env.BACKEND_ADDRESS}/ai/copilot/stream?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access}`,
      Accept: "text/event-stream",
      "ngrok-skip-browser-warning": "true",
    },
    signal,
  });

  if (res.status === 401) {
    await refreshToken(() => streamCopilot(input, handlers, signal));
    return;
  }
  if (!res.ok || !res.body) {
    throw new Error(`Copilot stream failed with status ${res.status}`);
  }

  await consumeSseStream(res.body, handlers);
}

/** Read a fetch body stream and dispatch complete SSE frames as they arrive. */
async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: CopilotStreamHandlers,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushFrames = () => {
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      dispatchSseFrame(frame, handlers);
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    flushFrames();
  }
  buffer += decoder.decode().replace(/\r\n/g, "\n");
  flushFrames();
  if (buffer.trim().length > 0) dispatchSseFrame(buffer, handlers);
}

/** Parse one `event:`/`data:` SSE frame and route it to the right handler. */
function dispatchSseFrame(
  frame: string,
  handlers: CopilotStreamHandlers,
): void {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }
  if (dataLines.length === 0) return;

  let payload: {
    text?: string;
    citations?: CopilotCitation[];
    insufficientContext?: boolean;
    message?: string;
  };
  try {
    payload = JSON.parse(dataLines.join("\n"));
  } catch {
    return;
  }

  if (event === "token") {
    handlers.onToken(payload.text ?? "");
  } else if (event === "final") {
    handlers.onFinal({
      citations: payload.citations ?? [],
      insufficientContext: Boolean(payload.insufficientContext),
    });
  } else if (event === "error") {
    handlers.onError?.(payload.message ?? "Something went wrong.");
  }
}
