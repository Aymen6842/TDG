import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  labelSchema,
  LabelFormValues,
} from "@/modules/projects/validation/label.schema";
import {
  createLabel,
  updateLabel,
  deleteLabel,
  assignLabelToTask,
  removeLabelFromTask,
} from "@/modules/projects/services/api/project-labels";
import { LabelType } from "@/modules/projects/types/project-labels";

function buildDefaults(label?: LabelType | null): LabelFormValues {
  return {
    name: label?.name ?? "",
    color: label?.color ?? "#000000",
  };
}

interface Params {
  projectId: string;
  label?: LabelType | null;
  onSuccess?: () => void;
}

export default function useLabelUpload({ projectId, label, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelSchema) as any,
    defaultValues: buildDefaults(label),
  });

  useEffect(() => {
    form.reset(buildDefaults(label));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label?.id]);

  async function onSubmit(data: LabelFormValues) {
    setIsPending(true);
    setError("");
    try {
      if (label?.id) {
        await updateLabel(projectId, label.id, data);
        toast.success("Label updated");
      } else {
        await createLabel(projectId, data);
        toast.success("Label created");
      }
      queryClient.invalidateQueries({ queryKey: ["project-labels", projectId] });
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

  async function deleteLabelFromProject(labelId: string) {
    setIsPending(true);
    setError("");
    try {
      await deleteLabel(projectId, labelId);
      toast.success("Label deleted");
      queryClient.invalidateQueries({ queryKey: ["project-labels", projectId] });
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

  async function assignLabel(taskId: string, labelId: string) {
    setIsPending(true);
    setError("");
    try {
      await assignLabelToTask(projectId, taskId, labelId);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  async function removeLabel(taskId: string, labelId: string) {
    setIsPending(true);
    setError("");
    try {
      await removeLabelFromTask(projectId, taskId, labelId);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return {
    form,
    isPending,
    onSubmit,
    error,
    deleteLabelFromProject,
    assignLabel,
    removeLabel,
  };
}
