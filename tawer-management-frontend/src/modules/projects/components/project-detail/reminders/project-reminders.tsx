"use client";
import React from "react";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { EmptyState } from "../../shared/empty-state";
import Loading from "@/components/page-loader";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { ProjectType } from "@/modules/projects/types/projects";
import { ReminderType } from "@/modules/reminders/types/reminders";
import useReminders from "@/modules/reminders/hooks/use-reminders";
import useReminderUpload from "@/modules/reminders/hooks/use-reminder-upload";
import ReminderUploadSheet from "./reminder-upload-sheet";

const CHANNEL_COLORS: Record<string, string> = {
  EMAIL: "bg-blue-100 text-blue-700",
  TELEGRAM: "bg-sky-100 text-sky-700",
  PUSH: "bg-purple-100 text-purple-700",
  NTFY: "bg-orange-100 text-orange-700",
};

interface Props {
  project: ProjectType;
}

export default function ProjectReminders({ project }: Props) {
  const { user } = useCurrentUser();
  const { reminders, remindersAreLoading } = useReminders(project.id);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editReminder, setEditReminder] = React.useState<ReminderType | null>(null);
  const [reminderToDelete, setReminderToDelete] = React.useState<ReminderType | null>(null);

  const { deleteReminderFromProject, isPending: isDeleting } = useReminderUpload({ projectId: project.id });

  const handleDelete = async () => {
    if (!reminderToDelete) return;
    await deleteReminderFromProject(reminderToDelete.id);
    setReminderToDelete(null);
  };

  if (remindersAreLoading) return <Loading />;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reminders</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={() => { setEditReminder(null); setIsSheetOpen(true); }} className="fixed end-6 bottom-6 z-10 rounded-full! md:size-14">
                  <Plus className="md:size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left"><p>Add Reminder</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {reminders.length === 0 ? (
          <EmptyState message="No reminders yet. Create one to get notified before deadlines." />
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="group flex items-start gap-3 rounded-lg border px-4 py-3 hover:border-primary/40 transition-colors">
                <Bell className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{reminder.message || "(No message)"}</p>
                    {reminder.isRecurring && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <RefreshCw className="size-3" /> {reminder.recurrenceRule ?? "recurring"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reminder.reminderAt
                      ? format(new Date(reminder.reminderAt), "MMM d, yyyy - h:mm a")
                      : "—"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(reminder.channels ?? []).map((ch) => (
                      <span key={ch.id ?? ch.channel} className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${CHANNEL_COLORS[ch.channel] ?? "bg-muted text-muted-foreground"}`}>{ch.channel}</span>
                    ))}
                    {reminder.entityType && reminder.entityType !== "CUSTOM" && (
                      <Badge variant="outline" className="text-xs">{reminder.entityType}</Badge>
                    )}
                    {reminder.status && (
                      <Badge variant="secondary" className="text-xs">{reminder.status}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => { setEditReminder(reminder); setIsSheetOpen(true); }}>
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="size-7 p-0 text-destructive" onClick={() => setReminderToDelete(reminder)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReminderUploadSheet
        key={editReminder?.id ?? "create"}
        projectId={project.id}
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); setEditReminder(null); }}
        reminder={editReminder}
        currentUserId={user?.id}
      />

      <ConfirmDialog
        open={!!reminderToDelete}
        onOpenChange={(open) => !open && setReminderToDelete(null)}
        title="Delete Reminder"
        description={`Delete "${reminderToDelete?.message || 'this reminder'}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setReminderToDelete(null)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
