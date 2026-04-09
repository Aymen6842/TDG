"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, Settings2, ListIcon, SquareKanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { EnumProjectTaskPriority, EnumProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectTaskPriorityDotColors, projectTaskTypeDotColors } from "../../../utils/badges/project-task-badges";
import { ProjectType } from "../../../types/projects";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import { FilterPanel } from "../../shared/filter-panel";
import { FilterSection } from "../../shared/filter-section";
import { DotBadgeToggle } from "../../shared/dot-badge-option";

interface Props {
  project: ProjectType;
  search: string;
  setSearch: (v: string) => void;
  status: string | undefined;
  setStatus: (v: string | undefined) => void;
  priority: string | undefined;
  setPriority: (v: string | undefined) => void;
  type: string | undefined;
  setType: (v: string | undefined) => void;
  assigneeId: string | undefined;
  setAssigneeId: (v: string | undefined) => void;
  milestoneId: string | undefined;
  setMilestoneId: (v: string | undefined) => void;
  epicId: string | undefined;
  setEpicId: (v: string | undefined) => void;
}

export default function ProjectTasksToolbar({
  project,
  search, setSearch,
  status, setStatus,
  priority, setPriority,
  type, setType,
  assigneeId, setAssigneeId,
  milestoneId, setMilestoneId,
  epicId, setEpicId,
}: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const { viewMode, setViewMode, visibleAttributes, toggleAttribute } = useProjectTasksStore();

  const hasActiveFilters = !!(priority || type || assigneeId || milestoneId || epicId);

  const filterContent = (
    <FilterPanel
      hasActiveFilters={hasActiveFilters}
      onClear={() => { setPriority(undefined); setType(undefined); setAssigneeId(undefined); setMilestoneId(undefined); setEpicId(undefined); }}
    >
      <FilterSection label={tTasks("filters.type", { defaultValue: "Type" })}>
        <div className="flex flex-wrap gap-2">
          {Object.values(EnumProjectTaskType).map((t) => (
            <DotBadgeToggle
              key={t}
              value={t}
              dotColorClass={projectTaskTypeDotColors[t.toUpperCase()]}
              label={tTasks(`types.${t.toLowerCase()}`, { defaultValue: t })}
              pressed={type === t}
              onPressedChange={() => setType(type === t ? undefined : t)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection label={tTasks("filters.priority", { defaultValue: "Priority" })}>
        <div className="flex flex-wrap gap-2">
          {Object.values(EnumProjectTaskPriority).map((p) => (
            <DotBadgeToggle
              key={p}
              value={p}
              dotColorClass={projectTaskPriorityDotColors[p.toUpperCase()]}
              label={tTasks(`priorityLabels.${p.toLowerCase()}`, { defaultValue: p })}
              pressed={priority === p}
              onPressedChange={() => setPriority(priority === p ? undefined : p)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection label={tTasks("filters.manager", { defaultValue: "Manager" })}>
        <Select value={assigneeId || "all"} onValueChange={(v) => setAssigneeId(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full"><SelectValue placeholder={tTasks("filters.all", { defaultValue: "All" })} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tTasks("filters.all", { defaultValue: "All" })}</SelectItem>
            {project.members?.map((member) => (
              <SelectItem key={member.id} value={member.userId}>User {member.userId.split('-').slice(-1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection label={tTasks("filters.milestones", { defaultValue: "Milestones" })}>
        <Select value={milestoneId || "all"} onValueChange={(v) => setMilestoneId(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full"><SelectValue placeholder={tTasks("filters.all", { defaultValue: "All" })} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tTasks("filters.all", { defaultValue: "All" })}</SelectItem>
            {(project as any).milestones?.map((m: any) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      {project.projectType === "AGILE" && (project as any).epics && (
        <FilterSection label={tTasks("filters.epics", { defaultValue: "Epics" })}>
          <Select value={epicId || "all"} onValueChange={(v) => setEpicId(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-full"><SelectValue placeholder={tTasks("filters.all", { defaultValue: "All" })} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tTasks("filters.all", { defaultValue: "All" })}</SelectItem>
              {(project as any).epics?.map((e: any) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>
      )}
    </FilterPanel>
  );

  return (
    <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      <Tabs defaultValue={status || "all"} onValueChange={(val) => setStatus(val === "all" ? undefined : val)} value={status || "all"}>
        <TabsList>
          <TabsTrigger value="all">{tTasks("upload.form.labels.allTasks")}</TabsTrigger>
          {(project.projectType === "AGILE"
            ? ["BACKLOG", "TODO", "IN_PROGRESS", "TESTING", "IN_REVIEW", "DONE"]
            : ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]).map(s => (
              <TabsTrigger key={s} value={s} className="capitalize">
                {s.toLowerCase().replace("_", " ")}
              </TabsTrigger>
            ))}
        </TabsList>
      </Tabs>

      <div className="flex w-full items-center gap-2 lg:w-auto">
        <div className="relative w-auto">
          <Search className="absolute top-2.5 left-3 size-4 opacity-50" />
          <Input
            placeholder={tTasks("upload.form.placeholders.search")}
            className="ps-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="relative">
              <SlidersHorizontal className="size-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">!</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel>{tTasks("filters.title", { defaultValue: "Filters" })}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterContent}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline"><Settings2 className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>{tTasks("displaySettings.title", { defaultValue: "Display Settings" })}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {tTasks("displaySettings.showAttributes", { defaultValue: "Show Attributes" })}
            </DropdownMenuLabel>
            {Object.entries(visibleAttributes).map(([key, value]) => {
              if ((key === "epic" || key === "points") && project.projectType !== "AGILE") return null;
              return (
                <DropdownMenuCheckboxItem key={key} checked={value as boolean} onCheckedChange={() => toggleAttribute(key as any)}>
                  {tTasks(`displaySettings.attributes.${key}`, { defaultValue: key })}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup type="single" variant="outline" value={viewMode} onValueChange={(value) => value && setViewMode(value as "list" | "grid")}>
          <ToggleGroupItem value="list" aria-label="List view"><ListIcon /></ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Kanban view"><SquareKanban /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
