import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sprintSchema, SprintFormValues } from "../../validation/sprint.schema";
import { uploadSprint } from "../../services/mutations/sprint-upload";
import { SprintType, SprintContentPayload } from "../../types/project-sprints";

function buildDefaults(sprint?: SprintType | null): SprintFormValues {
  const now = new Date(); now.setMinutes(0, 0, 0);
  const twoWeeks = new Date(now); twoWeeks.setDate(twoWeeks.getDate() + 14);
  return {
    name: sprint?.name ?? "",
    description: sprint?.description ?? "",
    details: sprint?.details ?? "",
    language: sprint?.contents?.[0]?.language ?? undefined,
    status: sprint?.status ?? "Pending",
    startDate: sprint?.startDate ? sprint.startDate.toISOString() : now.toISOString(),
    endDate: sprint?.endDate ? sprint.endDate.toISOString() : twoWeeks.toISOString(),
    estimatedStartDate: sprint?.estimatedStartDate ? sprint.estimatedStartDate.toISOString() : now.toISOString(),
    estimatedEndDate: sprint?.estimatedEndDate ? sprint.estimatedEndDate.toISOString() : twoWeeks.toISOString(),
  };
}

interface Params {
  projectId: string;
  sprint?: SprintType | null;
  onSuccess?: () => void;
}

export default function useSprintUpload({ projectId, sprint, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: buildDefaults(sprint),
  });

  useEffect(() => {
    form.reset(buildDefaults(sprint));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprint?.id]);

  async function onSubmit(data: SprintFormValues) {
    setIsPending(true);
    setError("");
    try {
      const existingContent = sprint?.contents?.[0];
      const content: SprintContentPayload = {
        id: existingContent?.id,
        name: data.name,
        description: data.description,
        details: data.details,
        language: data.language,
      };

      await uploadSprint(
        projectId,
        {
          startDate: data.startDate,
          endDate: data.endDate,
          estimatedStartDate: data.estimatedStartDate,
          estimatedEndDate: data.estimatedEndDate,
          status: data.status,
          contents: [content],
        },
        sprint?.id
      );

      toast.success(sprint?.id ? "Sprint updated" : "Sprint created");
      queryClient.invalidateQueries({ queryKey: ["project-sprints", projectId] });
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { form, isPending, onSubmit, error };
}
