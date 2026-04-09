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
  isOpen: boolean;
  onClose: () => void;
  sprint?: SprintType | null;
}

export default function SprintUploadSheet({ projectId, isOpen, onClose, sprint }: Props) {
  const t = useTranslations("modules.projects.sprints.upload");
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
          <SheetTitle>{isEdit ? t("updateTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 pt-2">

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.labels.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.placeholders.name")} {...field} />
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
                  <FormLabel>{t("form.labels.description")}</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={sprint?.description || ""}
                      placeholder={t("form.placeholders.description")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.labels.status")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Stopped">Stopped</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TimeInput inputName="startDate" dateLabel={t("form.labels.startDate")} timeLabel={t("form.labels.startTime")} />
            <TimeInput inputName="endDate" dateLabel={t("form.labels.endDate")} timeLabel={t("form.labels.endTime")} />
            <TimeInput inputName="estimatedStartDate" dateLabel={t("form.labels.estimatedStartDate")} timeLabel={t("form.labels.estimatedStartTime")} />
            <TimeInput inputName="estimatedEndDate" dateLabel={t("form.labels.estimatedEndDate")} timeLabel={t("form.labels.estimatedEndTime")} />

            {error !== "" && <ErrorBanner error={error} />}

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleClose} variant="secondary" disabled={isPending} type="button">
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEdit ? t("form.updating") : t("form.creating")
                  : isEdit ? t("form.update") : t("form.create")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
