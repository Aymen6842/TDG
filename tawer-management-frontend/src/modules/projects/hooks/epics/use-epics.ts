import { useQuery } from "@tanstack/react-query";
import { EpicType } from "@/modules/projects/types/project-epics";
import { retrieveEpics } from "@/modules/projects/services/api/project-epics";

export default function useEpics(projectId: string) {
  const { data, isLoading, isError } = useQuery<EpicType[]>({
    queryKey: ["project-epics", projectId],
    queryFn: () => retrieveEpics(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    epics: data ?? [],
    epicsAreLoading: isLoading,
    epicsError: isError,
  };
}
