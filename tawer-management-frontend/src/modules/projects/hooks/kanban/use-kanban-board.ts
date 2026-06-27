import { useQuery } from "@tanstack/react-query";
import {
  KanbanBoardResponse,
  KanbanParams,
  retrieveKanbanBoard,
} from "@/modules/projects/services/api/project-kanban";

export default function useKanbanBoard(
  projectId: string,
  params?: KanbanParams,
) {
  const { data, isLoading, isError } = useQuery<KanbanBoardResponse>({
    queryKey: [
      "kanban",
      projectId,
      params?.sprintId ?? null,
      params?.epicId ?? null,
      params?.groupBy ?? null,
    ],
    queryFn: () => retrieveKanbanBoard(projectId, params),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    kanbanBoard: data ?? null,
    kanbanIsLoading: isLoading,
    kanbanError: isError,
  };
}
