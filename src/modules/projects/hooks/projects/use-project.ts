import { useQuery } from "@tanstack/react-query";
import { ProjectType } from "@/modules/projects/types/projects";
import retrieveProjectById from "../../services/extraction/project";

export default function useProject(id: string) {
  const { data, isLoading, isError } = useQuery<ProjectType | null>({
    queryKey: ["project", id],
    queryFn: () => retrieveProjectById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  return {
    project: data ?? null,
    projectIsLoading: isLoading,
    projectError: isError
  };
}
