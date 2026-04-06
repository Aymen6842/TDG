"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Calendar, FileIcon, BellIcon, Edit3, Eye, Trash2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ProjectType } from "../types/projects";
import { projectStatusClasses, projectTypeClasses, businessUnitClasses, businessUnitNamed, businessUnitFallbackClasses } from "../utils/badges/project-badges";

interface Props {
  project: ProjectType;
  viewMode?: "grid" | "list";
  isDraggingOverlay?: boolean;
  onEdit?: (project: ProjectType) => void;
  onDelete?: (project: ProjectType) => void;
  onView?: (project: ProjectType) => void;
  onArchive?: (project: ProjectType) => void;
}

export default function ProjectContainer({ project, viewMode = "grid", isDraggingOverlay = false, onEdit, onDelete, onView, onArchive }: Props) {
  const t = useTranslations("modules.projects.project");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? (!isDraggingOverlay ? 0.4 : 0.8) : 1,
    zIndex: isDragging ? 100 : 1
  };

  const isCompleted = project.status === "Completed";

  const statusColors = projectStatusClasses[project.status] || projectStatusClasses["Pending"];
  const typeColors = projectTypeClasses[project.projectType] || projectTypeClasses["AGILE"];
  const buColors = project.businessUnit ? businessUnitClasses[project.businessUnit] || businessUnitFallbackClasses : "";
  const buLabel = project.businessUnit ? businessUnitNamed[project.businessUnit] || project.businessUnit : "";

  const startDateText = project.startTime ? format(new Date(project.startTime), "MMM d, yyyy") : "";
  const endDateFormatted = project.endTime ? format(new Date(project.endTime), "MMM d, yyyy - h:mm a") : "";
  const endDateText = t("details.endDate", { date: endDateFormatted });
  const statusLabel = project.status === "Running" ? t("status.running")
    : project.status === "Completed" ? t("status.completed")
      : t("status.pending");
  const typeLabel = project.projectType === "AGILE" ? t("projectType.agile")
    : project.projectType === "FREESTYLE" ? t("projectType.freestyle")
      : project.projectType || "AGILE";

  if (viewMode === "grid") {
    return (
      <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <Card
          className={cn(
            "flex h-full cursor-pointer flex-col group relative transition-shadow hover:shadow-md",
            isCompleted ? "opacity-70" : ""
          )}>
          {/* HOVER ACTIONS - CENTERED RIGHT */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-1 opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-background/95 shadow-sm border"
                    data-no-dnd
                    asChild
                  >
                    <Link href={`/dashboard/projects/${project.slug}`} onClick={(e) => e.stopPropagation()}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t("tooltips.view", { defaultValue: "View Details" })}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-background/95 shadow-sm border"
                    data-no-dnd
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(project);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t("tooltips.edit", { defaultValue: "Edit Project" })}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-background/95 shadow-sm border"
                    data-no-dnd
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive?.(project);
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t("tooltips.archive", { defaultValue: "Archive Project" })}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 hover:bg-destructive hover:text-white bg-background/95 shadow-sm border"
                    data-no-dnd
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(project);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t("tooltips.delete", { defaultValue: "Delete Project" })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <CardContent className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={isCompleted}
                />

                <h3
                  className={cn(
                    "text-md flex-1 leading-none font-medium",
                    isCompleted ? "text-muted-foreground line-through" : ""
                  )}>
                  {project.name}
                </h3>

                <Button
                  type="button"
                  variant="ghost"
                  data-no-dnd
                  className="p-1 hover:bg-transparent"
                >

                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>{startDateText}</span>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-xs">
                        <BellIcon className="size-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{endDateText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between border-t relative">


            <div className="flex items-center gap-2 capitalize">
              <Badge className={statusColors}>{statusLabel}</Badge>
              <Badge className={cn("px-2 py-0.5", typeColors)}>{typeLabel}</Badge>
              {project.businessUnit && (
                <Badge className={cn("px-2 py-0.5", buColors)}>{buLabel}</Badge>
              )}
            </div>

            {(project.members?.length || 0) > 0 && (
              <div className="flex items-center gap-1">
                <FileIcon className="text-muted-foreground size-3" />
                <span className="text-muted-foreground text-xs">{(project.members?.length || 0) > 1 ? t("details.members", { count: project.members?.length ?? 0 }) : t("details.member", { count: project.members?.length ?? 0 })}</span>
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
          "cursor-pointer transition-shadow hover:shadow-md group relative",
          isCompleted ? "opacity-70" : ""
        )}>
        {/* HOVER ACTIONS - BOTTOM RIGHT */}
        <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/95 shadow-sm border"
                  data-no-dnd
                  asChild
                >
                  <Link href={`/dashboard/projects/${project.slug}`} onClick={(e) => e.stopPropagation()}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t("tooltips.view", { defaultValue: "View Details" })}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/95 shadow-sm border"
                  data-no-dnd
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(project);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t("tooltips.edit", { defaultValue: "Edit Project" })}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/95 shadow-sm border"
                  data-no-dnd
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive?.(project);
                  }}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t("tooltips.archive", { defaultValue: "Archive Project" })}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 hover:bg-destructive hover:text-white bg-background/95 shadow-sm border"
                  data-no-dnd
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(project);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t("tooltips.delete", { defaultValue: "Delete Project" })}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>



        <CardContent className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="flex grow flex-col space-y-2">
            <div className="flex flex-col items-start justify-between space-y-1 lg:flex-row lg:space-y-0">
              <div className="flex items-center space-x-2">
                <h3
                  className={cn(
                    "text-md leading-none font-medium",
                    isCompleted ? "text-muted-foreground line-through" : ""
                  )}>
                  {project.name}
                </h3>

                <Button
                  variant={"ghost"}
                  type="button"
                  data-no-dnd
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-transparent"
                >

                </Button>
              </div>

              <div className="flex flex-col gap-2 capitalize">
                {/* STATUS + TYPE + BU */}
                <div className="flex items-center gap-2">
                  <Badge className={statusColors}>
                    {statusLabel}
                  </Badge>

                  <Badge className={cn("px-2 py-0.5", typeColors)}>
                    {typeLabel}
                  </Badge>

                  {project.businessUnit && (
                    <Badge className={cn("px-2 py-0.5", buColors)}>
                      {buLabel}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{startDateText}</span>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs">
                      <BellIcon className="size-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{endDateText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <FileIcon className="size-3" />
                <span>{(project.members?.length || 0) > 1 ? t("details.members", { count: project.members?.length ?? 0 }) : t("details.member", { count: project.members?.length ?? 0 })}</span>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
