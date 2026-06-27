import { useQuery } from "@tanstack/react-query";
import { MilestoneType } from "@/modules/projects/types/project-milestones";
import { retrieveMilestones } from "@/modules/projects/services/api/project-milestones";
import { PaginationType } from "@/types/pagination";

export default function useMilestones(projectId: string) {
  const { data, isLoading, isError } = useQuery<{
    data: MilestoneType[];
    pagination: PaginationType;
  }>({
    queryKey: ["project-milestones", projectId],
    queryFn: () => retrieveMilestones(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    milestones: data?.data ?? [],
    pagination: data?.pagination,
    milestonesAreLoading: isLoading,
    milestonesError: isError,
  };
}
