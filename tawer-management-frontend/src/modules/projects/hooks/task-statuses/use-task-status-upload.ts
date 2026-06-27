import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  taskStatusSchema,
  TaskStatusFormValues,
} from "@/modules/projects/validation/task-status.schema";
import {
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
} from "@/modules/projects/services/api/project-task-statuses";
import { TaskStatusType } from "@/modules/projects/types/project-task-statuses";

function buildDefaults(status?: TaskStatusType | null, defaultOrder: number = 1): TaskStatusFormValues {
  return {
    name: status?.name ?? "",
    color: status?.color ?? "#000000",
    order: status?.order ?? defaultOrder,
  };
}

interface Params {
  projectId: string;
  status?: TaskStatusType | null;
  defaultOrder?: number;
  onSuccess?: () => void;
}

export default function useTaskStatusUpload({
  projectId,
  status,
  defaultOrder = 1,
  onSuccess,
}: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<TaskStatusFormValues>({
    resolver: zodResolver(taskStatusSchema) as any,
    defaultValues: buildDefaults(status, defaultOrder),
  });

  useEffect(() => {
    form.reset(buildDefaults(status, defaultOrder));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.id, defaultOrder]);

  async function onSubmit(data: TaskStatusFormValues) {
    setIsPending(true);
    setError("");
    try {
      const payload = {
        name: data.name,
        color: data.color,
        displayOrder: data.order,
      };

      if (status?.id) {
        await updateTaskStatus(projectId, status.id, payload);
        toast.success("Status updated");
      } else {
        await createTaskStatus(projectId, payload);
        toast.success("Status created");
      }
      queryClient.invalidateQueries({
        queryKey: ["task-statuses", projectId],
      });
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  async function deleteStatusFromProject(statusId: string) {
    setIsPending(true);
    setError("");
    try {
      await deleteTaskStatus(projectId, statusId);
      toast.success("Status deleted");
      queryClient.invalidateQueries({
        queryKey: ["task-statuses", projectId],
      });
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { form, isPending, onSubmit, error, deleteStatusFromProject };
}
