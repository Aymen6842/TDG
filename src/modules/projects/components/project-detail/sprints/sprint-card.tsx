"use client";
import { format } from "date-fns";
import { Calendar, BellIcon, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SprintType } from "@/modules/projects/types/project-sprints";
import { sprintStatusClasses } from "@/modules/projects/utils/badges/sprint-badges";

interface Props {
  sprint: SprintType;
  viewMode?: "grid" | "list";
  onEdit: (sprint: SprintType) => void;
  onDelete: (sprint: SprintType) => void;
}

export default function SprintCard({ sprint, viewMode = "grid", onEdit, onDelete }: Props) {
  const t = useTranslations("modules.projects.sprints");
  const statusClasses = sprintStatusClasses[sprint.status] || sprintStatusClasses["Pending"];
  const startText = format(sprint.startDate, "MMM d, yyyy");
  const endText = format(sprint.endDate, "MMM d, yyyy");
  const statusLabel = t(`status.${sprint.status.toLowerCase()}`);

  const actionButtons = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon" variant="secondary"
            className="h-8 w-8 bg-background/95 shadow-sm border"
            onClick={(e) => { e.stopPropagation(); onEdit(sprint); }}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{t("tooltips.edit")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon" variant="secondary"
            className="h-8 w-8 bg-background/95 shadow-sm border hover:bg-destructive hover:text-white"
            onClick={(e) => { e.stopPropagation(); onDelete(sprint); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{t("tooltips.delete")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (viewMode === "grid") {
    return (
      <Card className="group relative transition-shadow hover:shadow-md flex flex-col h-full">
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-1 opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 z-10">
          {actionButtons}
        </div>

        <CardContent className="flex flex-col gap-2 pt-4 flex-1">
          <div className="flex items-start gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <h3 className="text-sm font-semibold leading-tight">{sprint.name}</h3>
              {sprint.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{sprint.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <span>{startText}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-default">
                    <BellIcon className="size-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("card.endDate")}: {endText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-3 pb-3">
          <Badge className={cn("text-xs", statusClasses)}>{statusLabel}</Badge>
        </CardFooter>
      </Card>
    );
  }

  // List view — mirrors project.tsx list layout
  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 z-10">
        {actionButtons}
      </div>

      <CardContent className="flex items-start gap-3">
        <div className="flex grow flex-col space-y-2">
          <div className="flex flex-col items-start justify-between space-y-1 lg:flex-row lg:space-y-0">
            <h3 className="text-sm font-medium leading-none">{sprint.name}</h3>
            <Badge className={cn("text-xs shrink-0", statusClasses)}>{statusLabel}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <span>{startText}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-default">
                    <BellIcon className="size-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("card.endDate")}: {endText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {sprint.description && (
              <span className="text-xs text-muted-foreground truncate max-w-xs">{sprint.description}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
