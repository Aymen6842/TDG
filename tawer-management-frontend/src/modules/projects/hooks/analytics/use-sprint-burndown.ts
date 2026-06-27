import { useQuery } from "@tanstack/react-query";
import {
  BurndownPoint,
  retrieveBurndown,
} from "@/modules/projects/services/api/project-analytics";

export default function useSprintBurndown(sprintId: string) {
  const { data, isLoading, isError } = useQuery<BurndownPoint[]>({
    queryKey: ["sprint-burndown", sprintId],
    queryFn: () => retrieveBurndown(sprintId),
    enabled: !!sprintId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    burndownData: data ?? [],
    burndownIsLoading: isLoading,
    burndownError: isError,
  };
}
