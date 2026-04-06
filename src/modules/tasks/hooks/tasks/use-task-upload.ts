import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomError } from "@/utils/custom-error";
import { cleanTaskDataToUpload, cleanUpdatedTaskToUpload } from "../../utils/cleaning/task";
import { getTaskFormSchema, TaskFormSchema } from "../../validation/task.shema";
import uploadTaskOnServerSide from "../../services/task-upload";
import { TaskType, TaskUpdateType } from "../../types/tasks";

interface Params {
  task?: TaskType | null;
  parentTaskId?: string;
  onSuccess?: () => void;
}

export default function useTaskUpload({ task, parentTaskId, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const t = useTranslations("modules.tasks");
  const tValidations = useTranslations("modules.tasks.validations");
  const tErrors = useTranslations("modules.tasks.errors");

  const schema = getTaskFormSchema({ t: tValidations });

  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {}
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(data: TaskFormSchema) {
    setIsPending(true);
    if (error) setError("");

    try {

      const taskData = cleanTaskDataToUpload(data);

      await uploadTaskOnServerSide({
        task: taskData,
        id: task?.id
      });

      toast.success(parentTaskId ? t("success.subTaskCreated") : (task?.id ? t("success.taskUpdated") : t("success.taskCreated")));

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["personal-tasks"] });

      onSuccess?.();
    } catch (thrownError) {
      const err = thrownError as CustomError;

      if (err.status === 401) {
        router.push("/dashboard/login");
        return;
      }

      if (err.status === 400) {
        toast.error(tErrors("invalidFormat"));
        setError(tErrors("invalidFormat"));
        return;
      }

      if (err.status === 500) {
        toast.error(tErrors("serverError"));
        setError(tErrors("serverError"));
        return;
      }

      toast.error(tErrors("taskUploadFailed"));
    } finally {
      setIsPending(false);
    }
  }

  async function updateTaskStatuses(data: TaskUpdateType) {
    if (!task) return;
    setIsPending(true);
    if (error) setError("");

    try {

      const taskData = cleanUpdatedTaskToUpload(data);

      await uploadTaskOnServerSide({
        task: taskData,
        id: task?.id
      });

      toast.success(parentTaskId ? t("success.subTaskCreated") : (task?.id ? t("success.taskUpdated") : t("success.taskCreated")));

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["personal-tasks"] });

      onSuccess?.();
    } catch (thrownError) {
      const err = thrownError as CustomError;

      if (err.status === 401) {
        router.push("/dashboard/login");
        return;
      }

      if (err.status === 400) {
        toast.error(tErrors("invalidFormat"));
        setError(tErrors("invalidFormat"));
        return;
      }

      if (err.status === 500) {
        toast.error(tErrors("serverError"));
        setError(tErrors("serverError"));
        return;
      }

      toast.error(tErrors("taskUploadFailed"));
    } finally {
      setIsPending(false);
    }
  }

  return {
    form,
    error,
    isPending,
    updateTaskStatuses,
    onSubmit
  };
}
