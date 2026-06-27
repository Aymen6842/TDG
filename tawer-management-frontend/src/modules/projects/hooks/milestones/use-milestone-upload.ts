import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  milestoneSchema,
  MilestoneFormValues,
} from "@/modules/projects/validation/milestone.schema";
import {
  createMilestone,
  updateMilestone,
  deleteMilestone,
  completeMilestone,
} from "@/modules/projects/services/api/project-milestones";
import { MilestoneType } from "@/modules/projects/types/project-milestones";

function buildDefaults(milestone?: MilestoneType | null): MilestoneFormValues {
  return {
    name: milestone?.name ?? "",
    description: milestone?.description ?? "",
    dueDate: milestone?.dueDate ? milestone.dueDate.toISOString() : "",
  };
}

interface Params {
  projectId: string;
  milestone?: MilestoneType | null;
  onSuccess?: () => void;
}

export default function useMilestoneUpload({
  projectId,
  milestone,
  onSuccess,
}: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema) as any,
    defaultValues: buildDefaults(milestone),
  });

  useEffect(() => {
    form.reset(buildDefaults(milestone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone?.id]);

  async function onSubmit(data: MilestoneFormValues) {
    setIsPending(true);
    setError("");
    try {
      if (milestone?.id) {
        await updateMilestone(projectId, milestone.id, {
          name: data.name,
          description: data.description || undefined,
          dueDate: data.dueDate || undefined,
        });
        toast.success("Milestone updated");
      } else {
        await createMilestone(projectId, {
          name: data.name,
          description: data.description || undefined,
          dueDate: data.dueDate,
        });
        toast.success("Milestone created");
      }
      queryClient.invalidateQueries({
        queryKey: ["project-milestones", projectId],
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

  async function completeMilestoneInProject(milestoneId: string) {
    setIsPending(true);
    setError("");
    try {
      await completeMilestone(projectId, milestoneId);
      toast.success("Milestone completed");
      queryClient.invalidateQueries({
        queryKey: ["project-milestones", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-gantt", projectId],
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

  async function deleteMilestoneFromProject(milestoneId: string) {
    setIsPending(true);
    setError("");
    try {
      await deleteMilestone(projectId, milestoneId);
      toast.success("Milestone deleted");
      queryClient.invalidateQueries({
        queryKey: ["project-milestones", projectId],
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

  return {
    form,
    isPending,
    onSubmit,
    error,
    completeMilestoneInProject,
    deleteMilestoneFromProject,
  };
}
