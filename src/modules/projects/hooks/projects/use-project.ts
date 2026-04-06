import { useQuery } from "@tanstack/react-query";
import { ProjectType } from "@/modules/projects/types/projects";
import retrieveProjectBySlug from "../../services/extraction/project";

export default function useProject(slug: string) {
  const { data, isLoading, isError } = useQuery<ProjectType | null>({
    queryKey: ["project", slug],
    queryFn: () => retrieveProjectBySlug(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  return {
    project: data ?? null,
    projectIsLoading: isLoading,
    projectError: isError
  };
}
