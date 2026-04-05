import { useQuery } from "@tanstack/react-query";
import { TaskDetailsType } from "../../../types/tasks";
import retrieveTaskFromServerSide from "../../../services/extraction/task";

interface Params {
  id: string;
}

export default function useTaskInfo({ id }: Params) {
  const { data, isLoading, isError } = useQuery<TaskDetailsType>({
    queryKey: ["personal-tasks", "personal-task", id],
    queryFn: () => retrieveTaskFromServerSide({ id }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: id !== ""
  });

  return {
    task: data,
    taskIsLoading: isLoading || data === undefined,
    taskError: isError || data === null
  };
}
