import { useQuery } from "@tanstack/react-query";
import {
  CapacityType,
  retrieveProjectCapacity,
} from "@/modules/projects/services/api/project-analytics";

export default function useProjectCapacity(projectId: string) {
  const { data, isLoading, isError } = useQuery<CapacityType>({
    queryKey: ["project-capacity", projectId],
    queryFn: () => retrieveProjectCapacity(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    capacity: data ?? null,
    capacityIsLoading: isLoading,
    capacityError: isError,
  };
}
