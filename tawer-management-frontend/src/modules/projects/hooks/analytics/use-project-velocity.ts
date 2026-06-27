import { useQuery } from "@tanstack/react-query";
import {
  VelocityPoint,
  retrieveVelocity,
} from "@/modules/projects/services/api/project-analytics";

export default function useProjectVelocity(projectId: string) {
  const { data, isLoading, isError } = useQuery<VelocityPoint[]>({
    queryKey: ["project-velocity", projectId],
    queryFn: () => retrieveVelocity(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    velocityData: data ?? [],
    velocityIsLoading: isLoading,
    velocityError: isError,
  };
}
