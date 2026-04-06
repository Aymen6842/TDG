"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { GripVertical, Copy, Milestone, Layers } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import * as Kanban from "@/components/ui/kanban";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectTaskPriorityClasses, projectTaskTypeClasses, epicBadgeClasses } from "../../../utils/badges/project-task-badges";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";

interface Props {
  task: ProjectTaskType;
  projectType: string;
  onClick?: () => void;
  onDuplicate: (e: React.MouseEvent) => void;
}

export default function ProjectTasksKanbanCard({ task, projectType, onClick, onDuplicate }: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const { visibleAttributes } = useProjectTasksStore();

  const isCompleted = task.status === "DONE";
  const priorityKey = task.priority.toLowerCase();
  const typeKey = task.type.toLowerCase();

  return (
    <Card
      className={cn("group cursor-pointer border-0 transition-shadow hover:shadow-md", isCompleted && "opacity-70")}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <CardContent className="flex flex-col gap-2 py-3">
        <div className="flex items-start gap-2">
          <Kanban.ItemHandle asChild>
            <button
              type="button"
              className="mt-0.5 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="size-3.5" />
            </button>
          </Kanban.ItemHandle>
          <Checkbox checked={isCompleted} className="pointer-events-none mt-0.5 shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            {visibleAttributes.key && (
              <span className="text-[10px] font-mono font-bold text-muted-foreground/60 tracking-wider">{task.key}</span>
            )}
            <h4 className={cn("text-sm font-medium leading-tight truncate", isCompleted && "text-muted-foreground line-through")}>
              {task.title}
            </h4>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onDuplicate}
              >
                <Copy className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{tTasks("duplicateTask", { defaultValue: "Duplicate" })}</p></TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {visibleAttributes.type && (
            <Badge variant="outline" className={cn("text-[10px] h-5", projectTaskTypeClasses[task.type.toUpperCase()])}>
              {tTasks(`types.${typeKey}`, { defaultValue: task.type })}
            </Badge>
          )}
          {visibleAttributes.priority && (
            <Badge className={cn(projectTaskPriorityClasses[task.priority.toUpperCase()], "text-[10px] h-5")}>
              {tTasks(`priorityLabels.${priorityKey}`, { defaultValue: task.priority })}
            </Badge>
          )}
          {projectType === "AGILE" && visibleAttributes.points && task.storyPoints !== undefined && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
              {task.storyPoints} {tTasks("points")}
            </Badge>
          )}
          {visibleAttributes.milestone && task.milestoneId && (
            <Badge variant="outline" className="text-[10px] h-5 gap-1 border-muted text-muted-foreground">
              <Milestone className="size-2.5" />
              {task.milestoneId}
            </Badge>
          )}
          {visibleAttributes.epic && task.epicId && (
            <Badge variant="outline" className={cn("text-[10px] h-5 gap-1", epicBadgeClasses)}>
              <Layers className="size-2.5" />
              {task.epicId}
            </Badge>
          )}
        </div>
      </CardContent>

      {visibleAttributes.assignee && task.assigneeId && (
        <CardFooter className="flex items-center justify-between border-t py-2 px-3">
          <div className="flex items-center gap-1.5">
            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[8px] font-bold" title={`Assigned to ${task.assigneeId}`}>
              {task.assigneeId.split('-').slice(-1)[0].substring(0, 2).toUpperCase()}
            </div>
            <span className="text-[10px] text-muted-foreground">{task.assigneeId.split('-').slice(-1)[0]}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
