"use client";
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
import { businessUnitNamed } from "@/modules/projects/utils/badges/project-badges";
import { ProjectType } from "@/modules/projects/types/projects";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";
import useProjectUpload from "@/modules/projects/hooks/projects/use-project-upload";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectType;
}

export default function ProjectUploadSheet({ isOpen, onClose, project }: Props) {
  const t = useTranslations("modules.projects");
  const isEdit = !!project?.id;

  const { form, isPending, onSubmit, error } = useProjectUpload({
    project,
    onSuccess: () => {
      form.reset();
      onClose();
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit
              ? t("upload.updateProject.title", { defaultValue: "Update Project" })
              : t("upload.createProject.title", { defaultValue: "Create Project" })}
          </SheetTitle>
        </SheetHeader>

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 pt-2">

            {/* Name + Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.name", { defaultValue: "Name" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.name", { defaultValue: "Project name..." })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.displayOrder", { defaultValue: "Display Order" })}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.description", { defaultValue: "Description" })}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("upload.form.placeholders.description", { defaultValue: "Describe the project..." })} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Details */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.details", { defaultValue: "Details" })}</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={project?.contents?.[0]?.details || ""}
                      placeholder={t("upload.form.placeholders.details", { defaultValue: "Add detailed project information..." })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.language", { defaultValue: "Language" })}</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select language..." /></SelectTrigger>
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

            {/* Dates */}
            <TimeInput inputName="startDate" dateLabel={t("upload.form.labels.startDate", { defaultValue: "Start Date" })} timeLabel={t("upload.form.labels.startTime", { defaultValue: "Start Time" })} />
            <TimeInput inputName="endDate" dateLabel={t("upload.form.labels.endDate", { defaultValue: "End Date" })} timeLabel={t("upload.form.labels.endTime", { defaultValue: "End Time" })} />
            <TimeInput inputName="estimatedStartDate" dateLabel={t("upload.form.labels.estimatedStartDate", { defaultValue: "Estimated Start Date" })} timeLabel={t("upload.form.labels.estimatedStartTime", { defaultValue: "Estimated Start Time" })} />
            <TimeInput inputName="estimatedEndDate" dateLabel={t("upload.form.labels.estimatedEndDate", { defaultValue: "Estimated End Date" })} timeLabel={t("upload.form.labels.estimatedEndTime", { defaultValue: "Estimated End Time" })} />

            {/* Status / Type / BU */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
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

              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("list.filters.projectType", { defaultValue: "Project Type" })}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AGILE">Agile</SelectItem>
                        <SelectItem value="FREESTYLE">Freestyle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("list.filters.businessUnit", { defaultValue: "Business Unit" })}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="B. U." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TawerDev">{businessUnitNamed.TawerDev}</SelectItem>
                        <SelectItem value="TawerCreative">{businessUnitNamed.TawerCreative}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Manager — only shown on create */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.manager", { defaultValue: "Manager User ID" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.manager", { defaultValue: "UUID of the project manager..." })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Paid / Archived toggles */}
            <div className="flex flex-col gap-3 p-4 border rounded-md bg-muted/40">
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div>
                      <FormLabel className="text-sm font-medium">{t("upload.form.labels.paid", { defaultValue: "Paid Project" })}</FormLabel>
                      <p className="text-xs text-muted-foreground">{t("upload.form.hints.paid", { defaultValue: "This project is a paid engagement" })}</p>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {isEdit && (
                <FormField
                  control={form.control}
                  name="isArchived"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border-t pt-3">
                      <div>
                        <FormLabel className="text-sm font-medium">{t("upload.form.labels.isArchived", { defaultValue: "Archived" })}</FormLabel>
                        <p className="text-xs text-muted-foreground">{t("upload.form.hints.isArchived", { defaultValue: "Hide this project from the active list" })}</p>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {error !== "" && <ErrorBanner error={error} />}

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleClose} variant="secondary" disabled={isPending} type="button">
                {t("upload.form.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("upload.form.creating", { defaultValue: "Saving..." })
                  : isEdit
                    ? t("upload.form.updateProject", { defaultValue: "Update Project" })
                    : t("upload.form.createProject", { defaultValue: "Create Project" })}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
