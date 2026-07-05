import { useCallback, useRef, useState } from "react";
import {
  streamCopilot,
  CopilotCitation,
  CopilotQueryInput,
} from "@/modules/ai/services/api/copilot";

interface CopilotState {
  /** The answer text accumulated so far (grows token-by-token). */
  answer: string;
  /** Resolved citations — populated only when the final event arrives. */
  citations: CopilotCitation[];
  /** True once the model refused / retrieval was too weak (final event). */
  insufficientContext: boolean;
  /** True from submit until the stream completes (or errors). */
  isStreaming: boolean;
  /** True if the stream failed or emitted an error event. */
  isError: boolean;
  /** True once any answer text has started rendering. */
  hasStarted: boolean;
}

const INITIAL: CopilotState = {
  answer: "",
  citations: [],
  insufficientContext: false,
  isStreaming: false,
  isError: false,
  hasStarted: false,
};

/**
 * Drives the SSE copilot stream (§4.5). Unlike the previous React Query mutation,
 * the answer is built incrementally: `onToken` appends deltas so the panel can
 * render tokens as they arrive, and `onFinal` attaches the citation chips. An
 * `AbortController` cancels an in-flight stream when the user asks again or
 * switches projects, so stale tokens never bleed into a new answer.
 */
export default function useCopilot() {
  const [state, setState] = useState<CopilotState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const ask = useCallback((input: CopilotQueryInput) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ ...INITIAL, isStreaming: true });

    void streamCopilot(
      input,
      {
        onToken: (text) =>
          setState((prev) => ({
            ...prev,
            answer: prev.answer + text,
            hasStarted: true,
          })),
        onFinal: ({ citations, insufficientContext }) =>
          setState((prev) => ({
            ...prev,
            citations,
            insufficientContext,
            isStreaming: false,
            hasStarted: true,
          })),
        onError: () =>
          setState((prev) => ({ ...prev, isStreaming: false, isError: true })),
      },
      controller.signal,
    ).catch(() => {
      // Aborts are expected (ask again / project switch) — ignore them.
      if (controller.signal.aborted) return;
      setState((prev) => ({ ...prev, isStreaming: false, isError: true }));
    });
  }, []);

  return { ask, reset, ...state };
}
