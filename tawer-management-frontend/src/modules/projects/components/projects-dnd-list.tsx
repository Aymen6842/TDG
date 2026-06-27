import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragCancelEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { ProjectType } from "../types/projects";
import ProjectContainer from "./project";

interface ProjectsDndListProps {
  projects: ProjectType[] | undefined;
  sensors: SensorDescriptor<SensorOptions>[];
  activeId: string | null;
  selectedIds: Set<string>;
  selectionActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (project: ProjectType) => void;
  onDelete: (project: ProjectType) => void;
  onArchive: (project: ProjectType) => void;
  onStatusChange: (project: ProjectType, status: any) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: (event: DragCancelEvent) => void;
}

export function ProjectsDndList({
  projects,
  sensors,
  activeId,
  selectedIds,
  selectionActive,
  onSelect,
  onEdit,
  onDelete,
  onArchive,
  onStatusChange,
  onDragStart,
  onDragEnd,
  onDragCancel,
}: ProjectsDndListProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={projects || []} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 space-y-4">
          {projects?.map((project) => (
            <ProjectContainer
              key={project.id}
              project={project as ProjectType & { status?: string }}
              viewMode="list"
              isSelected={selectedIds.has(project.id)}
              selectionActive={selectionActive}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <ProjectContainer
            project={projects?.find(p => p.id === activeId) as ProjectType & { status?: string }}
            viewMode="list"
            isDraggingOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
