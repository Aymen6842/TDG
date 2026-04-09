"use client";
import React from "react";
import { Plus, Search, SlidersHorizontal, X, GridIcon, ListIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { ProjectType } from "@/modules/projects/types/projects";
import { SprintType } from "@/modules/projects/types/project-sprints";
import { deleteSprint } from "@/modules/projects/services/mutations/sprint-deletion";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import SprintCard from "./sprint-card";
import SprintUploadSheet from "./sprint-upload-sheet";

interface Props {
  project: ProjectType;
}

export default function ProjectSprints({ project }: Props) {
  const t = useTranslations("modules.projects.sprints");
  const queryClient = useQueryClient();

  const { sprints, sprintsAreLoading, sprintsError, statusState, searchState, sortByState } =
    useProjectSprints(project.id);

  const [status, setStatus] = statusState;
  const [search, setSearch] = searchState;
  const [sortBy, setSortBy] = sortByState;

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editSprint, setEditSprint] = React.useState<SprintType | null>(null);
  const [sprintToDelete, setSprintToDelete] = React.useState<SprintType | null>(null);

  const hasActiveFilters = !!sortBy;

  const clearFilters = () => setSortBy(undefined);

  const handleEdit = (sprint: SprintType) => {
    setEditSprint(sprint);
    setIsSheetOpen(true);
  };

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

  const renderFilterContent = () => (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t("filters.sortBy")}</h4>
        <Select value={sortBy ?? "default"} onValueChange={(v) => setSortBy(v === "default" ? undefined : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.selectSortOption")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("filters.defaultOrder")}</SelectItem>
            <SelectItem value="startDateAsc">{t("filters.startDateAsc")}</SelectItem>
            <SelectItem value="startDateDesc">{t("filters.startDateDesc")}</SelectItem>
            <SelectItem value="endDateAsc">{t("filters.endDateAsc")}</SelectItem>
            <SelectItem value="endDateDesc">{t("filters.endDateDesc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="text-end">
          <Button variant="link" size="sm" className="px-0!" onClick={clearFilters}>
            {t("filters.clearFilters")}
            <X className="ms-2 size-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {sprintsError ? <Error500 /> : (
        <div className="space-y-4">
          {/* Toolbar — status tabs left, controls right */}
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <Tabs value={status ?? "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
              <TabsList>
                <TabsTrigger value="all">{t("statusTabs.all")}</TabsTrigger>
                <TabsTrigger value="Pending">{t("statusTabs.pending")}</TabsTrigger>
                <TabsTrigger value="Running">{t("statusTabs.running")}</TabsTrigger>
                <TabsTrigger value="Stopped">{t("statusTabs.stopped")}</TabsTrigger>
                <TabsTrigger value="Completed">{t("statusTabs.completed")}</TabsTrigger>
              </TabsList>
            </Tabs>

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
                    <SlidersHorizontal className="size-4" />
                    {hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="absolute -end-1.5 -top-1.5 size-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end">
                  {renderFilterContent()}
                </DropdownMenuContent>
              </DropdownMenu>

              <ToggleGroup
                type="single"
                variant="outline"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as "grid" | "list")}>
                <ToggleGroupItem value="list" aria-label="List view"><ListIcon /></ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view"><GridIcon /></ToggleGroupItem>
              </ToggleGroup>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => { setEditSprint(null); setIsSheetOpen(true); }}
                      className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14"
                    >
                      <Plus className="md:size-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left"><p>{t("addSprint")}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {sprintsAreLoading ? (
            <Loading />
          ) : sprints.length === 0 ? (
            <div className="flex h-[calc(100vh-16rem)] flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">{t("noSprints")}</h3>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sprints.map((sprint) => (
                <SprintCard key={sprint.id} sprint={sprint} viewMode="grid" onEdit={handleEdit} onDelete={setSprintToDelete} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 space-y-4">
              {sprints.map((sprint) => (
                <SprintCard key={sprint.id} sprint={sprint} viewMode="list" onEdit={handleEdit} onDelete={setSprintToDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      <SprintUploadSheet
        projectId={project.id}
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); setEditSprint(null); }}
        sprint={editSprint}
      />

      <AlertDialog open={!!sprintToDelete} onOpenChange={(open) => !open && setSprintToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDialog.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDelete}
            >
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
