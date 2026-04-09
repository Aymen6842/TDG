"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/ui/text-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { DotBadgeSelectItem } from "../../shared/dot-badge-option";
import { ProjectTaskType, EnumProjectTaskType, EnumProjectTaskStatus, EnumProjectTaskPriority } from "@/modules/projects/types/project-tasks";
import useProjectTaskUpload from "../../../hooks/tasks/use-project-task-upload";
import { projectTaskStatusDotColors, projectTaskPriorityDotColors, projectTaskTypeDotColors } from "../../../utils/badges/project-task-badges";
import AttachementUpload from "@/modules/projects/components/project-detail/project-task/attachments";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  task?: ProjectTaskType | null;
  isAgile: boolean;
}

export default function ProjectTaskUploadSheet({
  projectId,
  isOpen,
  onClose,
  task,
  isAgile
}: Props) {
  const t = useTranslations("modules.projects.tasks");

  const [resetFilesTrigger, setResetFilesTrigger] = React.useState(0);

  const { form, isPending, onSubmit, error } = useProjectTaskUpload({
    projectId,
    task,
    onSuccess: () => {
      setResetFilesTrigger(t => t + 1);
      onClose();
    }
  });

  const handleClose = () => {
    form.reset();
    setResetFilesTrigger(t => t + 1);
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>
            {task?.id ? t("actions.updateTask") : t("actions.createTask")}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-y-auto space-y-6 p-6 pt-0 flex-1">
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
                    <TextEditor
                      placeholder={t("upload.form.placeholders.description")}
                      initialContent={task?.description || ""}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.type")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EnumProjectTaskType).map((type) => (
                          <DotBadgeSelectItem
                            key={type}
                            value={type}
                            dotColorClass={projectTaskTypeDotColors[type.toUpperCase()]}
                            label={t(`types.${type.toLowerCase()}`)}
                          />
                        ))}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectPriority")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EnumProjectTaskPriority).map((p) => (
                          <DotBadgeSelectItem
                            key={p}
                            value={p}
                            dotColorClass={projectTaskPriorityDotColors[p.toUpperCase()]}
                            label={t(`priorityLabels.${p.toLowerCase()}`)}
                          />
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectStatus")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EnumProjectTaskStatus)
                          .filter((s) => isAgile || !["TESTING", "IN_REVIEW"].includes(s))
                          .map((s) => (
                            <DotBadgeSelectItem
                              key={s}
                              value={s}
                              dotColorClass={projectTaskStatusDotColors[s.toUpperCase()]}
                              label={t(`statusLabels.${s.toLowerCase()}`)}
                            />
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAgile && (
                <FormField
                  control={form.control}
                  name="storyPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upload.form.labels.points")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t("upload.form.placeholders.points")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.dueDate", { defaultValue: "Due Date" })}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : "")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AttachementUpload
              inputName="attachments"
              previews={task?.attachments || []}
              resetTrigger={resetFilesTrigger}
            />

            {error && <ErrorBanner error={error} />}

            <div className="flex-1 flex justify-end gap-2 pt-2 border-t">
              <Button type="button" onClick={handleClose} variant="secondary" disabled={isPending}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("actions.creating") : (task?.id ? t("actions.updateTask") : t("actions.createTask"))}
              </Button>
            </div>

          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
