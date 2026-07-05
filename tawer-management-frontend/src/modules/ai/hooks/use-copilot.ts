import { useMutation } from "@tanstack/react-query";
import {
  askCopilot,
  CopilotAnswer,
  CopilotQueryInput,
} from "@/modules/ai/services/api/copilot";

/**
 * React Query mutation around `POST /ai/copilot/query`. A mutation (not a query)
 * because asking is an explicit user action — one embedding + one generation
 * call per submit — not something to refetch on focus. The latest answer lives
 * in `mutation.data`; `reset` clears it between projects.
 */
export default function useCopilot() {
  const mutation = useMutation<CopilotAnswer, unknown, CopilotQueryInput>({
    mutationFn: (input) => askCopilot(input),
  });

  return {
    ask: mutation.mutate,
    answer: mutation.data,
    isAsking: mutation.isPending,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}
