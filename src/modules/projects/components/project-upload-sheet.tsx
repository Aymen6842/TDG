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
import { useEffect } from "react";
import { projectStatusClasses, projectTypeClasses, businessUnitClasses, businessUnitNamed } from "@/modules/projects/utils/badges/project-badges";
import { ProjectType } from "@/modules/projects/types/projects";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";
import useProjectUpload from "@/modules/projects/hooks/projects/use-project-upload";

interface ProjectCreationOrUpdateFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectType;
}

export default function ProjectUploadSheet({ isOpen, onClose, project }: ProjectCreationOrUpdateFormProps) {
  const t = useTranslations("modules.projects");

  const { form, isPending, onSubmit, error } = useProjectUpload({
    project,
    onSuccess: () => {
      form.reset();
      onClose();
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project?.name ?? "",
        description: project?.description ?? "",
        repositoryUrl: project?.repositoryUrl ?? "",
        liveUrl: project?.liveUrl ?? "",
        status: project?.status || "Pending",
        projectType: project?.projectType || "AGILE",
        businessUnit: project?.businessUnit || "",
        startTime: project.startTime ? new Date(project.startTime).toISOString() : new Date().toISOString(),
        endTime: project.endTime ? new Date(project.endTime).toISOString() : new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      });
    } else {
      const startTime = new Date();
      const endTime = new Date();

      startTime.setMinutes(0);
      endTime.setMinutes(0);

      endTime.setDate(endTime.getDate() + 7);
      form.reset({
        name: "",
        description: "",
        repositoryUrl: "",
        liveUrl: "",
        status: "Pending",
        projectType: "AGILE",
        businessUnit: "TawerDev",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    }
  }, [project, form]);

  const handleClose = () => {
    form.reset({
      name: "",
      description: "",
    });
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{project?.id ? t("upload.updateProject.title", { defaultValue: "Update Project" }) : t("upload.createProject.title", { defaultValue: "Create Project" })}</SheetTitle>
        </SheetHeader>
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-y-auto space-y-6 p-4 pt-0">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.name", { defaultValue: "Name" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.name", { defaultValue: "Enter project name..." })} {...field} />
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
                      <Input type="number" placeholder={t("upload.form.placeholders.displayOrder", { defaultValue: "0" })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.repositoryUrl", { defaultValue: "Repository URL" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.repositoryUrl", { defaultValue: "https://github.com/..." })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liveUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.liveUrl", { defaultValue: "Live URL" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.liveUrl", { defaultValue: "https://example.com" })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.language", { defaultValue: "Language" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.language", { defaultValue: "e.g. English" })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <TimeInput inputName="startTime" dateLabel={t("upload.form.labels.startDate", { defaultValue: "Start Date" })} timeLabel={t("upload.form.labels.startTime", { defaultValue: "Start Time" })} />
            <TimeInput inputName="endTime" dateLabel={t("upload.form.labels.endDate", { defaultValue: "End Date" })} timeLabel={t("upload.form.labels.endTime", { defaultValue: "End Time" })} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("list.tabs.all", { defaultValue: "Status" }).replace("All", "")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Running">Running</SelectItem>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="B. U." />
                        </SelectTrigger>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/40">
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t("upload.form.labels.paid", { defaultValue: "Paid Project" })}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t("upload.form.labels.isArchived", { defaultValue: "Archived" })}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {error !== "" && <ErrorBanner error={error} />}

            <div className="flex-1 flex justify-end gap-2 pt-4">
              <Button onClick={handleClose} variant="secondary" disabled={isPending} type="button">
                {t("upload.form.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("upload.form.creating", { defaultValue: "Creating..." }) : (project ? t("upload.form.updateProject", { defaultValue: "Update Project" }) : t("upload.form.createProject", { defaultValue: "Create Project" }))}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
