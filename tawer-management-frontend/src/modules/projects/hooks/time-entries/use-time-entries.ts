import { useQuery } from "@tanstack/react-query";
import { TimeEntryType } from "@/modules/projects/types/project-time-entries";
import { retrieveTimeEntries } from "@/modules/projects/services/api/project-time-entries";

export default function useTimeEntries(projectId: string, taskId: string) {
  const { data, isLoading, isError } = useQuery<TimeEntryType[]>({
    queryKey: ["time-entries", projectId, taskId],
    queryFn: () => retrieveTimeEntries(projectId, taskId),
    enabled: !!projectId && !!taskId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    timeEntries: data ?? [],
    timeEntriesAreLoading: isLoading,
    timeEntriesError: isError,
  };
}
