"use client";
import React from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import uploadProjectTask from "@/modules/projects/services/api/project-task-upload";
import useTaskStatuses from "@/modules/projects/hooks/task-statuses/use-task-statuses";
import { projectTaskStatusClasses } from "@/modules/projects/utils/badges/project-task-badges";

// ─── Enum-based transition map (mirrors backend logic) ──────────────────────

const AGILE_TRANSITIONS: Record<string, string[]> = {
  BACKLOG: ["TODO"],
  TODO: ["BACKLOG", "IN_PROGRESS"],
  IN_PROGRESS: ["TODO", "IN_REVIEW"],
  IN_REVIEW: ["IN_PROGRESS", "TESTING"],
  TESTING: ["IN_REVIEW", "DONE"],
  DONE: ["TESTING"],
};

const FREESTYLE_TRANSITIONS: Record<string, string[]> = {
  TODO: ["IN_PROGRESS"],
  IN_PROGRESS: ["TODO", "DONE"],
  DONE: ["IN_PROGRESS"],
};

function getNextStatuses(current: string, isAgile: boolean): string[] {
  const map = isAgile ? AGILE_TRANSITIONS : FREESTYLE_TRANSITIONS;
  return map[current?.toUpperCase()] ?? [];
}

function formatLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  taskId: string;
  currentStatus: string;
  isAgile: boolean;
}

export default function TaskStatusStepper({ projectId, taskId, currentStatus, isAgile }: Props) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = React.useState(false);
  const { taskStatuses } = useTaskStatuses(projectId);

  // If project has custom statuses, use them and respect allowedTransitions
  const hasCustomStatuses = taskStatuses.length > 0;
  const currentStatusRecord = taskStatuses.find((s) => s.name === currentStatus);

  let nextStatuses: string[] = [];

  if (hasCustomStatuses) {
    if (currentStatusRecord) {
      nextStatuses = taskStatuses
        .filter((s) => s.name !== currentStatus)
        .filter((s) => !s.isSystem || (currentStatusRecord.allowedTransitions?.includes(s.name) ?? false))
        .map((s) => s.name);
    }
  } else {
    nextStatuses = getNextStatuses(currentStatus, isAgile);
  }

  async function handleTransition(newStatus: string) {
    setIsPending(true);
    try {
      await uploadProjectTask({
        task: { status: newStatus },
        id: taskId,
        projectId,
      });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success(`Status → ${formatLabel(newStatus)}`);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "Failed to update status";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  }

  const statusClass = projectTaskStatusClasses[currentStatus?.toUpperCase()] ?? "bg-muted text-muted-foreground";

  if (nextStatuses.length === 0) {
    return (
      <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}>
        {formatLabel(currentStatus)}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-7 gap-1.5 text-xs font-semibold capitalize ${statusClass} border-0`}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="size-3 animate-spin" /> : null}
          {formatLabel(currentStatus)}
          <ChevronRight className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {nextStatuses.map((s) => (
          <DropdownMenuItem key={s} onClick={() => handleTransition(s)} className="text-xs capitalize">
            {formatLabel(s)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
