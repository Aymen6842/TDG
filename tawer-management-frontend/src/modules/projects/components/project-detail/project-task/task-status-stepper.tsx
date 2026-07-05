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
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import uploadProjectTask from "@/modules/projects/services/api/project-task-upload";
import useTaskStatuses from "@/modules/projects/hooks/task-statuses/use-task-statuses";
import { projectTaskStatusClasses } from "@/modules/projects/utils/badges/project-task-badges";

function formatLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  taskId: string;
  currentStatus: string;
}

export default function TaskStatusStepper({ projectId, taskId, currentStatus }: Props) {
  const t = useTranslations("modules.projects.taskSections.statusStepper");
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = React.useState(false);
  const { taskStatuses } = useTaskStatuses(projectId);

  // Legal transitions are derived entirely from the project's statuses as the
  // backend reports them. This mirrors backend `isValidStatusTransitionDynamic`:
  // a custom (non-system) target is always reachable; a system target is only
  // reachable when it appears in the current status's `allowedTransitions`.
  const currentStatusRecord = taskStatuses.find((s) => s.name === currentStatus);

  const nextStatuses: string[] = currentStatusRecord
    ? taskStatuses
        .filter((s) => s.name !== currentStatus)
        .filter((s) => !s.isSystem || (currentStatusRecord.allowedTransitions?.includes(s.name) ?? false))
        .map((s) => s.name)
    : [];

  async function handleTransition(newStatus: string) {
    setIsPending(true);
    try {
      await uploadProjectTask({
        task: { status: newStatus },
        id: taskId,
        projectId,
      });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success(t("statusUpdatedToast", { status: formatLabel(newStatus) }));
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data.message
          : t("updateFailedToast");
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
