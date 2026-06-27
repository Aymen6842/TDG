"use client";
import React from "react";
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
import { Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { DotBadgeSelectItem } from "../../shared/dot-badge-option";
import {
  ProjectTaskType,
  EnumProjectTaskType,
  EnumProjectTaskStatus,
  EnumProjectTaskPriority
} from "@/modules/projects/types/project-tasks";
import { ProjectType } from "@/modules/projects/types/projects";
import useProjectTaskUpload from "../../../hooks/tasks/use-project-task-upload";
import {
  projectTaskStatusDotColors,
  projectTaskPriorityDotColors,
  projectTaskTypeDotColors
} from "../../../utils/badges/project-task-badges";
import AttachementUpload from "@/modules/projects/components/project-detail/project-task/attachments";
import useTaskStatuses from "@/modules/projects/hooks/task-statuses/use-task-statuses";
import useEpics from "@/modules/projects/hooks/epics/use-epics";
import useMilestones from "@/modules/projects/hooks/milestones/use-milestones";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import useProject from "@/modules/projects/hooks/projects/use-project";

const UNSET = "__none__";

// ─── Status dropdown — custom statuses or enum fallback ──────────────────────

function StatusSelect({
  projectId,
  value,
  onValueChange,
  isAgile,
}: {
  projectId: string;
  value: string;
  onValueChange: (v: string) => void;
  isAgile: boolean;
}) {
  const { taskStatuses, taskStatusesAreLoading } = useTaskStatuses(projectId);
  const t = useTranslations("modules.projects.tasks");
  const hasCustom = taskStatuses.length > 0;

  return (
    <Select onValueChange={onValueChange} value={value} disabled={taskStatusesAreLoading}>
      <FormControl>
        <SelectTrigger className="w-full">
          {taskStatusesAreLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </span>
          ) : (
            <SelectValue placeholder={t("upload.form.placeholders.selectStatus")} />
          )}
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {hasCustom
          ? taskStatuses.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
              </SelectItem>
            ))
          : Object.values(EnumProjectTaskStatus)
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
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: ProjectType;
  isOpen: boolean;
  onClose: () => void;
  task?: ProjectTaskType | null;
  isAgile: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectTaskUploadSheet({
  project,
  isOpen,
  onClose,
  task,
  isAgile,
}: Props) {
  const t = useTranslations("modules.projects.tasks");
  const projectId = project.id;

  const [resetFilesTrigger, setResetFilesTrigger] = React.useState(0);

  const { form, isPending, onSubmit, error } = useProjectTaskUpload({
    projectId,
    task,
    isAgile,
    onSuccess: () => {
      setResetFilesTrigger((n) => n + 1);
      onClose();
    },
  });

  // Data for optional dropdowns
  const { project: loadedProject } = useProject(projectId);
  const members = loadedProject?.members ?? project.members ?? [];
  const { milestones } = useMilestones(projectId);
  const { epics } = useEpics(projectId);
  const { sprints } = useProjectSprints(projectId);

  const handleClose = () => {
    form.reset();
    setResetFilesTrigger((n) => n + 1);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>
            {task?.id ? t("actions.updateTask") : t("actions.createTask")}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="overflow-y-auto space-y-5 px-6 pb-6 flex-1"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.title")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.title")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
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

            {/* Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.type")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                        <SelectTrigger>
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

            {/* Status + Story Points */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status: shown on create only — on edit it's managed from the task detail sheet */}
              {!task?.id ? (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                      <StatusSelect
                        projectId={projectId}
                        value={field.value}
                        onValueChange={field.onChange}
                        isAgile={isAgile}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("upload.form.labels.status")}</p>
                  <p className="text-xs text-muted-foreground bg-muted rounded px-3 py-2">
                    Change status from the task detail view
                  </p>
                </div>
              )}

              {isAgile && (
                <FormField
                  control={form.control}
                  name="storyPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upload.form.labels.points")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder={t("upload.form.placeholders.points")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Assignee + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      value={field.value || UNSET}
                      onValueChange={(v) => field.onChange(v === UNSET ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UNSET}>Unassigned</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.userId} value={m.userId}>
                            {m.user?.name ?? m.userId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.dueDate", { defaultValue: "Due Date" })}</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? new Date(e.target.value).toISOString() : "")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Milestone */}
            <FormField
              control={form.control}
              name="milestoneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone</FormLabel>
                  <Select
                    value={field.value || UNSET}
                    onValueChange={(v) => field.onChange(v === UNSET ? "" : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No milestone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNSET}>No milestone</SelectItem>
                      {milestones.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Epic + Sprint — AGILE only */}
            {isAgile && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="epicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Epic</FormLabel>
                      <Select
                        value={field.value || UNSET}
                        onValueChange={(v) => field.onChange(v === UNSET ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No epic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UNSET}>No epic</SelectItem>
                          {epics.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              <span className="flex items-center gap-2">
                                {e.color && (
                                  <span
                                    className="inline-block size-2 rounded-full"
                                    style={{ backgroundColor: e.color }}
                                  />
                                )}
                                {e.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sprintId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint</FormLabel>
                      <Select
                        value={field.value || UNSET}
                        onValueChange={(v) => field.onChange(v === UNSET ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No sprint" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UNSET}>No sprint</SelectItem>
                          {sprints.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Attachments */}
            <AttachementUpload
              inputName="attachments"
              previews={task?.attachments?.map((a) => a.file) || []}
              resetTrigger={resetFilesTrigger}
            />

            {error && <ErrorBanner error={error} />}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" onClick={handleClose} variant="secondary" disabled={isPending}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("actions.creating")
                  : task?.id
                  ? t("actions.updateTask")
                  : t("actions.createTask")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
