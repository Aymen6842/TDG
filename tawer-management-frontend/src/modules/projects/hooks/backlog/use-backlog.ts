import { useQuery } from "@tanstack/react-query";
import type { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import {
  retrieveBacklog,
  retrieveSprintTasks,
} from "@/modules/projects/services/api/project-backlog";

export function useBacklog(projectId: string) {
  const { data, isLoading, isError } = useQuery<ProjectTaskType[]>({
    queryKey: ["project-backlog", projectId],
    queryFn: () => retrieveBacklog(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    backlogTasks: data ?? [],
    backlogIsLoading: isLoading,
    backlogError: isError,
  };
}

export function useSprintTasks(projectId: string, sprintId: string) {
  const { data, isLoading, isError } = useQuery<ProjectTaskType[]>({
    queryKey: ["sprint-tasks", projectId, sprintId],
    queryFn: () => retrieveSprintTasks(projectId, sprintId),
    enabled: !!projectId && !!sprintId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    sprintTasks: data ?? [],
    sprintTasksAreLoading: isLoading,
    sprintTasksError: isError,
  };
}
