import React from "react";
import { format } from "date-fns";
import { Check, Trash2, X, Edit, PlusCircleIcon, ClockIcon } from "lucide-react";
import FilePreview from "reactjs-file-preview";
import { statusClasses, priorityClasses } from "@/modules/tasks/utils/enum";
import DOMPurify from "dompurify";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import CustomDialog from "@/components/custom-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useTaskInfo from "../hooks/tasks/extraction/use-task";
import { FormField, FormItem, FormControl, FormMessage, Form } from "@/components/ui/form";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";
import useElementsDeletion from "@/hooks/use-elements-deletion";
import { useTranslations } from "next-intl";
import Loading from "@/components/page-loader";
import { ErrorBanner } from "@/components/error-banner";
import AttachementPreview from "./attachement-preview";
import { TaskType } from "../types/tasks";
import useTaskUpload from "../hooks/tasks/use-task-upload";
import useCommentUpload from "../hooks/tasks/use-comment-upload";
import { formatDateToFrontendFormat } from "@/utils/date";

interface TodoDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onEditClick?: (task: TaskType) => void;
}

export function TaskDetailSheet({
  isOpen,
  onClose,
  taskId,
  onEditClick
}: TodoDetailSheetProps) {
  const t = useTranslations("modules.tasks");

  const deletionHooks = {
    comment: useElementsDeletion("comment"),
    task: useElementsDeletion("task"),
    subTask: useElementsDeletion("subTask"),
  };

  const { task, taskIsLoading, taskError } = useTaskInfo({ id: taskId });
  const [isAddingSubTask, setIsAddingSubTask] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // subTasks
  const { form, onSubmit } = useTaskUpload({
    parentTaskId: taskId,
    onSuccess: () => {
      form.reset();
      setIsAddingSubTask(false);
    },
  });

  const { formComment, onSubmitComment, isPending: isCommentPending } = useCommentUpload({ taskId });
  const viewAttachment = (attachment: string) => {
    setPreviewUrl(attachment);
    setIsPreviewOpen(true);
  }

  const onAddSubTask = () => {
    if (task) {
      form.setValue("parentTaskId", taskId);
      form.setValue("dueTime", formatDateToFrontendFormat(task.dueTime))
      form.setValue("reminderTime", formatDateToFrontendFormat(task.reminderTime))
      setIsAddingSubTask(true);
    }

  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between pe-6">
            <SheetTitle className="">
              {task?.title}
            </SheetTitle>

            <div className="flex items-center gap-2">
              {onEditClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(task as TaskType)}
                >
                  <Edit className="mr-1 size-4" />
                  {t("edit")}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deletionHooks.task.removeElementDirectlyWithoutElementsSelection(task?.id as string)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 capitalize">
            {task && task.status &&
              <Badge className={statusClasses[task.status]}>{task.status.replace("-", " ")}</Badge>
            }

            {task && task.priority &&
              <Badge className={priorityClasses[task.priority]}>{task.priority}</Badge>
            }
          </div>
        </SheetHeader>

        {taskIsLoading ? (
          <Loading message={t("loading.task")} />
        ) : taskError ? (
          <ErrorBanner error={t("errors.loadTaskFailed")} />
        ) : (
          <>
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("upload.form.labels.description")}</h4>
                <p className="text-muted-foreground text-sm">
                  {task?.description || t("noDescription")}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("upload.form.labels.details")}</h4>
                <div dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(task?.details as string),
                }} className="text-muted-foreground text-sm" />
              </div>

              <div className="grid grid-cols-3">
                {/* <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assigned To</h4>
                  <p className="text-muted-foreground text-sm">{task?.assignedTo || "Unassigned"}</p>
                </div> */}
                {task && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{t("upload.form.labels.dueDate")}</h4>
                    <p className="text-muted-foreground text-sm">
                      {format(task.dueTime, "MMM d, yyyy - h:mm a")}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {task?.createdAt && (
                    <>
                      <h4 className="text-sm font-medium">{t("upload.form.labels.createdAt")}</h4>
                      <p className="text-muted-foreground text-sm">
                        {format(task.createdAt, "MMM d, yyyy - h:mm a")}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />
            {/* subtasks*/}
            <div className="space-y-4 p-4">
              <h4 className="text-sm font-medium">{t("upload.form.labels.subTasks")}</h4>
              {task?.subTasks && task.subTasks.length > 0 ? (
                <div className="space-y-2">
                  {task.subTasks.map((subTask) => (
                    <div
                      key={subTask.id}
                      className="bg-muted flex items-center justify-between rounded-md p-2">
                      <div className="flex items-center gap-2">
                        {/* <Checkbox
                          checked={subTask.completed}
                          onCheckedChange={(checked) =>
                            handleSubTaskToggle(subTask.id, Boolean(checked))
                          }
                        /> */}
                        <span
                        >
                          {subTask.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        size="sm"
                        onClick={() => deletionHooks.subTask.removeElementDirectlyWithoutElementsSelection(subTask.id)}>
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
                  {t("upload.form.labels.noSubTasks")}
                </div>
              )}

              {!isAddingSubTask && task && (<div className="flex-1 flex justify-end">
                <Button variant="outline" size="sm" onClick={onAddSubTask}>
                  <PlusCircleIcon />
                  <span>{t("actions.createSubTask")}</span>
                </Button>
              </div>)}


              {isAddingSubTask && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex gap-2 items-end"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>

                            <Input
                              {...field}
                              placeholder={t("enterSubTaskTitle")}
                            />

                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">
                      <Check />
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        setIsAddingSubTask(false);
                        form.reset();
                      }}
                    >
                      <X />
                    </Button>
                  </form>
                </Form>
              )}

            </div>

            <Separator />
            {/* attachements */}
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{t("upload.form.labels.attachments")}</h4>

              </div>

              {task?.attachments && task.attachments.length > 0 ? (
                <div className="space-y-2">
                  {task.attachments.map((attachment, idx) => <AttachementPreview key={idx} attachment={attachment} onViewAttachment={() => viewAttachment(attachment)} />)}
                </div>
              ) : (
                <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
                  {t("upload.form.labels.noAttachments")}
                </div>
              )}
            </div>

            {/* comments */}
            <Separator />
            <div className="p-4">
              {task?.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    {t("upload.form.labels.comments")} ({task.comments.length})
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
                              onClick={() => deletionHooks.comment.removeElementDirectlyWithoutElementsSelection(comment.id)}
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
                <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
                  {t("upload.form.labels.noComments")}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Form {...formComment}>
                <form
                  onSubmit={formComment.handleSubmit(onSubmitComment)}
                  className="p-4 mb-6 space-y-3"
                >
                  <FormField
                    control={formComment.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t("upload.form.placeholders.comment")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex-1 flex justify-end">
                    <Button type="submit" disabled={isCommentPending}>
                      {t("actions.createComment")}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <DeletionConfirmationDialog
              isOpen={deletionHooks.comment.alertModalIsOpen}
              onOpenChange={deletionHooks.comment.cancelDeletion}
              title={t("deletion.comments.confirmation.title")}
              description={t("deletion.comments.confirmation.message")}
              warning={deletionHooks.comment.warning}
              onCancel={deletionHooks.comment.cancelDeletion}
              onConfirm={deletionHooks.comment.deleteAllElements}
              isPending={deletionHooks.comment.isPending}
            />

            <DeletionConfirmationDialog
              isOpen={deletionHooks.task.alertModalIsOpen}
              onOpenChange={deletionHooks.task.cancelDeletion}
              title={t("deletion.tasks.confirmation.title")}
              description={t("deletion.tasks.confirmation.message")}
              warning={deletionHooks.task.warning}
              onCancel={deletionHooks.task.cancelDeletion}
              onConfirm={() => deletionHooks.task.deleteAllElements(() => {
                onClose()
              })}
              isPending={deletionHooks.task.isPending}
            />

            <DeletionConfirmationDialog
              isOpen={deletionHooks.subTask.alertModalIsOpen}
              onOpenChange={deletionHooks.subTask.cancelDeletion}
              title={t("deletion.subtasks.confirmation.title")}
              description={t("deletion.subtasks.confirmation.message")}
              warning={deletionHooks.subTask.warning}
              onCancel={deletionHooks.subTask.cancelDeletion}
              onConfirm={deletionHooks.subTask.deleteAllElements}
              isPending={deletionHooks.subTask.isPending}
            />
          </>
        )}
      </SheetContent>

      <CustomDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={t("filePreview")}
        className="max-w-4xl max-h-[90vh] overflow-auto"
      >
        {previewUrl && (
          <div className="mt-4">
            <FilePreview
              preview={previewUrl}
            />
          </div>
        )}
      </CustomDialog>
    </Sheet>
  );
}

export default TaskDetailSheet;
