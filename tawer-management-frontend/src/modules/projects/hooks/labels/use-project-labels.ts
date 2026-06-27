import { useQuery } from "@tanstack/react-query";
import { LabelType } from "@/modules/projects/types/project-labels";
import { retrieveLabels } from "@/modules/projects/services/api/project-labels";

export default function useProjectLabels(projectId: string) {
  const { data, isLoading, isError } = useQuery<LabelType[]>({
    queryKey: ["project-labels", projectId],
    queryFn: () => retrieveLabels(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    labels: data ?? [],
    labelsAreLoading: isLoading,
    labelsError: isError,
  };
}
