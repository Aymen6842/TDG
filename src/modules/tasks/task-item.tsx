"use client";;
import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, FileIcon, Star, BellIcon } from "lucide-react";
import { priorityClasses, statusClasses } from "@/modules/tasks/utils/enum";
import { TaskType } from "@/modules/tasks/types/tasks";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ErrorBanner } from "@/components/error-banner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import useTaskUpload from "./hooks/tasks/use-task-upload";

interface taskItemProps {
  task: TaskType;
  onClick?: () => void;
  viewMode: "list" | "grid";
  onStarToggle?: (id: string, e: React.MouseEvent) => void;
  isDraggingOverlay?: boolean;
}

export function TaskItem({
  task,
  onClick,
  viewMode,
  isDraggingOverlay = false
}: taskItemProps) {
  const t = useTranslations("modules.projects.tasks");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  });

  const { isPending, updateTaskStatuses, error } = useTaskUpload({
    task
  });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? (!isDraggingOverlay ? 0.4 : 0.8) : 1,
    zIndex: isDragging ? 100 : 1
  };

  // Format reminder date for tooltip if it exists
  const reminderDateFormatted = format((task.reminderTime), "MMM d, yyyy - h:mm a")

  if (viewMode === "grid") {
    return (
      <>
        <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
          <Card
            className={cn(
              "flex h-full cursor-pointer flex-col transition-shadow hover:shadow-md",
              task.status === "Completed" ? "opacity-70" : ""
            )}
            onClick={onClick}>
            <CardContent className="flex h-full flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={task.status === "Completed"}
                    onCheckedChange={() =>
                      updateTaskStatuses({
                        status: task.status === "Completed" ? "Pending" : "Completed"
                      })
                    }
                  />

                  < h3
                    className={
                      cn(
                        "text-md flex-1 leading-none font-medium",
                        task.status === "Completed" ? "text-muted-foreground line-through" : ""
                      )}>
                    {task.title}
                  </h3>

                  <Button
                    type="button"
                    variant="ghost"
                    data-no-dnd
                    disabled={isPending}
                    onClick={(e) => {
                      updateTaskStatuses({
                        isFavorite: !task.isFavorite
                      });
                    }}
                    className="p-1 hover:bg-transparent"
                  >
                    <Star
                      className={cn(
                        "size-5 transition-colors",
                        task.isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/50 hover:text-muted-foreground"
                      )}
                    />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>{format((task.dueTime), "MMM d, yyyy")}</span>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs">
                          <BellIcon className="size-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("upload.form.labels.reminderDate")}: {reminderDateFormatted}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* {totalSubTasks > 0 && (
                <div className="text-muted-foreground text-xs">
                  Subtasks: {completedSubTasks}/{totalSubTasks}
                </div>
              )} */}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between border-t">
              <div className="flex items-center gap-2 capitalize">
                <Badge className={statusClasses[task.status]}>{task.status.replace("-", " ")}</Badge>
                <Badge className={priorityClasses[task.priority]}>{task.priority}</Badge>
              </div>

              {(task.attachments?.length || 0) > 0 && (
                <div className="flex items-center gap-1">
                  <FileIcon className="text-muted-foreground size-3" />
                  <span className="text-muted-foreground text-xs">{task.attachments?.length}</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </div >
      </>
    );
  }

  return (
    <>
      <ErrorBanner error={error} />
      <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <Card
          className={cn(
            "cursor-pointer transition-shadow hover:shadow-md",
            task.status === "Completed" ? "opacity-70" : ""
          )}
          onClick={onClick}>
          <CardContent className="flex items-start gap-3">
            <Checkbox
              checked={task.status === "Completed"}
              onCheckedChange={() =>
                updateTaskStatuses({
                  status: task.status === "Completed" ? "Pending" : "Completed"
                })
              }
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex grow flex-col space-y-2">
              <div className="flex flex-col items-start justify-between space-y-1 lg:flex-row lg:space-y-0">
                <div className="flex items-center space-x-2">
                  <h3
                    className={cn(
                      "text-md leading-none font-medium",
                      task.status === "Completed" ? "text-muted-foreground line-through" : ""
                    )}>
                    {task.title}
                  </h3>

                  <Button
                    variant={"ghost"}
                    type="button"
                    data-no-dnd
                    disabled={isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskStatuses({
                        isFavorite: !task.isFavorite
                      });
                    }}
                    className="p-1 hover:bg-transparent"
                  >
                    <Star
                      className={cn(
                        "size-5 transition-colors",
                        task.isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/50 hover:text-muted-foreground"
                      )}
                    />
                  </Button>
                </div>

                <div className="flex flex-col gap-2 capitalize">
                  {/* STATUS + PRIORITY */}
                  <div className="flex items-center gap-2">
                    <Badge className={statusClasses[task.status]}>
                      {task.status.replace("-", " ")}
                    </Badge>

                    <Badge className={priorityClasses[task.priority]}>
                      {task.priority}
                    </Badge>
                  </div>


                </div>

              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>{format((task.dueTime), "MMM d, yyyy - h:mm a")}</span>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-xs">
                        <BellIcon className="size-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("upload.form.labels.reminderDate")}: {format((task.reminderTime), "MMM d, yyyy - h:mm a")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {task.attachments && task.attachments.length > 0 && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <FileIcon className="size-3" />
                    <span>{task.attachments.length}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}

export default TaskItem;
