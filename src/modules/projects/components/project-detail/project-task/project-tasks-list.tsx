"use client";
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragStartEvent, type DragEndEvent, DragOverlay
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { ProjectType } from "../../../types/projects";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import useProjectTasks from "../../../hooks/tasks/use-project-tasks";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import ProjectTaskItem from "./project-task-item";
import ProjectTaskUploadSheet from "./project-task-upload";
import ProjectTaskDetailSheet from "./project-task-details-sheet";
import ProjectTasksToolbar from "./project-tasks-toolbar";
import ProjectTasksKanbanBoard from "./project-tasks-kanban-board";

const NO_STATUS_KEY = "NO_STATUS";

interface Props {
  project: ProjectType;
}

export default function ProjectTasksList({ project }: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const { viewMode } = useProjectTasksStore();

  const {
    tasks, tasksAreLoading, tasksError,
    searchState, statusState, priorityState, typeState,
    assigneeState, milestoneState, epicState, setDisplayedTasks
  } = useProjectTasks(project.id);

  const [search, setSearch] = searchState;
  const [status, setStatus] = statusState;
  const [priority, setPriority] = priorityState;
  const [type, setType] = typeState;
  const [assigneeId, setAssigneeId] = assigneeState;
  const [milestoneId, setMilestoneId] = milestoneState;
  const [epicId, setEpicId] = epicState;

  const [isAddSheetOpen, setIsAddSheetOpen] = React.useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = React.useState(false);
  const [listActiveId, setListActiveId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<ProjectTaskType | null>(null);
  const [duplicateTemplate, setDuplicateTemplate] = React.useState<Partial<ProjectTaskType> | null>(null);

  // --- Kanban columns ---
  const defaultStatuses = React.useMemo(() => (
    project.projectType === "AGILE"
      ? ["BACKLOG", "TODO", "IN_PROGRESS", "TESTING", "IN_REVIEW", "DONE"]
      : ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]
  ), [project.projectType]);

  const defaultColumnTitles = React.useMemo<Record<string, string>>(() => ({
    BACKLOG: "Backlog", TODO: "To Do", IN_PROGRESS: "In Progress",
    TESTING: "Testing", IN_REVIEW: "In Review", DONE: "Done",
    [NO_STATUS_KEY]: tTasks("kanban.noStatus", { defaultValue: "No Status" })
  }), [tTasks]);

  const [customColumns, setCustomColumns] = React.useState<string[]>([]);
  const [columnTitles, setColumnTitles] = React.useState<Record<string, string>>(defaultColumnTitles);

  const kanbanColumns = React.useMemo(() => {
    const allKeys = [...defaultStatuses, ...customColumns];
    const columns: Record<string, ProjectTaskType[]> = {};
    for (const key of allKeys) columns[key] = [];
    for (const task of tasks) {
      const s = task.status?.toUpperCase() || NO_STATUS_KEY;
      if (columns[s]) columns[s].push(task);
      else if (columns[NO_STATUS_KEY]) columns[NO_STATUS_KEY].push(task);
      else columns[NO_STATUS_KEY] = [task];
    }
    if (columns[NO_STATUS_KEY]?.length === 0 && !allKeys.includes(NO_STATUS_KEY)) {
      delete columns[NO_STATUS_KEY];
    }
    return columns;
  }, [tasks, defaultStatuses, customColumns]);

  const kanbanInteractedRef = React.useRef(false);
  const [localKanbanColumns, setLocalKanbanColumns] = React.useState<Record<string, ProjectTaskType[]>>({});
  const dragBufferRef = React.useRef<Record<string, ProjectTaskType[]> | null>(null);
  const isDraggingKanbanRef = React.useRef(false);

  const prevTaskIdsRef = React.useRef<string>("");
  React.useEffect(() => {
    const taskIds = tasks.map(t => t.id).sort().join(",");
    if (taskIds !== prevTaskIdsRef.current) {
      prevTaskIdsRef.current = taskIds;
      kanbanInteractedRef.current = false;
      setLocalKanbanColumns(kanbanColumns);
    }
  }, [tasks, kanbanColumns]);

  const activeKanbanColumns = kanbanInteractedRef.current ? localKanbanColumns : kanbanColumns;

  // --- Handlers ---
  const handleOpenDetailSheet = (task: ProjectTaskType) => {
    setSelectedTask(task);
    setIsDetailSheetOpen(true);
  };

  const handleOpenUploadSheet = (task?: ProjectTaskType) => {
    setSelectedTask(task || null);
    setDuplicateTemplate(null);
    setIsDetailSheetOpen(false);
    setIsAddSheetOpen(true);
  };

  const handleDuplicateTask = (task: ProjectTaskType, e: React.MouseEvent) => {
    e.stopPropagation();
    setDuplicateTemplate({
      title: task.title, description: task.description,
      type: task.type, status: task.status, priority: task.priority,
      storyPoints: task.storyPoints, dueDate: new Date().toISOString(),
      assigneeId: task.assigneeId, milestoneId: task.milestoneId,
      epicId: task.epicId, sprintId: task.sprintId,
    });
    setSelectedTask(null);
    setIsDetailSheetOpen(false);
    setIsAddSheetOpen(true);
  };

  // Kanban drag handlers
  const handleKanbanDragStart = () => { isDraggingKanbanRef.current = true; };
  const handleKanbanDragEnd = () => {
    isDraggingKanbanRef.current = false;
    if (dragBufferRef.current) {
      kanbanInteractedRef.current = true;
      setLocalKanbanColumns(dragBufferRef.current);
      dragBufferRef.current = null;
    }
  };
  const handleKanbanChange = (newColumns: Record<string, ProjectTaskType[]>) => {
    if (isDraggingKanbanRef.current) dragBufferRef.current = newColumns;
    else { kanbanInteractedRef.current = true; setLocalKanbanColumns(newColumns); }
  };

  // Kanban column management
  const handleAddColumn = (title: string) => {
    const id = `CUSTOM_${Date.now()}`;
    setCustomColumns(prev => [...prev, id]);
    setColumnTitles(prev => ({ ...prev, [id]: title }));
    setLocalKanbanColumns(prev => ({ ...prev, [id]: [] }));
  };

  const handleDeleteColumn = (columnId: string) => {
    const tasksToMove = activeKanbanColumns[columnId] || [];
    kanbanInteractedRef.current = true;
    setLocalKanbanColumns(prev => {
      const source = Object.keys(prev).length > 0 ? prev : activeKanbanColumns;
      const next = { ...source };
      delete next[columnId];
      if (tasksToMove.length > 0) {
        next[NO_STATUS_KEY] = [...(next[NO_STATUS_KEY] || []), ...tasksToMove];
      }
      return next;
    });
    setCustomColumns(prev => prev.filter(c => c !== columnId));
  };

  // List DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <>
      {tasksError ? <Error500 /> : (
        <>
          <ProjectTasksToolbar
            project={project}
            search={search} setSearch={setSearch}
            status={status} setStatus={setStatus}
            priority={priority} setPriority={setPriority}
            type={type} setType={setType}
            assigneeId={assigneeId} setAssigneeId={setAssigneeId}
            milestoneId={milestoneId} setMilestoneId={setMilestoneId}
            epicId={epicId} setEpicId={setEpicId}
          />

          {tasksAreLoading ? (
            <Loading />
          ) : tasks.length === 0 ? (
            <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">{tTasks("upload.form.labels.noTasks")}</h3>
            </div>
          ) : viewMode === "grid" ? (
            <TooltipProvider>
              <ProjectTasksKanbanBoard
                projectType={project.projectType}
                columns={activeKanbanColumns}
                columnTitles={columnTitles}
                onValueChange={handleKanbanChange}
                onDragStart={handleKanbanDragStart}
                onDragEnd={handleKanbanDragEnd}
                onTaskClick={handleOpenDetailSheet}
                onDuplicateTask={handleDuplicateTask}
                onDeleteColumn={handleDeleteColumn}
                onAddColumn={handleAddColumn}
              />
            </TooltipProvider>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(e: DragStartEvent) => setListActiveId(e.active.id as string)}
              onDragEnd={(e: DragEndEvent) => {
                const { active, over } = e;
                if (!over || active.id === over.id) return;
                const oldIndex = tasks.findIndex(t => t.id === active.id);
                const newIndex = tasks.findIndex(t => t.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) setDisplayedTasks(arrayMove(tasks, oldIndex, newIndex));
                setListActiveId(null);
              }}
              onDragCancel={() => setListActiveId(null)}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={tasks} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 space-y-4">
                  {tasks.map((task) => (
                    <ProjectTaskItem
                      key={task.id}
                      task={task}
                      viewMode="list"
                      projectType={project.projectType}
                      onClick={() => handleOpenDetailSheet(task)}
                      onDuplicate={(e) => handleDuplicateTask(task, e)}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {listActiveId ? (
                  <ProjectTaskItem
                    task={tasks.find(t => t.id === listActiveId) as ProjectTaskType}
                    viewMode="list"
                    projectType={project.projectType}
                    isDraggingOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={() => handleOpenUploadSheet()}
                  className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14"
                >
                  <Plus className="md:size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left"><p>{tTasks("addTask")}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ProjectTaskUploadSheet
            projectId={project.id}
            isAgile={project.projectType === "AGILE"}
            isOpen={isAddSheetOpen}
            onClose={() => { setIsAddSheetOpen(false); setSelectedTask(null); setDuplicateTemplate(null); }}
            task={selectedTask ?? (duplicateTemplate as ProjectTaskType | null)}
          />

          <ProjectTaskDetailSheet
            isOpen={isDetailSheetOpen}
            onClose={() => { setIsDetailSheetOpen(false); setSelectedTask(null); }}
            task={selectedTask}
            onEditClick={() => handleOpenUploadSheet(selectedTask as ProjectTaskType)}
            projectId={project.id}
          />
        </>
      )}
    </>
  );
}
