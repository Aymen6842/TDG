import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SprintType } from "@/modules/projects/types/project-sprints";
import { retrieveProjectSprints } from "../../services";

export default function useProjectSprints(projectId: string) {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  const { data, isLoading, isError } = useQuery<SprintType[]>({
    queryKey: ["project-sprints", projectId, status],
    queryFn: () => retrieveProjectSprints({ projectId, status }),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // search and sortBy are client-side only (no pagination needed for sprints)
  const filtered = (data ?? []).filter((s) =>
    search ? s.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "startDateAsc") return a.startDate.getTime() - b.startDate.getTime();
    if (sortBy === "startDateDesc") return b.startDate.getTime() - a.startDate.getTime();
    if (sortBy === "endDateAsc") return a.endDate.getTime() - b.endDate.getTime();
    if (sortBy === "endDateDesc") return b.endDate.getTime() - a.endDate.getTime();
    return 0;
  });

  return {
    sprints: sorted,
    sprintsAreLoading: isLoading,
    sprintsError: isError,
    statusState: [status, setStatus] as [string | undefined, (s: string | undefined) => void],
    searchState: [search, setSearch] as [string, (s: string) => void],
    sortByState: [sortBy, setSortBy] as [string | undefined, (s: string | undefined) => void],
  };
}
