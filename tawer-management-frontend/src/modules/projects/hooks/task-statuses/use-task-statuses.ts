import { useQuery } from "@tanstack/react-query";
import { TaskStatusType } from "@/modules/projects/types/project-task-statuses";
import { retrieveTaskStatuses } from "@/modules/projects/services/api/project-task-statuses";

export default function useTaskStatuses(projectId: string) {
  const { data, isLoading, isError } = useQuery<TaskStatusType[]>({
    queryKey: ["task-statuses", projectId],
    queryFn: () => retrieveTaskStatuses(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    taskStatuses: data ?? [],
    taskStatusesAreLoading: isLoading,
    taskStatusesError: isError,
  };
}
