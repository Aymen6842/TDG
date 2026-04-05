import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CustomError } from "@/utils/custom-error";

import uploadTaskOnServerSide from "../../services/task-upload";
import { TaskUpdateType } from "../../types/tasks";
import { cleanUpdatedTaskToUpload } from "../../utils/cleaning/task";

interface Params {
  onSuccess?: () => void;
}

export default function useTasksOrdersUpdates({ onSuccess }: Params) {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function updateTasksOrders(data: (TaskUpdateType & { id: string })[]) {


    try {

      const updatedTasks = data.map(task => cleanUpdatedTaskToUpload(task));
      await Promise.all(updatedTasks.map((updatedTask, idx) => uploadTaskOnServerSide({
        task: updatedTask,
        id: data[idx].id
      })));

      queryClient.invalidateQueries({ queryKey: ["personal-tasks"] });

      onSuccess?.();
    } catch (thrownError) {
      const err = thrownError as CustomError;

      if (err.status === 401) {
        router.push("/dashboard/login");
        return;
      }

    }
  }

  return {

    updateTasksOrders,
  };
}
