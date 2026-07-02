"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, PlusCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as Kanban from "@/components/ui/kanban";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectTaskStatusDotColors } from "../../../utils/badges/project-task-badges";
import ProjectTasksKanbanCard from "./project-tasks-kanban-card";
import useKanbanBoard from "@/modules/projects/hooks/kanban/use-kanban-board";
import {
  moveTaskInKanban,
  type KanbanParams,
} from "@/modules/projects/services/api/project-kanban";
import Loading from "@/components/page-loader";

const NO_STATUS_KEY = "NO_STATUS";

type TaskPosition = { status: string; displayOrder: number };

function buildTaskPositions(
  columns: Record<string, ProjectTaskType[]>,
): Map<string, TaskPosition> {
  const positions = new Map<string, TaskPosition>();
  for (const [status, tasks] of Object.entries(columns)) {
    if (status === NO_STATUS_KEY) continue;
    tasks.forEach((task, displayOrder) => {
      positions.set(task.id, { status, displayOrder });
    });
  }
  return positions;
}

function findChangedTasks(
  before: Record<string, ProjectTaskType[]>,
  after: Record<string, ProjectTaskType[]>,
): Array<{ taskId: string; status: string; displayOrder: number }> {
  const beforePositions = buildTaskPositions(before);
  const afterPositions = buildTaskPositions(after);
  const changes: Array<{ taskId: string; status: string; displayOrder: number }> = [];

  for (const [taskId, next] of afterPositions) {
    const prev = beforePositions.get(taskId);
    if (!prev || prev.status !== next.status || prev.displayOrder !== next.displayOrder) {
      changes.push({ taskId, status: next.status, displayOrder: next.displayOrder });
    }
  }

  return changes;
}

// Moves the given tasks back to wherever they sat in `original`, leaving everything else in
// `current` untouched. Used to undo drops into local-only columns that can't be persisted.
function revertTaskPositions(
  current: Record<string, ProjectTaskType[]>,
  original: Record<string, ProjectTaskType[]>,
  taskIds: string[],
): Record<string, ProjectTaskType[]> {
  const idSet = new Set(taskIds);
  const next: Record<string, ProjectTaskType[]> = {};
  for (const [status, tasks] of Object.entries(current)) {
    next[status] = tasks.filter((t) => !idSet.has(t.id));
  }
  for (const [status, tasks] of Object.entries(original)) {
    const restored = tasks.filter((t) => idSet.has(t.id));
    if (restored.length > 0) {
      next[status] = [...(next[status] || []), ...restored];
    }
  }
  return next;
}

interface Props {
  projectId: string;
  params?: KanbanParams;
  projectType: string;
  columnTitles: Record<string, string>;
  /** IDs of user-added columns that aren't backed by a real project status yet. */
  localColumnIds?: string[];
  onTaskClick: (task: ProjectTaskType) => void;
  onDuplicateTask: (task: ProjectTaskType, e: React.MouseEvent) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddColumn: (title: string) => void;
}

export default function ProjectTasksKanbanBoard({
  projectId,
  params,
  projectType,
  columnTitles,
  localColumnIds = [],
  onTaskClick,
  onDuplicateTask,
  onDeleteColumn,
  onAddColumn,
}: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const queryClient = useQueryClient();
  const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState("");
  const [columnToDelete, setColumnToDelete] = React.useState<string | null>(null);

  // Fetch columns from API
  const { kanbanBoard, kanbanIsLoading } = useKanbanBoard(projectId, params);

  // Build a Record<columnId, tasks[]> from the API response for the Kanban DnD root
  const [localColumns, setLocalColumns] = React.useState<Record<string, ProjectTaskType[]>>({});
  const [isDragging, setIsDragging] = React.useState(false);
  const dragBufferRef = React.useRef<Record<string, ProjectTaskType[]> | null>(null);
  const dragStartSnapshotRef = React.useRef<Record<string, ProjectTaskType[]>>({});
  const prevColumnKeyRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!kanbanBoard?.columns) return;
    const key = kanbanBoard.columns.map(c => `${c.columnId}:${c.tasks.map(t => t.id).join(",")}`).join("|");
    if (key !== prevColumnKeyRef.current) {
      prevColumnKeyRef.current = key;
      const record: Record<string, ProjectTaskType[]> = {};
      for (const col of kanbanBoard.columns) record[col.columnId] = col.tasks;
      setLocalColumns(record);
    }
  }, [kanbanBoard]);

  // Local-only columns aren't returned by the kanban API; add any newly-created ones as empty
  // columns without disturbing tasks already placed in existing columns.
  React.useEffect(() => {
    if (localColumnIds.length === 0) return;
    setLocalColumns((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of localColumnIds) {
        if (!(id in next)) {
          next[id] = [];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [localColumnIds]);

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    onAddColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsAddColumnOpen(false);
  };

  const handleDragStart = () => {
    dragStartSnapshotRef.current = localColumns;
    setIsDragging(true);
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    const nextColumns = dragBufferRef.current;
    dragBufferRef.current = null;

    if (!nextColumns) return;

    setLocalColumns(nextColumns);

    const changes = findChangedTasks(dragStartSnapshotRef.current, nextColumns);
    if (changes.length === 0) return;

    // Local-only columns aren't registered project statuses; block persisting those moves
    // instead of sending a status the backend can't resolve.
    const localChanges = changes.filter((change) => localColumnIds.includes(change.status));
    const persistableChanges = changes.filter((change) => !localColumnIds.includes(change.status));

    if (localChanges.length > 0) {
      setLocalColumns((prev) =>
        revertTaskPositions(
          prev,
          dragStartSnapshotRef.current,
          localChanges.map((change) => change.taskId),
        ),
      );
      toast.error(tTasks("kanban.localColumnBlocked"));
    }

    if (persistableChanges.length === 0) return;

    try {
      await Promise.all(
        persistableChanges.map((change) =>
          moveTaskInKanban(projectId, {
            taskId: change.taskId,
            status: change.status,
            displayOrder: change.displayOrder,
          }),
        ),
      );
      await queryClient.invalidateQueries({ queryKey: ["kanban", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } catch (err: unknown) {
      setLocalColumns(dragStartSnapshotRef.current);
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "Failed to save kanban move";
      toast.error(message);
    }
  };
  const handleValueChange = (newCols: Record<string, ProjectTaskType[]>) => {
    if (isDragging) dragBufferRef.current = newCols;
    else setLocalColumns(newCols);
  };

  if (kanbanIsLoading) return <Loading />;

  return (
    <>
      <Kanban.Root
        value={localColumns}
        onValueChange={handleValueChange}
        getItemValue={(item) => item.id}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragEnd}
      >
        <Kanban.Board className="flex w-full gap-4 overflow-x-auto pb-4">
          {Object.entries(localColumns).map(([columnValue, columnTasks]) => (
            <Kanban.Column key={columnValue} value={columnValue} className="w-[300px] min-w-[300px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {projectTaskStatusDotColors[columnValue] && (
                    <span className={cn("size-2 rounded-full", projectTaskStatusDotColors[columnValue])} />
                  )}
                  <span className="text-sm font-semibold">
                    {columnTitles[columnValue]
                      || kanbanBoard?.columns.find(c => c.columnId === columnValue)?.columnTitle
                      || columnValue.toLowerCase().replace(/_/g, " ")}
                  </span>
                  <Badge variant="outline" className="text-xs">{columnTasks.length}</Badge>
                </div>
                <div className="flex">
                  <Kanban.ColumnHandle asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <GripVertical className="size-4" />
                    </Button>
                  </Kanban.ColumnHandle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setColumnToDelete(columnValue)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{tTasks("kanban.deleteColumn")}</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {columnTasks.length > 0 ? (
                <div className="flex flex-col gap-2 p-0.5">
                  {columnTasks.map((task) => (
                    <Kanban.Item key={task.id} value={task.id} asChild>
                      <div>
                        <ProjectTasksKanbanCard
                          task={task}
                          projectType={projectType}
                          projectId={projectId}
                          onClick={() => onTaskClick(task)}
                          onDuplicate={(e) => onDuplicateTask(task, e)}
                        />
                      </div>
                    </Kanban.Item>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 text-center">
                  <p className="text-xs text-muted-foreground">{tTasks("kanban.noTasks")}</p>
                </div>
              )}
            </Kanban.Column>
          ))}

          <div className="w-[300px] min-w-[300px]">
            <Card
              className="flex h-full min-h-[120px] cursor-pointer items-center justify-center border-dashed bg-transparent transition-colors hover:bg-muted/50"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <CardContent className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <PlusCircle className="size-5" />
                <span className="text-sm">{tTasks("kanban.addColumn")}</span>
              </CardContent>
            </Card>
          </div>
        </Kanban.Board>

        <Kanban.Overlay>
          <div className="bg-primary/10 size-full rounded-md" />
        </Kanban.Overlay>
      </Kanban.Root>

      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{tTasks("kanban.addColumn")}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex gap-2">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder={tTasks("kanban.enterColumnName")}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleAddColumn(); }}
            />
            <Button size="icon" disabled={!newColumnTitle.trim()} onClick={handleAddColumn}>
              <Check className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!columnToDelete}
        onOpenChange={(open) => !open && setColumnToDelete(null)}
        title={tTasks("kanban.deleteColumn")}
        description={tTasks("kanban.deleteColumnConfirm")}
        onConfirm={() => {
            if (columnToDelete) {
              // Remove column from local state, moving its tasks to NO_STATUS
              setLocalColumns(prev => {
                const next = { ...prev };
                const displaced = next[columnToDelete] || [];
                delete next[columnToDelete];
                if (displaced.length > 0) {
                  next[NO_STATUS_KEY] = [...(next[NO_STATUS_KEY] || []), ...displaced];
                }
                return next;
              });
              onDeleteColumn(columnToDelete);
              setColumnToDelete(null);
            }
          }}
        onCancel={() => setColumnToDelete(null)}
        confirmLabel={tTasks("kanban.confirm")}
        cancelLabel={tTasks("kanban.cancel")}
      />
    </>
  );
}
