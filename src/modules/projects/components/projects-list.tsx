import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSensor, useSensors, PointerSensor, KeyboardSensor, type DragStartEvent, type DragEndEvent, type DragCancelEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useProjectStore } from "@/modules/projects/store/projects";
import useProjects from "../hooks/projects/use-projects";
import useProjectActions from "../hooks/projects/use-project-actions";
import { ProjectType, ProjectStatus } from "../types/projects";
import { Toolbar } from "./shared/toolbar";
import { ConfirmDialog } from "./shared/confirm-dialog";
import { EmptyState } from "./shared/empty-state";
import { ProjectsFilterPanel } from "./projects-filter-panel";
import { ProjectsBulkBar } from "./projects-bulk-bar";
import { ProjectsDndGrid } from "./projects-dnd-grid";
import { ProjectsDndList } from "./projects-dnd-list";
import ProjectStatusTabs from "./project-status-tabs";
import ProjectUploadSheet from "./project-upload-sheet";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";

export default function ProjectsList() {
  const t = useTranslations("modules.projects.list");
  const paginationContent = useTranslations("shared.pagination");

  const { projects, projectsAreLoading, projectsPageLoading, projectsError, page, setPage, pagesNumber, records, currentUserId, creators, refresh, searchState, projectTypeState, businessUnitState, isArchivedState, paidState, sortByState, createdByState } = useProjects();
  const { handleStatusChange, handleArchiveProject, handleDeleteProject } = useProjectActions(refresh);

  const [search, setSearch] = searchState;
  const [projectType, setProjectType] = projectTypeState;
  const [businessUnit, setBusinessUnit] = businessUnitState;
  const [isArchived, setIsArchived] = isArchivedState;
  const [paid, setPaid] = paidState;
  const [sortBy, setSortBy] = sortByState;
  const [createdById, setCreatedById] = createdByState;

  const { viewMode, setViewMode, activeTab, setActiveTab, isAddDialogOpen, setAddDialogOpen } = useProjectStore();
  const [editProject, setEditProject] = React.useState<ProjectType | null>(null);
  const [projectToDelete, setProjectToDelete] = React.useState<ProjectType | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatusChange = async (status: ProjectStatus) => {
    await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p ? handleStatusChange(p, status) : Promise.resolve(); }));
    clearSelection();
  };
  const handleBulkArchive = async () => { await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p && !p.isArchived ? handleArchiveProject(p) : Promise.resolve(); })); clearSelection(); };
  const handleBulkRestore = async () => { await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p && p.isArchived ? handleArchiveProject(p) : Promise.resolve(); })); clearSelection(); };
  const handleBulkDelete = async () => { await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p ? handleDeleteProject(p) : Promise.resolve(); })); clearSelection(); setIsBulkDeleteOpen(false); };
  const handleDelete = async () => { if (!projectToDelete) return; await handleDeleteProject(projectToDelete); setProjectToDelete(null); setIsDeleteOpen(false); };

  const allPageSelected = (projects?.length ?? 0) > 0 && projects?.every(p => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (allPageSelected) { setSelectedIds(prev => { const n = new Set(prev); projects?.forEach(p => n.delete(p.id)); return n; }); }
    else { setSelectedIds(prev => { const n = new Set(prev); projects?.forEach(p => n.add(p.id)); return n; }); }
  };

  const clearFilters = () => { setSearch(""); setProjectType(undefined); setBusinessUnit(undefined); setIsArchived(false); setPaid(undefined); setSortBy(undefined); setCreatedById(undefined); setActiveTab("all"); };
  const activeFilterCount = (projectType ? 1 : 0) + (businessUnit ? 1 : 0) + (isArchived === true ? 1 : 0) + (paid !== undefined ? 1 : 0) + (sortBy ? 1 : 0) + (createdById ? 1 : 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const onDragEnd = (e: DragEndEvent) => { setActiveId(null); };
  const onDragCancel = (e: DragCancelEvent) => setActiveId(null);

  const dndProps = { projects, sensors, activeId, selectedIds, selectionActive: selectedIds.size > 0, onSelect: toggleSelect, onEdit: (p: ProjectType) => { setEditProject(p); setAddDialogOpen(true); }, onDelete: (p: ProjectType) => { setProjectToDelete(p); setIsDeleteOpen(true); }, onArchive: handleArchiveProject, onStatusChange: handleStatusChange, onDragStart, onDragEnd, onDragCancel };

  const filterContent = (
    <ProjectsFilterPanel
      sortBy={sortBy} setSortBy={setSortBy}
      projectType={projectType} setProjectType={setProjectType}
      businessUnit={businessUnit} setBusinessUnit={setBusinessUnit}
      isArchived={isArchived} setIsArchived={setIsArchived}
      paid={paid} setPaid={setPaid}
      createdById={createdById} setCreatedById={setCreatedById}
      currentUserId={currentUserId} creators={creators}
      onClear={clearFilters}
    />
  );

  const addButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" onClick={() => setAddDialogOpen(true)} className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14">
            <Plus className="md:size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left"><p>{t("addProject")}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (projectsError) return <Error500 />;

  return (
    <>
      <Toolbar
        tabs={<ProjectStatusTabs activeTab={activeTab} onTabChange={setActiveTab} />}
        search={search} onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filterContent={filterContent}
        activeFilterCount={activeFilterCount}
        viewMode={viewMode} onViewModeChange={setViewMode}
        actions={addButton}
      />

      {projectsAreLoading || projectsPageLoading ? <Loading /> : projects?.length === 0 ? (
        <EmptyState message={t("noProjects")} />
      ) : (
        <>
          <ProjectsBulkBar
            projects={projects} selectedIds={selectedIds}
            onToggleSelectAll={toggleSelectAll} onClearSelection={clearSelection}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkArchive={handleBulkArchive} onBulkRestore={handleBulkRestore}
            onBulkDelete={() => setIsBulkDeleteOpen(true)}
          />

          {viewMode === "grid" ? <ProjectsDndGrid {...dndProps} /> : <ProjectsDndList {...dndProps} />}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <div className="text-muted-foreground flex-1 text-sm">
              {records !== undefined ? paginationContent.rich("selected", { page, pages: pagesNumber, records }) : `Page ${page}`}
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="size-4 mr-1" />{paginationContent("previous")}
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pagesNumber} onClick={() => setPage(page + 1)}>
                {paginationContent("next")}<ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      <ProjectUploadSheet
        isOpen={isAddDialogOpen}
        onClose={() => { setAddDialogOpen(false); setEditProject(null); refresh(); }}
        project={editProject as ProjectType}
      />

      <ConfirmDialog
        open={isDeleteOpen || isBulkDeleteOpen}
        onOpenChange={(open) => { if (!open) { setIsDeleteOpen(false); setIsBulkDeleteOpen(false); setProjectToDelete(null); } }}
        title={isBulkDeleteOpen ? t("deleteDialog.bulkTitle", { count: selectedIds.size }) : t("deleteDialog.title")}
        description={isBulkDeleteOpen ? t("deleteDialog.bulkDescription") : t("deleteDialog.description")}
        onConfirm={isBulkDeleteOpen ? handleBulkDelete : handleDelete}
        onCancel={() => { setIsDeleteOpen(false); setIsBulkDeleteOpen(false); setProjectToDelete(null); }}
        confirmLabel={isBulkDeleteOpen ? t("deleteDialog.confirmBulk") : t("deleteDialog.confirm")}
        cancelLabel={t("deleteDialog.cancel")}
      />
    </>
  );
}
