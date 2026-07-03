"use client";
import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import useProjectTasks from "@/modules/projects/hooks/tasks/use-project-tasks";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import useMilestones from "@/modules/projects/hooks/milestones/use-milestones";
import { ReminderEntityType } from "@/modules/reminders/types/reminders";

interface Option {
  id: string;
  label: string;
}

interface Props {
  projectId: string;
  entityType: ReminderEntityType;
  value?: string | null;
  onChange: (id: string | undefined) => void;
  disabled?: boolean;
}

function useEntityOptions(projectId: string, entityType: ReminderEntityType) {
  const taskProjectId = entityType === "TASK" ? projectId : "";
  const sprintProjectId = entityType === "SPRINT" ? projectId : "";
  const milestoneProjectId = entityType === "MILESTONE" ? projectId : "";

  const { tasks, tasksAreLoading, searchState: [taskSearch, setTaskSearch] } = useProjectTasks(taskProjectId);
  const { sprints, sprintsAreLoading, searchState: [sprintSearch, setSprintSearch] } = useProjectSprints(sprintProjectId);
  const { milestones, milestonesAreLoading } = useMilestones(milestoneProjectId);
  const [milestoneSearch, setMilestoneSearch] = React.useState("");

  if (entityType === "TASK") {
    return {
      options: tasks.map((t): Option => ({ id: t.id, label: t.title })),
      isLoading: tasksAreLoading,
      search: taskSearch,
      setSearch: setTaskSearch,
    };
  }
  if (entityType === "SPRINT") {
    return {
      options: sprints.map((s): Option => ({ id: s.id, label: s.name })),
      isLoading: sprintsAreLoading,
      search: sprintSearch,
      setSearch: setSprintSearch,
    };
  }
  if (entityType === "MILESTONE") {
    const filtered = milestoneSearch
      ? milestones.filter((m) => m.name.toLowerCase().includes(milestoneSearch.toLowerCase()))
      : milestones;
    return {
      options: filtered.map((m): Option => ({ id: m.id, label: m.name })),
      isLoading: milestonesAreLoading,
      search: milestoneSearch,
      setSearch: setMilestoneSearch,
    };
  }
  return { options: [] as Option[], isLoading: false, search: "", setSearch: () => {} };
}

export default function ReminderEntityPicker({ projectId, entityType, value, onChange, disabled }: Props) {
  const [open, setOpen] = React.useState(false);
  const { options, isLoading, search, setSearch } = useEntityOptions(projectId, entityType);

  if (entityType === "CUSTOM" || entityType === "PROJECT") return null;

  const selected = options.find((o) => o.id === value);
  const entityLabel = entityType.charAt(0) + entityType.slice(1).toLowerCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}
        >
          <span className="truncate">{selected ? selected.label : `Select ${entityLabel.toLowerCase()}...`}</span>
          <ChevronsUpDown className="size-4 opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${entityLabel.toLowerCase()}s...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading..." : "No results"}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt.id} value={opt.id} onSelect={() => { onChange(opt.id); setOpen(false); }}>
                  <Check className={cn("mr-2 size-4", value === opt.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
