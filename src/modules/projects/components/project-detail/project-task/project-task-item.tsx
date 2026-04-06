"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  projectTaskStatusClasses,
  projectTaskPriorityClasses,
  projectTaskTypeClasses,
  epicBadgeClasses
} from "@/modules/projects/utils/badges/project-task-badges";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Star, User, Flag, Milestone, Layers, Copy } from "lucide-react";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  task: ProjectTaskType;
  onClick?: () => void;
  onDuplicate?: (e: React.MouseEvent) => void;
  viewMode: "list" | "grid";
  projectType: string;
  isDraggingOverlay?: boolean;
}

export default function ProjectTaskItem({
  task,
  onClick,
  onDuplicate,
  viewMode,
  projectType,
  isDraggingOverlay = false
}: Props) {
  const t = useTranslations("modules.projects.tasks");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? (!isDraggingOverlay ? 0.4 : 0.8) : 1,
    zIndex: isDragging ? 100 : 1
  };

  const statusKey = task.status.toLowerCase();
  const priorityKey = task.priority.toLowerCase();
  const typeKey = task.type.toLowerCase();

  const isAgile = projectType === "AGILE";
  const isCompleted = task.status === "DONE";
  const { visibleAttributes } = useProjectTasksStore();

  // Helper to find related data in mock (since we don't have a real join here)
  // In a real app, these would come pre-joined from the API
  const milestoneName = (task as any).milestoneId; // Placeholder or actual name if available
  const epicName = (task as any).epicId; // Placeholder or actual name if available

  if (viewMode === "grid") {
    return (
      <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <Card
          className={cn(
            "group flex h-full cursor-pointer flex-col transition-shadow hover:shadow-md",
            isCompleted ? "opacity-70" : ""
          )}
          onClick={onClick}>
          <CardContent className="flex h-full flex-col justify-between py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={isCompleted}
                  className="pointer-events-none mt-1"
                />

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start w-full">
                    {visibleAttributes.key && (
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/60 tracking-wider">
                        {task.key}
                      </span>
                    )}
                    {onDuplicate && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity -mt-1"
                              onClick={(e) => { e.stopPropagation(); onDuplicate(e); }}
                            >
                              <Copy className="size-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{t("duplicateTask", { defaultValue: "Duplicate" })}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <h3
                    className={cn(
                      "text-md flex-1 leading-none font-medium mt-1",
                      isCompleted ? "text-muted-foreground line-through" : ""
                    )}>
                    {task.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pl-7">
                {visibleAttributes.type && (
                  <Badge variant="outline" className={cn("text-[10px] h-5", projectTaskTypeClasses[task.type.toUpperCase()])}>
                    {t(`types.${typeKey}`)}
                  </Badge>
                )}
                {isAgile && visibleAttributes.points && task.storyPoints !== undefined && (
                  <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20 trackin-tight">
                    {task.storyPoints} {t("points")}
                  </Badge>
                )}
                {isAgile && visibleAttributes.epic && task.epicId && (
                  <Badge variant="outline" className={cn("text-[10px] h-5 gap-1", epicBadgeClasses)}>
                    <Layers className="size-2.5" />
                    {task.epicId}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 border-t py-3">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                {visibleAttributes.status && (
                  <Badge className={cn(projectTaskStatusClasses[task.status.toUpperCase()], "text-[10px]")}>
                    {t(`statusLabels.${statusKey}`)}
                  </Badge>
                )}
                {visibleAttributes.priority && (
                  <Badge className={cn(projectTaskPriorityClasses[task.priority.toUpperCase()], "text-[10px]")}>
                    {t(`priorityLabels.${priorityKey}`)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {visibleAttributes.assignee && task.assigneeId && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[8px] font-bold" title={`Assigned to ${task.assigneeId}`}>
                    {task.assigneeId.split('-').slice(-1)[0].substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {visibleAttributes.milestone && task.milestoneId && (
              <div className="flex w-full items-center gap-1 text-muted-foreground">
                <Milestone className="size-3" />
                <span className="text-[10px] truncate">{task.milestoneId}</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <Card
        className={cn(
          "group cursor-pointer transition-shadow hover:shadow-md",
          isCompleted ? "opacity-70" : ""
        )}
        onClick={onClick}>
        <CardContent className="flex items-start gap-3 py-4">
          <Checkbox
            checked={isCompleted}
            className="pointer-events-none mt-1"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="flex grow flex-col space-y-2">
            <div className="flex flex-col items-start justify-between space-y-1 lg:flex-row lg:space-y-0">
              <div className="flex items-center space-x-2 overflow-hidden">
                {visibleAttributes.key && (
                  <span className="text-[10px] font-mono font-bold text-muted-foreground/60 tracking-wider w-14 shrink-0">
                    {task.key}
                  </span>
                )}
                <h3
                  className={cn(
                    "text-md leading-none font-medium flex-1 truncate",
                    isCompleted ? "text-muted-foreground line-through" : ""
                  )}>
                  {task.title}
                </h3>
              </div>

              <div className="flex flex-col gap-2 capitalize shrink-0 ml-auto">
                <div className="flex items-center gap-2">
                  {visibleAttributes.milestone && task.milestoneId && (
                    <Badge variant="outline" className="text-[10px] h-5 hidden lg:flex gap-1 border-muted text-muted-foreground">
                      <Milestone className="size-2.5" />
                      {task.milestoneId}
                    </Badge>
                  )}
                  {visibleAttributes.epic && task.epicId && (
                    <Badge variant="outline" className={cn("text-[10px] h-5 hidden md:flex gap-1", epicBadgeClasses)}>
                      <Layers className="size-2.5" />
                      {task.epicId}
                    </Badge>
                  )}
                  {visibleAttributes.type && (
                    <Badge variant="outline" className={cn("text-[10px] h-5 hidden sm:flex", projectTaskTypeClasses[task.type.toUpperCase()])}>
                      {t(`types.${typeKey}`)}
                    </Badge>
                  )}
                  {isAgile && visibleAttributes.points && task.storyPoints !== undefined && (
                    <Badge variant="secondary" className="text-[10px] h-5 hidden md:flex bg-primary/10 text-primary border-primary/20">
                      {task.storyPoints} {t("points")}
                    </Badge>
                  )}
                  {visibleAttributes.status && (
                    <Badge className={cn(projectTaskStatusClasses[task.status.toUpperCase()], "text-[10px] h-5")}>
                      {t(`statusLabels.${statusKey}`)}
                    </Badge>
                  )}
                  {visibleAttributes.priority && (
                    <Badge className={cn(projectTaskPriorityClasses[task.priority.toUpperCase()], "text-[10px] h-5")}>
                      {t(`priorityLabels.${priorityKey}`)}
                    </Badge>
                  )}
                  {visibleAttributes.assignee && task.assigneeId && (
                    <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[8px] font-bold shrink-0 ml-1" title={`Assigned to ${task.assigneeId}`}>
                      {task.assigneeId.split('-').slice(-1)[0].substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {onDuplicate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); onDuplicate(e); }}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{t("duplicateTask", { defaultValue: "Duplicate" })}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
