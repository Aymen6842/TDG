import React from "react";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { EnumTaskPriority, FilterTab, TaskType, TaskUpdateType } from "@/modules/tasks/types/tasks";
import { Button } from "@/components/ui/button";
import { Plus, X, Search, SlidersHorizontal, GridIcon, ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { useTodoStore } from "@/modules/tasks/store/tasks";
import StatusTabs from "@/modules/tasks/components/status-tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragCancelEvent,
  DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import usePersonalTasks from "../hooks/tasks/extraction/use-tasks";
import { cn } from "@/lib/utils";
import Loading from "@/components/page-loader";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { priorityDotColors } from "../utils/enum";
import TaskItem from "./task-item";
import useTasksOrdersUpdates from "../hooks/tasks/use-tasks-orders-updates";
import Error500 from "@/components/error/500";

interface TodoListProps {
  activeTab: FilterTab;
  onSelectTask: (id: string) => void;
  onAddTodoClick: () => void;
}

export default function TaskList({ activeTab, onSelectTask, onAddTodoClick }: TodoListProps) {
  const t = useTranslations("modules.tasks");

  const { updateTasksOrders } = useTasksOrdersUpdates({});
  const { tasks, tasksAreLoading, tasksError, statusState, priorityState, sortByState, setDisplayedTasks, searchState } = usePersonalTasks();

  const [search, setSearch] = searchState
  const [status, setStatus] = statusState;
  const [priority, setPriority] = priorityState;
  const [sortBy, setSortBy] = sortByState;


  const [activeId, setActiveId] = React.useState<string | null>(null);

  const {
    viewMode,
    setViewMode,
    setActiveTab
  } = useTodoStore();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleTabChange = (tab: FilterTab) => {
    if (tab === "all") {
      statusState[1](undefined);
    } else {
      statusState[1](tab);
    }

    setActiveTab(tab);

  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks?.findIndex((item) => item.id === active.id);
    const newIndex = tasks?.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(tasks ?? [], oldIndex as number, newIndex as number);
    const orderedTasks = newItems.map((task, idx) => ({
      id: task.id,
      displayOrder: idx + 1
    }));

    updateTasksOrders(orderedTasks as (TaskUpdateType & { id: string })[])
    setDisplayedTasks(newItems)
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    setActiveId(null);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setPriority(undefined);
    handleTabChange("all")
  };

  const renderFilterContent = () => (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.priority")}</h4>
        <div className="flex gap-2 *:grow">
          {Object.values(EnumTaskPriority).map((priorityValue) => (
            <Toggle
              key={priorityValue}
              variant="outline"
              size="sm"
              pressed={priority === priorityValue}
              onPressedChange={() => setPriority(priority === priorityValue ? undefined : priorityValue)}
              className="px-3 text-xs capitalize">
              <span className={cn("size-2 rounded-full", priorityDotColors[priorityValue])}></span>
              {priorityValue}
            </Toggle>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t("filters.sortBy")}</h4>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.selectSortOption")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="statusAsc">{t("filters.statusAscending")}</SelectItem>
              <SelectItem value="statusDesc">{t("filters.statusDescending")}</SelectItem>
              <SelectItem value="priorityAsc">{t("filters.priorityAscending")}</SelectItem>
              <SelectItem value="priorityDesc">{t("filters.priorityDescending")}</SelectItem>
              <SelectItem value="dueDateAsc">{t("filters.dueDateAscending")}</SelectItem>
              <SelectItem value="dueDateDesc">{t("filters.dueDateDescending")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(status || priority || sortBy) && (
          <div className="text-end">
            <Button variant="link" size="sm" className="px-0!" onClick={clearFilters}>
              {t("filters.clearFilters")}
              <X />
            </Button>
          </div>
        )}
      </div>
    </div>
  );


  const renderTodoItems = () => {
    if (viewMode === "grid") {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}>
          <SortableContext items={tasks || []} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks?.filter((task) => !task.parentTaskId).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onClick={() => onSelectTask(task.id)}
                  viewMode="grid"
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <TaskItem
                task={tasks?.find((t) => t.id === activeId) as TaskType}
                viewMode="grid"
                isDraggingOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      );
    }

    // List view with drag and drop
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={tasks || []} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 space-y-4">
            {tasks?.filter((task) => !task.parentTaskId).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={() => onSelectTask(task.id)}
                viewMode="list"
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <TaskItem
              task={tasks?.find((t) => t.id === activeId) as TaskType}
              viewMode="list"
              isDraggingOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  return (
    <>
      {tasksError ? (
        <Error500 />
      ) : (
        <>
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <StatusTabs activeTab={activeTab} onTabChange={handleTabChange} />


            <div className="flex w-full items-center gap-2 lg:w-auto">
              {/* Search input */}
              <div className="relative w-auto">
                <Search className="absolute top-2.5 left-3 size-4 opacity-50" />
                <Input
                  placeholder={t("upload.form.placeholders.search")}
                  className="ps-10"
                  disabled
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="relative">
                    <SlidersHorizontal />
                    {(status || priority) && (
                      <Badge
                        variant="secondary"
                        className="absolute -end-1.5 -top-1.5 size-4 rounded-full p-0">
                        {(status ? 1 : 0) + (priority ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  {renderFilterContent()}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View mode toggle */}
              <ToggleGroup
                type="single"
                variant="outline"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as "list" | "grid")}>
                <ToggleGroupItem value="list" aria-label="List view">
                  <ListIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <GridIcon />
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Add button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={onAddTodoClick}
                      className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14">
                      <Plus className="md:size-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{t("addTask")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {tasksAreLoading ? <Loading /> : tasks?.length === 0 ? (
            <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">{t("upload.form.labels.noTasks")}</h3>
            </div>
          ) : (
            renderTodoItems()
          )}
        </>
      )}
    </>
  );
}
