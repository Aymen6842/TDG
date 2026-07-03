"use client";
import React from "react";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, CheckCircle2, Circle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { EmptyState } from "../../shared/empty-state";
import Loading from "@/components/page-loader";
import { ProjectType } from "@/modules/projects/types/projects";
import { MilestoneType } from "@/modules/projects/types/project-milestones";
import useMilestones from "@/modules/projects/hooks/milestones/use-milestones";
import useMilestoneUpload from "@/modules/projects/hooks/milestones/use-milestone-upload";
import useGanttData from "@/modules/projects/hooks/milestones/use-gantt";
import MilestoneUploadSheet from "./milestone-upload-sheet";

interface Props {
  project: ProjectType;
}

function GanttView({ projectId }: { projectId: string }) {
  const { ganttData, ganttIsLoading } = useGanttData(projectId);
  if (ganttIsLoading) return <Loading />;

  const isEmpty =
    !ganttData ||
    (ganttData.milestones.length === 0 &&
      ganttData.epics.length === 0 &&
      ganttData.sprints.length === 0 &&
      ganttData.tasks.length === 0);
  if (isEmpty) return <EmptyState message="No milestones, epics, or sprints to display on Gantt." />;

  return (
    <div className="overflow-x-auto space-y-6">
      <div className="min-w-[500px] space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">Milestones</h4>
        {ganttData.milestones.length === 0 ? (
          <p className="text-xs text-muted-foreground">No milestones.</p>
        ) : (
          ganttData.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-md border px-4 py-2.5">
              {m.completedAt
                ? <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                : <Circle className="size-4 text-muted-foreground flex-shrink-0" />}
              <span className="text-sm font-medium flex-1 truncate">{m.name}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="size-3" />
                {m.dueDate ? format(m.dueDate, "MMM d, yyyy") : "No due date"}
              </div>
              <Badge variant="outline" className="text-xs">{m.status}</Badge>
            </div>
          ))
        )}
      </div>

      {ganttData.epics.length > 0 && (
        <div className="min-w-[500px] space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Epics</h4>
          {ganttData.epics.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-md border px-4 py-2 text-sm">
              <span className="flex-1 truncate">{e.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {e.startDate ? format(e.startDate, "MMM d") : "?"} – {e.endDate ? format(e.endDate, "MMM d, yyyy") : "?"}
              </span>
            </div>
          ))}
        </div>
      )}

      {ganttData.sprints.length > 0 && (
        <div className="min-w-[500px] space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Sprints</h4>
          {ganttData.sprints.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-md border px-4 py-2 text-sm">
              <Badge variant="outline" className="text-xs flex-shrink-0">{s.status}</Badge>
              <span className="text-xs text-muted-foreground flex-1 text-right">
                {s.startDate ? format(s.startDate, "MMM d") : "?"} – {s.endDate ? format(s.endDate, "MMM d, yyyy") : "?"}
              </span>
            </div>
          ))}
        </div>
      )}

      {ganttData.tasks.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {ganttData.tasks.length} task{ganttData.tasks.length === 1 ? "" : "s"} in scope for this timeline.
        </p>
      )}
    </div>
  );
}

export default function ProjectMilestones({ project }: Props) {
  const { milestones, milestonesAreLoading } = useMilestones(project.id);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editMilestone, setEditMilestone] = React.useState<MilestoneType | null>(null);
  const [milestoneToDelete, setMilestoneToDelete] = React.useState<MilestoneType | null>(null);

  const { deleteMilestoneFromProject, completeMilestoneInProject, isPending } = useMilestoneUpload({ projectId: project.id });

  const handleDelete = async () => {
    if (!milestoneToDelete) return;
    await deleteMilestoneFromProject(milestoneToDelete.id);
    setMilestoneToDelete(null);
  };

  return (
    <>
      <div className="space-y-4">
        <Tabs defaultValue="list">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="gantt">Gantt</TabsTrigger>
            </TabsList>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" onClick={() => { setEditMilestone(null); setIsSheetOpen(true); }} className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14">
                    <Plus className="md:size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Add Milestone</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TabsContent value="list">
            {milestonesAreLoading ? <Loading /> : milestones.length === 0 ? (
              <EmptyState message="No milestones yet. Create one to track key delivery dates." />
            ) : (
              <div className="space-y-2">
                {milestones.map((ms) => (
                  <div key={ms.id} className="group flex items-center gap-3 rounded-lg border px-4 py-3 hover:border-primary/40 transition-colors">
                    <button
                      onClick={() => !ms.completedAt && completeMilestoneInProject(ms.id)}
                      disabled={isPending || !!ms.completedAt}
                      className="flex-shrink-0"
                    >
                      {ms.completedAt
                        ? <CheckCircle2 className="size-5 text-green-500" />
                        : <Circle className="size-5 text-muted-foreground hover:text-green-500 transition-colors" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${ms.completedAt ? "line-through text-muted-foreground" : ""}`}>{ms.name}</p>
                      {ms.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{ms.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <CalendarClock className="size-3" />
                      {ms.dueDate ? format(new Date(ms.dueDate), "MMM d, yyyy") : "No due date"}
                    </div>
                    {ms.completedAt && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-300 flex-shrink-0">Done</Badge>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => { setEditMilestone(ms); setIsSheetOpen(true); }}>
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="size-7 p-0 text-destructive" onClick={() => setMilestoneToDelete(ms)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gantt">
            <GanttView projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>

      <MilestoneUploadSheet
        projectId={project.id}
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); setEditMilestone(null); }}
        milestone={editMilestone}
      />

      <ConfirmDialog
        open={!!milestoneToDelete}
        onOpenChange={(open) => !open && setMilestoneToDelete(null)}
        title="Delete Milestone"
        description={`Delete "${milestoneToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setMilestoneToDelete(null)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
