import { useQuery } from "@tanstack/react-query";
import { GanttType } from "@/modules/projects/types/project-milestones";
import { retrieveGanttData } from "@/modules/projects/services/api/project-milestones";

export default function useGanttData(projectId: string) {
  const { data, isLoading, isError } = useQuery<GanttType>({
    queryKey: ["project-gantt", projectId],
    queryFn: () => retrieveGanttData(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ganttData: data ?? null,
    ganttIsLoading: isLoading,
    ganttError: isError,
  };
}
