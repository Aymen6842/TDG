"use client";
import React from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { ProjectType } from "@/modules/projects/types/projects";
import { SprintType } from "@/modules/projects/types/project-sprints";
import { deleteSprint } from "@/modules/projects/services";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import SprintCard from "./sprint-card";
import SprintUploadSheet from "./sprint-upload-sheet";
import { Toolbar } from "../../shared/toolbar";
import { FilterPanel } from "../../shared/filter-panel";
import { FilterSection } from "../../shared/filter-section";
import { EmptyState } from "../../shared/empty-state";
import { ConfirmDialog } from "../../shared/confirm-dialog";

interface Props {
  project: ProjectType;
}

export default function ProjectSprints({ project }: Props) {
  const t = useTranslations("modules.projects.sprints");
  const queryClient = useQueryClient();

  const { sprints, sprintsAreLoading, sprintsError, statusState, searchState, sortByState } = useProjectSprints(project.id);
  const [status, setStatus] = statusState;
  const [search, setSearch] = searchState;
  const [sortBy, setSortBy] = sortByState;

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editSprint, setEditSprint] = React.useState<SprintType | null>(null);
  const [sprintToDelete, setSprintToDelete] = React.useState<SprintType | null>(null);

  const hasActiveFilters = !!sortBy;

  const handleDelete = async () => {
    if (!sprintToDelete) return;
    try {
      await deleteSprint(project.id, sprintToDelete.id);
      queryClient.invalidateQueries({ queryKey: ["project-sprints", project.id] });
      toast.success(t("deleteDialog.successToast", { defaultValue: "Sprint deleted" }));
    } catch {
      toast.error(t("deleteDialog.errorToast", { defaultValue: "Failed to delete sprint" }));
    } finally {
      setSprintToDelete(null);
    }
  };

  const filterContent = (
    <FilterPanel hasActiveFilters={hasActiveFilters} onClear={() => setSortBy(undefined)}>
      <FilterSection label={t("filters.sortBy")}>
        <Select value={sortBy ?? "default"} onValueChange={(v) => setSortBy(v === "default" ? undefined : v)}>
          <SelectTrigger className="w-full"><SelectValue placeholder={t("filters.selectSortOption")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("filters.defaultOrder")}</SelectItem>
            <SelectItem value="startDateAsc">{t("filters.startDateAsc")}</SelectItem>
            <SelectItem value="startDateDesc">{t("filters.startDateDesc")}</SelectItem>
            <SelectItem value="endDateAsc">{t("filters.endDateAsc")}</SelectItem>
            <SelectItem value="endDateDesc">{t("filters.endDateDesc")}</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>
    </FilterPanel>
  );

  const addButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" onClick={() => { setEditSprint(null); setIsSheetOpen(true); }} className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14">
            <Plus className="md:size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left"><p>{t("addSprint")}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (sprintsError) return <Error500 />;

  return (
    <>
      <div className="space-y-4">
        <Toolbar
          tabs={
            <Tabs value={status ?? "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
              <TabsList>
                <TabsTrigger value="all">{t("statusTabs.all")}</TabsTrigger>
                <TabsTrigger value="Pending">{t("statusTabs.pending")}</TabsTrigger>
                <TabsTrigger value="Running">{t("statusTabs.running")}</TabsTrigger>
                <TabsTrigger value="Stopped">{t("statusTabs.stopped")}</TabsTrigger>
                <TabsTrigger value="Completed">{t("statusTabs.completed")}</TabsTrigger>
              </TabsList>
            </Tabs>
          }
          search={search} onSearchChange={setSearch}
          searchPlaceholder={t("searchPlaceholder")}
          filterContent={filterContent}
          activeFilterCount={hasActiveFilters ? 1 : 0}
          viewMode={viewMode} onViewModeChange={setViewMode}
          actions={addButton}
        />

        {sprintsAreLoading ? (
          <Loading />
        ) : sprints.length === 0 ? (
          <EmptyState message={t("noSprints")} />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sprints.map((sprint) => (
              <SprintCard key={sprint.id} sprint={sprint} viewMode="grid" onEdit={(s) => { setEditSprint(s); setIsSheetOpen(true); }} onDelete={setSprintToDelete} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 space-y-4">
            {sprints.map((sprint) => (
              <SprintCard key={sprint.id} sprint={sprint} viewMode="list" onEdit={(s) => { setEditSprint(s); setIsSheetOpen(true); }} onDelete={setSprintToDelete} />
            ))}
          </div>
        )}
      </div>

      <SprintUploadSheet projectId={project.id} isOpen={isSheetOpen} onClose={() => { setIsSheetOpen(false); setEditSprint(null); }} sprint={editSprint} />

      <ConfirmDialog
        open={!!sprintToDelete}
        onOpenChange={(open) => !open && setSprintToDelete(null)}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description")}
        onConfirm={handleDelete}
        onCancel={() => setSprintToDelete(null)}
        confirmLabel={t("deleteDialog.confirm")}
        cancelLabel={t("deleteDialog.cancel")}
      />
    </>
  );
}
