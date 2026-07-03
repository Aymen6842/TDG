import React from "react";
import { dateToString } from "@/utils/date";
import { format } from "date-fns";
import { Edit, Loader2, Trash2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";
import FilePreview from "reactjs-file-preview";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CustomDialog from "@/components/custom-dialog";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";

import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectTaskPriorityClasses, projectTaskTypeClasses } from "../../../utils/badges/project-task-badges";
import { deleteProjectTask, retrieveProjectTask } from "@/modules/projects/services";
import { toast } from "sonner";

import { TaskSubtasksSection } from "./task-subtasks-section";
import { TaskAttachmentsSection } from "./task-attachments-section";
import { TaskCommentsSection } from "./task-comments-section";
import { TaskLabelsSection } from "./task-labels-section";
import { TaskDependenciesSection } from "./task-dependencies-section";
import { TaskTimeEntriesSection } from "./task-time-entries-section";
import TaskStatusStepper from "./task-status-stepper";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTaskType | null;
  onEditClick: () => void;
}

export function ProjectTaskDetailSheet({ projectId, isOpen, onClose, task, onEditClick }: Props) {
  const t = useTranslations("modules.projects.project.taskAttributes");
  const queryClient = useQueryClient();
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = React.useState(false);
  const [isDeletingTask, setIsDeletingTask] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const { data: fullTask, isLoading: isTaskLoading } = useQuery({
    queryKey: ["project-task", projectId, task?.id],
    queryFn: () => retrieveProjectTask(projectId, task!.id),
    enabled: isOpen && !!task?.id,
    refetchOnWindowFocus: false,
  });

  const displayTask = fullTask ?? task;

  const handleDeleteTask = async () => {
    if (!displayTask) return;
    setIsDeletingTask(true);
    try {
      await deleteProjectTask(projectId, displayTask.id);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.removeQueries({ queryKey: ["project-task", projectId, displayTask.id] });
      toast.success("Task deleted");
      setIsDeleteTaskOpen(false);
      onClose();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeletingTask(false);
    }
  };

  if (!task || !displayTask) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <div className="flex items-center justify-between pe-6">
              <SheetTitle className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{displayTask.key}</span>
                {displayTask.title}
                {isTaskLoading && !fullTask && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onEditClick}><Edit className="mr-1 size-4" />{t("edit")}</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setIsDeleteTaskOpen(true)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
            <div className="flex items-center gap-2 capitalize">
              {displayTask.type && <Badge className={projectTaskTypeClasses[displayTask.type.toUpperCase()]}>{displayTask.type}</Badge>}
              {displayTask.status && (
                <TaskStatusStepper
                  projectId={projectId}
                  taskId={displayTask.id}
                  currentStatus={displayTask.status}
                />
              )}
              {displayTask.priority && <Badge className={projectTaskPriorityClasses[displayTask.priority.toUpperCase()]}>{displayTask.priority}</Badge>}
            </div>
          </SheetHeader>

          <div className="space-y-6 p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("form.labels.description")}</h4>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayTask.description || t("noDescription")) }} className="text-muted-foreground text-sm prose dark:prose-invert max-w-none" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {displayTask.dueDate && <div className="space-y-2"><h4 className="text-sm font-medium">{t("form.labels.dueDate")}</h4><p className="text-muted-foreground text-sm">{format(new Date(displayTask.dueDate), "MMM d, yyyy - h:mm a")}</p></div>}
              {displayTask.storyPoints !== undefined && <div className="space-y-2"><h4 className="text-sm font-medium">{t("points")}</h4><p className="text-muted-foreground text-sm">{displayTask.storyPoints}</p></div>}
              {displayTask.createdAt && <div className="space-y-2"><h4 className="text-sm font-medium">{t("form.labels.createdAt")}</h4><p className="text-muted-foreground text-sm">{dateToString(new Date(displayTask.createdAt))}</p></div>}
            </div>
          </div>

          <Separator />
          <TaskLabelsSection projectId={projectId} taskId={displayTask.id} assignedLabels={displayTask.labels} />
          <Separator />
          <TaskDependenciesSection projectId={projectId} taskId={displayTask.id} dependencies={displayTask.taskDependenciesAsBlocked} />
          <Separator />
          <TaskSubtasksSection projectId={projectId} task={displayTask} />
          <Separator />
          <TaskAttachmentsSection attachments={displayTask.attachments?.map((a) => a.file) || []} onViewAttachment={(url) => { setPreviewUrl(url); setIsPreviewOpen(true); }} />
          <Separator />
          <TaskTimeEntriesSection projectId={projectId} taskId={displayTask.id} />
          <Separator />
          <TaskCommentsSection projectId={projectId} taskId={displayTask.id} comments={displayTask.comments} />
        </SheetContent>

        <CustomDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} title={t("filePreview")} className="max-w-4xl max-h-[90vh] overflow-auto">
          {previewUrl && <div className="mt-4"><FilePreview preview={previewUrl} /></div>}
        </CustomDialog>
      </Sheet>

      <DeletionConfirmationDialog
        isOpen={isDeleteTaskOpen} isPending={isDeletingTask}
        onOpenChange={(open) => !open && setIsDeleteTaskOpen(false)}
        onConfirm={handleDeleteTask} onCancel={() => setIsDeleteTaskOpen(false)}
        title={t("deletion.title")} description={t("deletion.description")}
      />
    </>
  );
}

export default ProjectTaskDetailSheet;
