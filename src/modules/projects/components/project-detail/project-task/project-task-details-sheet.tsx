import React from "react";
import { format } from "date-fns";
import { Check, Trash2, X, Edit, PlusCircleIcon, ClockIcon } from "lucide-react";
import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";
import FilePreview from "reactjs-file-preview";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CustomDialog from "@/components/custom-dialog";
import { FormField, FormItem, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectTaskStatusClasses, projectTaskPriorityClasses, projectTaskTypeClasses } from "../../../utils/badges/project-task-badges";
import AttachementPreview from "@/modules/projects/components/project-detail/project-task/attachement-preview";
import useProjectTaskUpload from "../../../hooks/tasks/use-project-task-upload";
import useProjectTaskComment from "@/modules/projects/hooks/tasks/use-project-task-comment";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";
import { deleteProjectTask } from "@/modules/projects/services/mutations/project-task-deletion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTaskType | null;
  onEditClick: () => void;
}

export function ProjectTaskDetailSheet({
  projectId,
  isOpen,
  onClose,
  task,
  onEditClick
}: Props) {
  const t = useTranslations("modules.projects.project.taskAttributes");
  const tCommon = useTranslations("modules.projects.tasks");

  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = React.useState(false);
  const [subTaskToDelete, setSubTaskToDelete] = React.useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = React.useState<string | null>(null);
  const [isDeletingTask, setIsDeletingTask] = React.useState(false);
  const [isDeletingSubTask, setIsDeletingSubTask] = React.useState(false);
  const [isDeletingComment, setIsDeletingComment] = React.useState(false);
  const [isAddingSubTask, setIsAddingSubTask] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Subtasks Hook
  const { form, onSubmit } = useProjectTaskUpload({
    projectId,
    onSuccess: () => {
      form.reset();
      setIsAddingSubTask(false);
    },
  });

  // Comments Hook
  const { form: formComment, onSubmit: onSubmitComment, isPending: isCommentPending, deleteComment } = useProjectTaskComment({
    projectId,
    taskId: task?.id || ""
  });

  // Task deletion
  const queryClient = useQueryClient();
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

  const handleDeleteSubTask = async () => {
    if (!subTaskToDelete) return;
    setIsDeletingSubTask(true);
    try {
      await deleteProjectTask(projectId, subTaskToDelete);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success("Subtask deleted");
      setSubTaskToDelete(null);
    } catch {
      toast.error("Failed to delete subtask");
    } finally {
      setIsDeletingSubTask(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);
    try {
      await deleteComment(commentToDelete);
      setCommentToDelete(null);
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeletingComment(false);
    }
  };

  const viewAttachment = (attachment: string) => {
    setPreviewUrl(attachment);
    setIsPreviewOpen(true);
  }

  const onAddSubTask = () => {
    if (task) {
      form.setValue("parentTaskId" as any, task.id);
      setIsAddingSubTask(true);
    }
  }

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditClick}
                >
                  <Edit className="mr-1 size-4" />
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setIsDeleteTaskOpen(true)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 capitalize">
              {task.type && (
                <Badge className={projectTaskTypeClasses[task.type.toUpperCase()]}>
                  {task.type}
                </Badge>
              )}
              {task.status && (
                <Badge className={projectTaskStatusClasses[task.status.toUpperCase()]}>
                  {task.status.replace("_", " ")}
                </Badge>
              )}
              {task.priority && (
                <Badge className={projectTaskPriorityClasses[task.priority.toUpperCase()]}>
                  {task.priority}
                </Badge>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6 p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("form.labels.description")}</h4>
              <div dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(task.description || "No description provided."),
              }} className="text-muted-foreground text-sm prose dark:prose-invert max-w-none" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {task.dueDate && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t("form.labels.dueDate")}</h4>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(task.dueDate), "MMM d, yyyy - h:mm a")}
                  </p>
                </div>
              )}

              {task.storyPoints !== undefined && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t("points")}</h4>
                  <p className="text-muted-foreground text-sm">
                    {task.storyPoints}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {task.createdAt && (
                  <>
                    <h4 className="text-sm font-medium">Created At</h4>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(task.createdAt), "MMM d, yyyy")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* subtasks */}
          <div className="space-y-4 p-4">
            <h4 className="text-sm font-medium">Subtasks</h4>
            {task.subTasks && task.subTasks.length > 0 ? (
              <div className="space-y-2">
                {task.subTasks.map((subTask) => (
                  <div
                    key={subTask.id}
                    className="bg-muted flex items-center justify-between rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <span>{subTask.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      size="sm"
                      onClick={() => setSubTaskToDelete(subTask.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
                No subtasks yet
              </div>
            )}

            {!isAddingSubTask && task && (
              <div className="flex-1 flex justify-end mt-2">
                <Button variant="outline" size="sm" onClick={onAddSubTask}>
                  <PlusCircleIcon className="mr-1 size-4" />
                  <span>Create Subtask</span>
                </Button>
              </div>
            )}

            {isAddingSubTask && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex gap-2 items-end mt-2"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={tCommon("enterSubTaskTitle")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    <Check className="size-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setIsAddingSubTask(false);
                      form.reset();
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </form>
              </Form>
            )}
          </div>

          <Separator />

          {/* attachements */}
          <div className="space-y-2 p-4">
            <h4 className="text-sm font-medium">Attachments</h4>
            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((attachment, idx) => (
                  <AttachementPreview
                    key={idx}
                    attachment={attachment}
                    onViewAttachment={() => viewAttachment(attachment)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
                No attachments yet
              </div>
            )}
          </div>

          <Separator />

          {/* comments */}
          <div className="p-4">
            {task.comments && task.comments.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  Comments ({task.comments.length})
                </h4>
                <div className="space-y-2">
                  {task.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-muted group relative space-y-3 rounded-md p-3"
                    >
                      <p className="text-sm">{comment.comment}</p>
                      <div className="text-muted-foreground flex justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          {format(new Date(comment.createdAt), "MMM d, yyyy - h:mm a")}
                        </div>
                        <div className="absolute end-2 bottom-2 flex items-center opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setCommentToDelete(comment.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm mb-4">
                No comments yet
              </div>
            )}

            <div className="space-y-3 mt-4">
              <Form {...formComment}>
                <form
                  onSubmit={formComment.handleSubmit(onSubmitComment)}
                  className="space-y-3"
                >
                  <FormField
                    control={formComment.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={tCommon("upload.form.placeholders.comment")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex-1 flex justify-end">
                    <Button type="submit" disabled={isCommentPending}>
                      {tCommon("actions.createComment")}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </SheetContent>

        <CustomDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          title={tCommon("filePreview")}
          className="max-w-4xl max-h-[90vh] overflow-auto"
        >
          {previewUrl && (
            <div className="mt-4">
              <FilePreview preview={previewUrl} />
            </div>
          )}
        </CustomDialog>
      </Sheet>

      <DeletionConfirmationDialog
        isOpen={isDeleteTaskOpen}
        isPending={isDeletingTask}
        onOpenChange={(open) => !open && setIsDeleteTaskOpen(false)}
        onConfirm={handleDeleteTask}
        onCancel={() => setIsDeleteTaskOpen(false)}
        title={t("deletion.title")}
        description={t("deletion.description")}
      />

      <DeletionConfirmationDialog
        isOpen={!!subTaskToDelete}
        isPending={isDeletingSubTask}
        onOpenChange={(open) => !open && setSubTaskToDelete(null)}
        onConfirm={handleDeleteSubTask}
        onCancel={() => setSubTaskToDelete(null)}
        title={t("subtasks.deletion.title")}
        description={t("subtasks.deletion.description")}
      />

      <DeletionConfirmationDialog
        isOpen={!!commentToDelete}
        isPending={isDeletingComment}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
        onConfirm={handleDeleteComment}
        onCancel={() => setCommentToDelete(null)}
        title={t("comments.deletion.title")}
        description={t("comments.deletion.description")}
      />
    </>
  );
}

export default ProjectTaskDetailSheet;
