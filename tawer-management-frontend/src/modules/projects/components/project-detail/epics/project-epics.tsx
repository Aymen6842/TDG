"use client";
import React from "react";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { EmptyState } from "../../shared/empty-state";
import Loading from "@/components/page-loader";
import { ProjectType } from "@/modules/projects/types/projects";
import { EpicType } from "@/modules/projects/types/project-epics";
import useEpics from "@/modules/projects/hooks/epics/use-epics";
import useEpicUpload from "@/modules/projects/hooks/epics/use-epic-upload";
import EpicUploadSheet from "./epic-upload-sheet";

interface Props {
  project: ProjectType;
}

export default function ProjectEpics({ project }: Props) {
  const { epics, epicsAreLoading } = useEpics(project.id);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editEpic, setEditEpic] = React.useState<EpicType | null>(null);
  const [epicToDelete, setEpicToDelete] = React.useState<EpicType | null>(null);

  const { deleteEpicFromProject, isPending: isDeleting } = useEpicUpload({ projectId: project.id });

  const handleDelete = async () => {
    if (!epicToDelete) return;
    await deleteEpicFromProject(epicToDelete.id);
    setEpicToDelete(null);
  };

  if (epicsAreLoading) return <Loading />;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Epics</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={() => { setEditEpic(null); setIsSheetOpen(true); }} className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14">
                  <Plus className="md:size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left"><p>Add Epic</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {epics.length === 0 ? (
          <EmptyState message="No epics yet. Create one to group related work." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {epics.map((epic) => (
              <div key={epic.id} className="group relative rounded-lg border p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {epic.color && (
                      <span className="inline-block size-3 rounded-full flex-shrink-0" style={{ backgroundColor: epic.color }} />
                    )}
                    <p className="font-medium text-sm truncate">{epic.name}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => { setEditEpic(epic); setIsSheetOpen(true); }}>
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="size-7 p-0 text-destructive" onClick={() => setEpicToDelete(epic)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {epic.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{epic.description}</p>
                )}
                {(epic.startDate || epic.endDate) && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <CalendarRange className="size-3" />
                    {epic.startDate && format(epic.startDate, "MMM d")}
                    {epic.startDate && epic.endDate && " → "}
                    {epic.endDate && format(epic.endDate, "MMM d, yyyy")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <EpicUploadSheet
        projectId={project.id}
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); setEditEpic(null); }}
        epic={editEpic}
      />

      <ConfirmDialog
        open={!!epicToDelete}
        onOpenChange={(open) => !open && setEpicToDelete(null)}
        title="Delete Epic"
        description={`Are you sure you want to delete "${epicToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setEpicToDelete(null)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
