import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { useEffect, useState } from "react";
import { priorityDotColors, statusDotColors } from "@/modules/tasks/utils/enum";
import AttachementUpload from "./attachments";
import { TaskType } from "@/modules/tasks/types/tasks";
import { Textarea } from "@/components/ui/textarea";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";
import { formatDateToFrontendFormat } from "@/utils/date";
import useTaskUpload from "@/modules/tasks/hooks/tasks/use-task-upload";

interface TaskCreationOrUpdateFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskType;
}

export default function TaskUploadForm({ isOpen, onClose, task }: TaskCreationOrUpdateFormProps) {
  const t = useTranslations("modules.projects.tasks");

  const [resetFilesTrigger, setResetFilesTrigger] = useState(0)
  const { form, isPending, onSubmit, error } = useTaskUpload({
    task,
    onSuccess: () => {
      form.reset();
      setResetFilesTrigger(trigger => trigger + 1);
      onClose();
    },
  });


  useEffect(() => {
    if (task) {
      form.reset({
        archived: task?.archived,
        status: task?.status,
        priority: task?.priority,
        dueTime: formatDateToFrontendFormat(task.dueTime),
        reminderTime: formatDateToFrontendFormat(task.reminderTime),
        parentTaskId: task?.parentTaskId,
        title: task?.title ?? "",
        description: task?.description ?? "",
        details: task?.details ?? "",
      });
    } else {
      const reminderTime = new Date();
      const dueTime = new Date();

      reminderTime.setMinutes(0)
      dueTime.setMinutes(0)

      dueTime.setHours(dueTime.getHours() + 1);
      form.reset({
        reminderTime: reminderTime.toISOString(),
        dueTime: dueTime.toISOString()
      })
    }
  }, [task]);

  const handleClose = () => {
    form.reset({
      title: "",
      description: "",
      details: "",
    });
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{task?.id ? t("actions.updateTask") : t("actions.createTask")}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-y-auto space-y-6 p-4 pt-0">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.title")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.description")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("upload.form.placeholders.description")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.details")}</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={task?.details || ""}
                      placeholder={t("upload.form.placeholders.details")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TimeInput inputName="dueTime" dateLabel={t("upload.form.labels.dueDate")} timeLabel={t("upload.form.labels.dueTime")} />
            <TimeInput inputName="reminderTime" dateLabel={t("upload.form.labels.reminderDate")} timeLabel={t("upload.form.labels.reminderTime")} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.status")}</FormLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.status")} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="Pending">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              statusDotColors.Pending
                            )}></span>
                          {t("status.pending")}
                        </SelectItem>
                        <SelectItem value="InProgress">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              statusDotColors.InProgress
                            )}></span>
                          {t("status.inProgress")}
                        </SelectItem>
                        <SelectItem value="Completed">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              statusDotColors.Completed
                            )}></span>
                          {t("status.completed")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.priority")}</FormLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.priority")} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="Low">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              priorityDotColors.Low
                            )}></span>
                          {t("priority.low")}
                        </SelectItem>
                        <SelectItem value="Medium">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              priorityDotColors.Medium
                            )}></span>
                          {t("priority.medium")}
                        </SelectItem>
                        <SelectItem value="High">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              priorityDotColors.High
                            )}></span>
                          {t("priority.high")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AttachementUpload inputName="attachments" previews={task?.attachments || []} resetTrigger={resetFilesTrigger} />

            {error !== "" && <ErrorBanner error={error} />}

            <div className="flex-1 flex justify-end gap-2">
              <Button onClick={handleClose} variant="secondary" disabled={isPending}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("loading.button") : (task ? t("actions.updateTask") : t("actions.createTask"))}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
