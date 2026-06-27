import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  reorderBacklog,
  moveTaskToSprint,
  bulkUpdateTaskStatus,
} from "@/modules/projects/services/api/project-backlog";

export default function useBacklogActions(projectId: string) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function reorder(orderedTaskIds: string[]) {
    setIsPending(true);
    setError("");
    try {
      await reorderBacklog(projectId, orderedTaskIds);
      queryClient.invalidateQueries({ queryKey: ["project-backlog", projectId] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  async function moveToSprint(taskId: string, sprintId: string) {
    setIsPending(true);
    setError("");
    try {
      await moveTaskToSprint(projectId, taskId, sprintId);
      queryClient.invalidateQueries({ queryKey: ["project-backlog", projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprint-tasks", projectId, sprintId] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  async function bulkStatusUpdate(taskIds: string[], status: string) {
    setIsPending(true);
    setError("");
    try {
      await bulkUpdateTaskStatus(projectId, taskIds, status);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-backlog", projectId] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { reorder, moveToSprint, bulkStatusUpdate, isPending, error };
}
