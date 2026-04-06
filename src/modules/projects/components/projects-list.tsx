import React from "react";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProjectStore } from "@/modules/projects/store/projects";
import { useRouter } from "next/navigation";
import ProjectStatusTabs from "@/modules/projects/components/project-status-tabs";
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
import useProjects from "../hooks/projects/use-projects";
import { cn } from "@/lib/utils";
import Loading from "@/components/page-loader";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectContainer from "./project";
import Error500 from "@/components/error/500";
import { ProjectType } from "../types/projects";
import ProjectUploadSheet from "./project-upload-sheet";

export default function ProjectsList() {
  const t = useTranslations("modules.projects.list");

  const { projects, projectsAreLoading, projectsError, searchState, statusState, projectTypeState, businessUnitState, isArchivedState, paidState, sortByState, setDisplayedProjects } = useProjects();
  const [search, setSearch] = searchState;
  const [status, setStatus] = statusState;
  const [projectType, setProjectType] = projectTypeState;
  const [businessUnit, setBusinessUnit] = businessUnitState;
  const [isArchived, setIsArchived] = isArchivedState;
  const [paid, setPaid] = paidState;
  const [sortBy, setSortBy] = sortByState;

  const router = useRouter();


  const [activeId, setActiveId] = React.useState<string | null>(null);

  const {
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setAddDialogOpen
  } = useProjectStore();

  const [editProject, setEditProject] = React.useState<ProjectType | null>(null);
  const [projectToDelete, setProjectToDelete] = React.useState<ProjectType | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);


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

  const handleTabChange = (tab: any) => {
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

    const oldIndex = projects?.findIndex((item: any) => item.id === active.id);
    const newIndex = projects?.findIndex((item: any) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === undefined || newIndex === undefined) return;

    const newItems = arrayMove(projects ?? [], oldIndex, newIndex);
    // orderedProjects logic here if we have a hook like useTasksOrdersUpdates
    setDisplayedProjects(newItems);
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    setActiveId(null);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setProjectType(undefined);
    setBusinessUnit(undefined);
    setIsArchived(undefined);
    setPaid(undefined);
    setSortBy(undefined);
    handleTabChange("all");
  };


  const renderFilterContent = () => (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.sortBy", { defaultValue: "Sort By" })}</h4>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.selectSortOption", { defaultValue: "Select sorting option" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nameAsc">{t("filters.nameAscending", { defaultValue: "Name (A-Z)" })}</SelectItem>
            <SelectItem value="nameDesc">{t("filters.nameDescending", { defaultValue: "Name (Z-A)" })}</SelectItem>
            <SelectItem value="startDateAsc">{t("filters.startDateAscending", { defaultValue: "Start Date (Oldest)" })}</SelectItem>
            <SelectItem value="startDateDesc">{t("filters.startDateDescending", { defaultValue: "Start Date (Newest)" })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.projectType", { defaultValue: "Project Type" })}</h4>
        <Select value={projectType || "all"} onValueChange={(v) => setProjectType(v === "all" ? undefined : v as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="AGILE">Agile</SelectItem>
            <SelectItem value="FREESTYLE">Freestyle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.businessUnit", { defaultValue: "Business Unit" })}</h4>
        <Select value={businessUnit || "all"} onValueChange={(v) => setBusinessUnit(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Units" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            <SelectItem value="TawerDev">Tawer Dev</SelectItem>
            <SelectItem value="TawerCreative">Tawer Creative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t("filters.isArchived", { defaultValue: "Archived" })}</h4>
          <Select value={isArchived === undefined ? "all" : isArchived ? "true" : "false"} onValueChange={(v) => setIsArchived(v === "all" ? undefined : v === "true")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Archived</SelectItem>
              <SelectItem value="false">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t("filters.paid", { defaultValue: "Paid" })}</h4>
          <Select value={paid === undefined ? "all" : paid ? "true" : "false"} onValueChange={(v) => setPaid(v === "all" ? undefined : v === "true")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Paid</SelectItem>
              <SelectItem value="false">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(status || projectType || businessUnit || isArchived !== undefined || paid !== undefined || sortBy) && (

        <div className="text-end">
          <Button variant="link" size="sm" className="px-0!" onClick={clearFilters}>
            {t("filters.clearFilters")}
            <X />
          </Button>
        </div>
      )}
    </div>
  );

  const renderProjectItems = () => {
    if (viewMode === "grid") {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}>
          <SortableContext items={projects || []} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects?.map((project: any) => (
                <ProjectContainer
                  key={project.id}
                  project={project as ProjectType & { status?: string }}
                  viewMode="grid"
                  onEdit={(p) => {
                    setEditProject(p);
                    setAddDialogOpen(true);
                  }}
                  onDelete={(p) => {
                    setProjectToDelete(p);
                    setIsDeleteOpen(true);
                  }}
                  onView={(p) => {
                    router.push(`/dashboard/projects/${p.slug}`);
                  }}
                  onArchive={(p) => {
                    console.log("Archiving project:", p.id);
                    // Actual archive logic would go here (toggling isArchived)
                  }}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <ProjectContainer
                project={projects?.find((p: any) => p.id === activeId) as ProjectType & { status?: string }}
                viewMode="grid"
                isDraggingOverlay
              />
            ) : null}
          </DragOverlay>

        </DndContext>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={projects || []} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 space-y-4">
            {projects?.map((project: any) => (
              <ProjectContainer
                key={project.id}
                project={project as ProjectType & { status?: string }}
                viewMode="list"
                onEdit={(p) => {
                  setEditProject(p);
                  setAddDialogOpen(true);
                }}
                onDelete={(p) => {
                  setProjectToDelete(p);
                  setIsDeleteOpen(true);
                }}
                onView={(p) => {
                  router.push(`/dashboard/projects/${p.slug}`);
                }}
                onArchive={(p) => {
                  console.log("Archiving project:", p.id);
                  // Actual archive logic would go here
                }}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <ProjectContainer
              project={projects?.find((p: any) => p.id === activeId) as ProjectType & { status?: string }}
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
      {projectsError ? (
        <Error500 />
      ) : (
        <>
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <ProjectStatusTabs activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="flex w-full items-center gap-2 lg:w-auto">
              <div className="relative w-auto">
                <Search className="absolute top-2.5 left-3 size-4 opacity-50" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  className="ps-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="relative">
                    <SlidersHorizontal />
                    {(status || projectType || businessUnit || isArchived !== undefined || paid !== undefined || sortBy) && (
                      <Badge
                        variant="secondary"
                        className="absolute -end-1.5 -top-1.5 size-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                        {(status ? 1 : 0) + (projectType ? 1 : 0) + (businessUnit ? 1 : 0) + (isArchived !== undefined ? 1 : 0) + (paid !== undefined ? 1 : 0) + (sortBy ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  {renderFilterContent()}
                </DropdownMenuContent>
              </DropdownMenu>

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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => setAddDialogOpen(true)}
                      className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14">
                      <Plus className="md:size-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{t("addProject")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {projectsAreLoading ? <Loading /> : projects?.length === 0 ? (
            <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">{t("noProjects")}</h3>
            </div>
          ) : (
            renderProjectItems()
          )}
        </>
      )}

      <ProjectUploadSheet
        isOpen={isAddDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditProject(null);
        }}
        project={editProject as ProjectType}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
              {t("deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                console.log("Deleting project:", projectToDelete?.id);
                // Actual deletion logic would go here
                setProjectToDelete(null);
                setIsDeleteOpen(false);
              }}
            >
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
