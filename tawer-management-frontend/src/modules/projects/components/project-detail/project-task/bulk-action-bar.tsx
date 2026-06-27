"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import useTaskStatuses from "@/modules/projects/hooks/task-statuses/use-task-statuses";
import useBacklogActions from "@/modules/projects/hooks/backlog/use-backlog-actions";
import { EnumProjectTaskStatus } from "@/modules/projects/types/project-tasks";

interface Props {
  projectId: string;
}

export default function BulkActionBar({ projectId }: Props) {
  const { selectedTaskIds, clearSelection } = useProjectTasksStore();
  const { taskStatuses } = useTaskStatuses(projectId);
  const { bulkStatusUpdate, isPending } = useBacklogActions(projectId);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");

  if (selectedTaskIds.length === 0) return null;

  const statusOptions =
    taskStatuses.length > 0
      ? taskStatuses.map((s) => ({ value: s.name, label: s.name }))
      : Object.values(EnumProjectTaskStatus).map((s) => ({
          value: s,
          label: s.toLowerCase().replace(/_/g, " "),
        }));

  async function handleApply() {
    if (!selectedStatus) return;
    await bulkStatusUpdate(selectedTaskIds, selectedStatus);
    clearSelection();
    setSelectedStatus("");
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2">
      <Badge variant="secondary">
        {selectedTaskIds.length} selected
      </Badge>

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Set status…" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        size="sm"
        disabled={!selectedStatus || isPending}
        onClick={handleApply}
      >
        Apply
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          clearSelection();
          setSelectedStatus("");
        }}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
