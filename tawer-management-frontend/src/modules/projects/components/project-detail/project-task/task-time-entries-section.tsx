"use client";
import React from "react";
import { format } from "date-fns";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import useTimeEntries from "@/modules/projects/hooks/time-entries/use-time-entries";
import useTimeEntryUpload from "@/modules/projects/hooks/time-entries/use-time-entry-upload";

interface Props {
  projectId: string;
  taskId: string;
}

export function TaskTimeEntriesSection({ projectId, taskId }: Props) {
  const t = useTranslations("modules.projects.taskSections.timeEntries");
  const { timeEntries, timeEntriesAreLoading } = useTimeEntries(projectId, taskId);
  const { deleteTimeEntryFromTask } = useTimeEntryUpload({ projectId, taskId });

  const [adding, setAdding] = React.useState(false);
  const [hours, setHours] = React.useState("");
  const [description, setDescription] = React.useState("");
  const { onSubmit: submitEntry, isPending, form } = useTimeEntryUpload({ projectId, taskId });

  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(1);

  async function handleAdd() {
    const h = parseFloat(hours);
    if (!h || h <= 0) return;
    form.setValue("hours", h);
    form.setValue("description", description);
    await form.handleSubmit(submitEntry)();
    setHours("");
    setDescription("");
    setAdding(false);
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <Clock className="size-3.5" /> {t("title")}
          {timeEntries.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("totalSuffix", { hours: totalHours })}
            </span>
          )}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setAdding((p) => !p)}
        >
          <Plus className="size-3.5 mr-1" /> {t("logTime")}
        </Button>
      </div>

      {adding && (
        <div className="space-y-2 bg-muted/50 rounded p-3">
          <div>
            <Label className="text-xs mb-1 block">{t("hoursLabel")}</Label>
            <Input
              type="number"
              min={0.01}
              step={0.25}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="h-8 text-sm"
              placeholder={t("hoursPlaceholder")}
            />
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            className="text-sm min-h-[50px]"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              {t("cancel")}
            </Button>
            <Button size="sm" disabled={isPending} onClick={handleAdd}>
              {t("save")}
            </Button>
          </div>
        </div>
      )}

      {timeEntriesAreLoading ? (
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      ) : timeEntries.length > 0 ? (
        <div className="space-y-1">
          {timeEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-muted rounded px-3 py-1.5 group"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{entry.hours}h</p>
                {entry.description && (
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(entry.createdAt, "MMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="size-6 p-0 text-destructive opacity-0 group-hover:opacity-100"
                onClick={() => deleteTimeEntryFromTask(entry.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !adding && (
          <p className="text-xs text-muted-foreground">{t("empty")}</p>
        )
      )}
    </div>
  );
}
