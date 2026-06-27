import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { TaskSort, TaskStatus, TaskPriority, FilteringTasksHookResult } from "../../../types/filtering";
import { TaskType } from "../../../types/tasks";
import retrieveTasks from "../../../services/extraction/tasks";

export default function usePersonalTasks(): FilteringTasksHookResult {

  /** Filters */
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState<boolean | undefined>(undefined);
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [sortBy, setSortBy] = useState<TaskSort | undefined>(undefined);
  const [displayedTasks, setDisplayedTasks] = useState<TaskType[]>([])
  const [filterApplication, setFilterApplication] = useState(0);

  const { data, isLoading, isError } = useQuery<TaskType[]>({
    queryKey: [
      "personal-tasks",
      filterApplication,
      archived,
      status,
      priority,
      sortBy,
      search
    ],
    queryFn: () => retrieveTasks({
      archived,
      status,
      priority,
      sortBy,
      search
    }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  useEffect(() => {
    if (data) setDisplayedTasks(data)
  }, [data])

  const applyFilter = () => {
    setFilterApplication(filterApplication + 1);
  };

  return {
    tasks: data ? displayedTasks : undefined,
    tasksAreLoading: isLoading || data === undefined,
    tasksError: isError || data === null,
    filterVersion: filterApplication,
    archivedState: [archived, setArchived],
    statusState: [status, setStatus],
    priorityState: [priority, setPriority],
    sortByState: [sortBy, setSortBy],
    searchState: [search, setSearch],
    applyFilter,
    setDisplayedTasks
  };
}
