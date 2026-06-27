import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  timeEntrySchema,
  TimeEntryFormValues,
} from "@/modules/projects/validation/time-entry.schema";
import {
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from "@/modules/projects/services/api/project-time-entries";
import { TimeEntryType } from "@/modules/projects/types/project-time-entries";

function buildDefaults(entry?: TimeEntryType | null): TimeEntryFormValues {
  return {
    hours: entry?.hours ?? 0,
    description: entry?.description ?? "",
  };
}

interface Params {
  projectId: string;
  taskId: string;
  entry?: TimeEntryType | null;
  onSuccess?: () => void;
}

export default function useTimeEntryUpload({
  projectId,
  taskId,
  entry,
  onSuccess,
}: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema) as any,
    defaultValues: buildDefaults(entry),
  });

  useEffect(() => {
    form.reset(buildDefaults(entry));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  async function onSubmit(data: TimeEntryFormValues) {
    setIsPending(true);
    setError("");
    try {
      if (entry?.id) {
        await updateTimeEntry(projectId, taskId, entry.id, {
          hours: data.hours,
          description: data.description || undefined,
        });
        toast.success("Time entry updated");
      } else {
        await createTimeEntry(projectId, taskId, {
          hours: data.hours,
          description: data.description || undefined,
        });
        toast.success("Time entry created");
      }
      queryClient.invalidateQueries({
        queryKey: ["time-entries", projectId, taskId],
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

  async function deleteTimeEntryFromTask(entryId: string) {
    setIsPending(true);
    setError("");
    try {
      await deleteTimeEntry(projectId, taskId, entryId);
      toast.success("Time entry deleted");
      queryClient.invalidateQueries({
        queryKey: ["time-entries", projectId, taskId],
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

  return { form, isPending, onSubmit, error, deleteTimeEntryFromTask };
}
