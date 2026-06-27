"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import TextEditor from "@/components/ui/text-editor";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { SprintType } from "@/modules/projects/types/project-sprints";
import TimeInput from "@/components/time-input";
import useSprintUpload from "@/modules/projects/hooks/sprints/use-sprint-upload";

interface Props {
  projectId: string;
  projectStartDate: Date;
  projectEndDate: Date;
  isOpen: boolean;
  onClose: () => void;
  sprint?: SprintType | null;
}

export default function SprintUploadSheet({ projectId, projectStartDate, projectEndDate, isOpen, onClose, sprint }: Props) {
  const t = useTranslations("modules.projects.sprints");
  const isEdit = !!sprint?.id;

  const { form, isPending, onSubmit, error } = useSprintUpload({
    projectId,
    sprint,
    onSuccess: () => { form.reset(); onClose(); },
  });

  const handleClose = () => { form.reset(); onClose(); };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? t("upload.updateTitle") : t("upload.createTitle")}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 pt-2">

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.name")} {...field} />
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
                      initialContent={sprint?.description || ""}
                      placeholder={t("upload.form.placeholders.description")}
                      {...field}
                    />
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
                      initialContent={sprint?.details || ""}
                      placeholder={t("upload.form.placeholders.details", { defaultValue: "Add detailed sprint information..." })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language select — keeping for later
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.labels.language", { defaultValue: "Language" })}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                const hidePending = isEdit && sprint?.status !== "Pending";
                return (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!hidePending && <SelectItem value="Pending">{t("status.pending")}</SelectItem>}
                        <SelectItem value="Running">{t("status.running")}</SelectItem>
                        <SelectItem value="Stopped">{t("status.stopped")}</SelectItem>
                        <SelectItem value="Completed">{t("status.completed")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.capacity", { defaultValue: "Capacity" })}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={t("upload.form.placeholders.capacity", { defaultValue: "e.g. 40" })}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TimeInput inputName="startDate" dateLabel={t("upload.form.labels.startDate")} timeLabel={t("upload.form.labels.startTime")} minDate={projectStartDate} maxDate={projectEndDate} />
            <TimeInput inputName="endDate" dateLabel={t("upload.form.labels.endDate")} timeLabel={t("upload.form.labels.endTime")} minDate={projectStartDate} maxDate={projectEndDate} />
            <TimeInput inputName="estimatedStartDate" dateLabel={t("upload.form.labels.estimatedStartDate")} timeLabel={t("upload.form.labels.estimatedStartTime")} minDate={projectStartDate} maxDate={projectEndDate} />
            <TimeInput inputName="estimatedEndDate" dateLabel={t("upload.form.labels.estimatedEndDate")} timeLabel={t("upload.form.labels.estimatedEndTime")} minDate={projectStartDate} maxDate={projectEndDate} />

            {error !== "" && <ErrorBanner error={error} />}

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleClose} variant="secondary" disabled={isPending} type="button">
                {t("upload.form.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEdit ? t("upload.form.updating") : t("upload.form.creating")
                  : isEdit ? t("upload.form.update") : t("upload.form.create")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
