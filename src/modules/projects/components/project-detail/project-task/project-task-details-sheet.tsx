import React from "react";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";
import FilePreview from "reactjs-file-preview";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CustomDialog from "@/components/custom-dialog";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";

import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectTaskStatusClasses, projectTaskPriorityClasses, projectTaskTypeClasses } from "../../../utils/badges/project-task-badges";
import { deleteProjectTask } from "@/modules/projects/services";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TaskSubtasksSection } from "./task-subtasks-section";
import { TaskAttachmentsSection } from "./task-attachments-section";
import { TaskCommentsSection } from "./task-comments-section";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTaskType | null;
  onEditClick: () => void;
}

export function ProjectTaskDetailSheet({ projectId, isOpen, onClose, task, onEditClick }: Props) {
  const t = useTranslations("modules.projects.project.taskAttributes");
  const tTasks = useTranslations("modules.projects.tasks");
  const queryClient = useQueryClient();
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = React.useState(false);
  const [isDeletingTask, setIsDeletingTask] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handleDeleteTask = async () => {
    if (!task) return;
    setIsDeletingTask(true);
    try {
      await deleteProjectTask(projectId, task.id);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success("Task deleted");
      setIsDeleteTaskOpen(false);
      onClose();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeletingTask(false);
    }
  };

  if (!task) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <div className="flex items-center justify-between pe-6">
              <SheetTitle className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{task.key}</span>
                {task.title}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onEditClick}><Edit className="mr-1 size-4" />Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setIsDeleteTaskOpen(true)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
            <div className="flex items-center gap-2 capitalize">
              {task.type && <Badge className={projectTaskTypeClasses[task.type.toUpperCase()]}>{task.type}</Badge>}
              {task.status && <Badge className={projectTaskStatusClasses[task.status.toUpperCase()]}>{task.status.replace("_", " ")}</Badge>}
              {task.priority && <Badge className={projectTaskPriorityClasses[task.priority.toUpperCase()]}>{task.priority}</Badge>}
            </div>
          </SheetHeader>

          <div className="space-y-6 p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("form.labels.description")}</h4>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description || "No description provided.") }} className="text-muted-foreground text-sm prose dark:prose-invert max-w-none" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {task.dueDate && <div className="space-y-2"><h4 className="text-sm font-medium">{t("form.labels.dueDate")}</h4><p className="text-muted-foreground text-sm">{format(new Date(task.dueDate), "MMM d, yyyy - h:mm a")}</p></div>}
              {task.storyPoints !== undefined && <div className="space-y-2"><h4 className="text-sm font-medium">{t("points")}</h4><p className="text-muted-foreground text-sm">{task.storyPoints}</p></div>}
              {task.createdAt && <div className="space-y-2"><h4 className="text-sm font-medium">Created At</h4><p className="text-muted-foreground text-sm">{format(new Date(task.createdAt), "MMM d, yyyy")}</p></div>}
            </div>
          </div>

          <Separator />
          <TaskSubtasksSection projectId={projectId} task={task} />
          <Separator />
          <TaskAttachmentsSection attachments={task.attachments} onViewAttachment={(url) => { setPreviewUrl(url); setIsPreviewOpen(true); }} />
          <Separator />
          <TaskCommentsSection projectId={projectId} taskId={task.id} comments={task.comments} />
        </SheetContent>

        <CustomDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} title={tTasks("filePreview")} className="max-w-4xl max-h-[90vh] overflow-auto">
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
