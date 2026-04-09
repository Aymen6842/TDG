import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { retrieveProjectTasks } from "../../services";

export default function useProjectTasks(projectId: string) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [milestoneId, setMilestoneId] = useState<string | undefined>(undefined);
  const [epicId, setEpicId] = useState<string | undefined>(undefined);
  const [displayedTasks, setDisplayedTasks] = useState<ProjectTaskType[]>([]);

  const { data, isLoading, isError } = useQuery<ProjectTaskType[]>({
    queryKey: ["project-tasks", projectId, search, status, priority, type, assigneeId, milestoneId, epicId],
    queryFn: () => retrieveProjectTasks({ 
      projectId, 
      search, 
      status, 
      priority, 
      type, 
      assigneeId, 
      milestoneId, 
      epicId 
    }),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  useEffect(() => {
    if (data) setDisplayedTasks(data);
  }, [data]);

  return {
    tasks: displayedTasks,
    tasksAreLoading: isLoading,
    tasksError: isError,
    searchState: [search, setSearch] as [string, (s: string) => void],
    statusState: [status, setStatus] as [string | undefined, (s: string | undefined) => void],
    priorityState: [priority, setPriority] as [string | undefined, (s: string | undefined) => void],
    typeState: [type, setType] as [string | undefined, (s: string | undefined) => void],
    assigneeState: [assigneeId, setAssigneeId] as [string | undefined, (s: string | undefined) => void],
    milestoneState: [milestoneId, setMilestoneId] as [string | undefined, (s: string | undefined) => void],
    epicState: [epicId, setEpicId] as [string | undefined, (s: string | undefined) => void],
    setDisplayedTasks
  };
}
