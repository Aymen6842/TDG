import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { epicSchema, EpicFormValues } from "@/modules/projects/validation/epic.schema";
import {
  createEpic,
  updateEpic,
  deleteEpic,
} from "@/modules/projects/services/api/project-epics";
import { EpicType } from "@/modules/projects/types/project-epics";

function buildDefaults(epic?: EpicType | null): EpicFormValues {
  return {
    name: epic?.name ?? "",
    description: epic?.description ?? "",
    color: epic?.color ?? "",
    startDate: epic?.startDate ? epic.startDate.toISOString() : "",
    endDate: epic?.endDate ? epic.endDate.toISOString() : "",
  };
}

interface Params {
  projectId: string;
  epic?: EpicType | null;
  onSuccess?: () => void;
}

export default function useEpicUpload({ projectId, epic, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema) as any,
    defaultValues: buildDefaults(epic),
  });

  useEffect(() => {
    form.reset(buildDefaults(epic));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epic?.id]);

  async function onSubmit(data: EpicFormValues) {
    setIsPending(true);
    setError("");
    try {
      if (epic?.id) {
        await updateEpic(projectId, epic.id, {
          name: data.name,
          description: data.description || undefined,
          color: data.color || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
        });
        toast.success("Epic updated");
      } else {
        await createEpic(projectId, {
          name: data.name,
          description: data.description || undefined,
          color: data.color || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
        });
        toast.success("Epic created");
      }
      queryClient.invalidateQueries({ queryKey: ["project-epics", projectId] });
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  async function deleteEpicFromProject(epicId: string) {
    setIsPending(true);
    setError("");
    try {
      await deleteEpic(projectId, epicId);
      toast.success("Epic deleted");
      queryClient.invalidateQueries({ queryKey: ["project-epics", projectId] });
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { form, isPending, onSubmit, error, deleteEpicFromProject };
}
