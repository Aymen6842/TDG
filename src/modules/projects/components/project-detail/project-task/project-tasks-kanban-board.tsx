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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import * as Kanban from "@/components/ui/kanban";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectTaskStatusDotColors } from "../../../utils/badges/project-task-badges";
import ProjectTasksKanbanCard from "./project-tasks-kanban-card";

const NO_STATUS_KEY = "NO_STATUS";

interface Props {
  projectType: string;
  columns: Record<string, ProjectTaskType[]>;
  columnTitles: Record<string, string>;
  onValueChange: (cols: Record<string, ProjectTaskType[]>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onTaskClick: (task: ProjectTaskType) => void;
  onDuplicateTask: (task: ProjectTaskType, e: React.MouseEvent) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddColumn: (title: string) => void;
}

export default function ProjectTasksKanbanBoard({
  projectType,
  columns,
  columnTitles,
  onValueChange,
  onDragStart,
  onDragEnd,
  onTaskClick,
  onDuplicateTask,
  onDeleteColumn,
  onAddColumn,
}: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState("");
  const [columnToDelete, setColumnToDelete] = React.useState<string | null>(null);

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    onAddColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsAddColumnOpen(false);
  };

  return (
    <>
      <Kanban.Root
        value={columns}
        onValueChange={onValueChange}
        getItemValue={(item) => item.id}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragEnd}
      >
        <Kanban.Board className="flex w-full gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([columnValue, columnTasks]) => (
            <Kanban.Column key={columnValue} value={columnValue} className="w-[300px] min-w-[300px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {projectTaskStatusDotColors[columnValue] && (
                    <span className={cn("size-2 rounded-full", projectTaskStatusDotColors[columnValue])} />
                  )}
                  <span className="text-sm font-semibold">
                    {columnTitles[columnValue] || columnValue.toLowerCase().replace(/_/g, " ")}
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

      <AlertDialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tTasks("kanban.deleteColumn")}</AlertDialogTitle>
            <AlertDialogDescription>{tTasks("kanban.deleteColumnConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tTasks("kanban.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (columnToDelete) { onDeleteColumn(columnToDelete); setColumnToDelete(null); } }}
            >
              {tTasks("kanban.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
