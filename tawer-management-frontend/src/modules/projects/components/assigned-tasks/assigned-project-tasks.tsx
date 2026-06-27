"use client";
import React from "react";
import { Search, SlidersHorizontal, GridIcon, ListIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { cn } from "@/lib/utils";

import useAssignedProjectTasks from "../../hooks/tasks/use-assigned-project-tasks";
import ProjectTaskItem from "../project-detail/project-task/project-task-item";
import ProjectTaskDetailSheet from "../project-detail/project-task/project-task-details-sheet";
import ProjectTaskUploadSheet from "../project-detail/project-task/project-task-upload";
import { ProjectTaskType, EnumProjectTaskStatus, EnumProjectTaskPriority, EnumProjectTaskType } from "../../types/project-tasks";
import { projectTaskStatusDotColors, projectTaskPriorityDotColors } from "../../utils/badges/project-task-badges";

type ViewMode = "list" | "grid";

export default function AssignedProjectTasks() {
  const t = useTranslations("modules.projects.tasks");

  const { tasks, tasksAreLoading, tasksError, searchState, statusState, priorityState, typeState } = useAssignedProjectTasks();
  const [search, setSearch] = searchState;
  const [status, setStatus] = statusState;
  const [priority, setPriority] = priorityState;
  const [type, setType] = typeState;

  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [selectedTask, setSelectedTask] = React.useState<ProjectTaskType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleSelectTask = (task: ProjectTaskType) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTask(null);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setPriority(undefined);
    setType(undefined);
  };

  const activeFilterCount = (status ? 1 : 0) + (priority ? 1 : 0) + (type ? 1 : 0);

  const filterContent = (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.status")}</h4>
        <div className="flex flex-wrap gap-2">
          {Object.values(EnumProjectTaskStatus).map((s) => (
            <Toggle key={s} variant="outline" size="sm" pressed={status === s}
              onPressedChange={() => setStatus(status === s ? undefined : s)}
              className="px-3 text-xs">
              <span className={cn("size-2 rounded-full", projectTaskStatusDotColors[s])} />
              {t(`statusLabels.${s.toLowerCase()}`)}
            </Toggle>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.priority")}</h4>
        <div className="flex flex-wrap gap-2">
          {Object.values(EnumProjectTaskPriority).map((p) => (
            <Toggle key={p} variant="outline" size="sm" pressed={priority === p}
              onPressedChange={() => setPriority(priority === p ? undefined : p)}
              className="px-3 text-xs capitalize">
              <span className={cn("size-2 rounded-full", projectTaskPriorityDotColors[p])} />
              {t(`priorityLabels.${p.toLowerCase()}`)}
            </Toggle>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.type")}</h4>
        <div className="flex flex-wrap gap-2">
          {Object.values(EnumProjectTaskType).map((tp) => (
            <Toggle key={tp} variant="outline" size="sm" pressed={type === tp}
              onPressedChange={() => setType(type === tp ? undefined : tp)}
              className="px-3 text-xs capitalize">
              {t(`types.${tp.toLowerCase()}`)}
            </Toggle>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="text-end">
          <Button variant="link" size="sm" className="px-0!" onClick={clearFilters}>
            {t("filters.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
      </header>
      {/* Toolbar */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex w-full items-center gap-2 lg:w-auto lg:ml-auto">
          <div className="relative w-auto">
            <Search className="absolute top-2.5 left-3 size-4 opacity-50" />
            <Input
              placeholder={t("upload.form.placeholders.search")}
              className="ps-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="relative">
                <SlidersHorizontal />
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="absolute -end-1.5 -top-1.5 size-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              {filterContent}
            </DropdownMenuContent>
          </DropdownMenu>

          <ToggleGroup type="single" variant="outline" value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}>
            <ToggleGroupItem value="list" aria-label="List view"><ListIcon /></ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view"><GridIcon /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Content */}
      {tasksError ? (
        <Error500 />
      ) : tasksAreLoading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <div className="flex h-[calc(100vh-16rem)] flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-medium">{t("upload.form.labels.noTasks")}</h3>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <ProjectTaskItem key={task.id} task={task} projectType="AGILE" projectId={task.projectId} viewMode="grid" onClick={() => handleSelectTask(task)} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <ProjectTaskItem key={task.id} task={task} projectType="AGILE" projectId={task.projectId} viewMode="list" onClick={() => handleSelectTask(task)} />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <ProjectTaskDetailSheet
        projectId={selectedTask?.projectId ?? ""}
        isOpen={isDetailOpen && !isEditOpen}
        onClose={handleCloseDetail}
        task={selectedTask}
        isAgile={true}
        onEditClick={() => setIsEditOpen(true)}
      />

      {/* Edit sheet */}
      {selectedTask && (
        <ProjectTaskUploadSheet
          project={{ id: selectedTask.projectId } as any}
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setIsDetailOpen(false); setSelectedTask(null); }}
          task={selectedTask}
          isAgile={true}
        />
      )}
    </div>
  );
}
