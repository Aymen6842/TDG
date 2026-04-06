import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectType, ProjectTypeEnum } from "@/modules/projects/types/projects";
import { useProjectStore, ProjectFilterTab } from "../../store/projects";
import retrieveProjects from "../../services/extraction/projects";

export default function useProjects() {
  const { activeTab } = useProjectStore();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<ProjectFilterTab | undefined>(undefined);
  const [projectType, setProjectType] = React.useState<ProjectTypeEnum | undefined>(undefined);
  const [businessUnit, setBusinessUnit] = React.useState<string | undefined>(undefined);
  const [isArchived, setIsArchived] = React.useState<boolean | undefined>(undefined);
  const [paid, setPaid] = React.useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState<string | undefined>(undefined);
  const [displayedProjects, setDisplayedProjects] = React.useState<ProjectType[]>([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: retrieveProjects,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  React.useEffect(() => {
    if (!data) return;

    let filtered = [...data];

    if (status && status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    } else if (activeTab && activeTab !== "all") {
      filtered = filtered.filter((p) => p.status === activeTab);
    }

    if (projectType)              filtered = filtered.filter((p) => p.projectType === projectType);
    if (businessUnit)             filtered = filtered.filter((p) => p.businessUnit === businessUnit);
    if (isArchived !== undefined) filtered = filtered.filter((p) => p.isArchived === isArchived);
    if (paid !== undefined)       filtered = filtered.filter((p) => p.paid === paid);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "nameAsc")       return a.name.localeCompare(b.name);
        if (sortBy === "nameDesc")      return b.name.localeCompare(a.name);
        if (sortBy === "startDateAsc")  return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        if (sortBy === "startDateDesc") return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        return 0;
      });
    } else {
      filtered.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    setDisplayedProjects(filtered);
  }, [data, search, status, projectType, businessUnit, isArchived, paid, sortBy, activeTab]);

  return {
    projects: displayedProjects,
    projectsAreLoading: isLoading || data === undefined,
    projectsError: isError || data === null,
    searchState: [search, setSearch] as const,
    statusState: [status, setStatus] as const,
    projectTypeState: [projectType, setProjectType] as const,
    businessUnitState: [businessUnit, setBusinessUnit] as const,
    isArchivedState: [isArchived, setIsArchived] as const,
    paidState: [paid, setPaid] as const,
    sortByState: [sortBy, setSortBy] as const,
    setDisplayedProjects
  };
}
