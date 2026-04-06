import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getProjectTaskFormSchema, ProjectTaskFormSchema } from "../../validation/project-task.schema";
import uploadProjectTask from "../../services/mutations/project-task-upload";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";

interface Params {
  projectId: string;
  task?: ProjectTaskType | null;
  onSuccess?: () => void;
}

export default function useProjectTaskUpload({ projectId, task, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const t = useTranslations("modules.projects.project.taskAttributes");

  const schema = getProjectTaskFormSchema({ 
    t: (key: string) => t(`validations.${key}`)
  });

  const form = useForm<ProjectTaskFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      type: (task?.type as any) || "TASK",
      status: (task?.status as any) || "TODO",
      priority: (task?.priority as any) || "MEDIUM",
      storyPoints: task?.storyPoints || 0,
      dueDate: task?.dueDate || ""
    }
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        type: (task.type as any) || "TASK",
        status: (task.status as any) || "TODO",
        priority: (task.priority as any) || "MEDIUM",
        storyPoints: task.storyPoints || 0,
        dueDate: task.dueDate || ""
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        storyPoints: 0,
        dueDate: ""
      });
    }
  }, [task, form]);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(data: ProjectTaskFormSchema) {
    setIsPending(true);
    if (error) setError("");

    try {
      await uploadProjectTask({
        task: data,
        id: task?.id,
        projectId
      });

      toast.success(task?.id ? "Project task updated" : "Project task created");

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });

      onSuccess?.();
    } catch (err) {
      toast.error("Failed to save project task");
      setError("An error occurred while saving the task.");
    } finally {
      setIsPending(false);
    }
  }

  return {
    form,
    error,
    isPending,
    onSubmit
  };
}
