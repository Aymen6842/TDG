import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import {
  estimateTask,
  EstimateResult,
} from "@/modules/ai/services/api/estimation";

interface Params {
  projectId: string;
  title: string;
  description?: string | null;
  /** Turn the query off (e.g. while the form sheet is closed). */
  enabled?: boolean;
}

/** Draft must have at least this much title text before we spend an embedding. */
const MIN_TITLE_LENGTH = 4;
const DEBOUNCE_MS = 600;

/**
 * React Query wrapper around `POST /ai/estimate`. The title/description are
 * debounced so we only call the (embedding-backed) endpoint once the user pauses
 * typing, and only when there is enough of a title to match on.
 */
export default function useTaskEstimate({
  projectId,
  title,
  description,
  enabled = true,
}: Params) {
  const debouncedTitle = useDebounce(title.trim(), DEBOUNCE_MS);
  const debouncedDescription = useDebounce((description ?? "").trim(), DEBOUNCE_MS);

  const canEstimate =
    enabled && !!projectId && debouncedTitle.length >= MIN_TITLE_LENGTH;

  const query = useQuery<EstimateResult>({
    queryKey: [
      "ai-task-estimate",
      projectId,
      debouncedTitle,
      debouncedDescription,
    ],
    queryFn: () =>
      estimateTask({
        projectId,
        title: debouncedTitle,
        description: debouncedDescription || undefined,
      }),
    enabled: canEstimate,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    estimate: query.data,
    estimateIsLoading: query.isLoading && canEstimate,
    estimateIsFetching: query.isFetching,
    estimateError: query.isError,
    /** True once a debounced title long enough to estimate on is present. */
    isActive: canEstimate,
  };
}
