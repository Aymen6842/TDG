"use client";
import React from "react";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ErrorBanner } from "@/components/error-banner";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { EmptyState } from "../../shared/empty-state";
import Loading from "@/components/page-loader";
import { TaskStatusType } from "@/modules/projects/types/project-task-statuses";
import useTaskStatuses from "@/modules/projects/hooks/task-statuses/use-task-statuses";
import useTaskStatusUpload from "@/modules/projects/hooks/task-statuses/use-task-status-upload";

interface Props {
  projectId: string;
}

function StatusUploadSheet({ projectId, isOpen, onClose, status, defaultOrder }: {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  status?: TaskStatusType | null;
  defaultOrder: number;
}) {
  const { form, isPending, onSubmit, error } = useTaskStatusUpload({
    projectId,
    status,
    defaultOrder,
    onSuccess: onClose,
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-sm p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{status?.id ? "Edit Status" : "Create Status"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-5 px-6 pb-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input placeholder="e.g. In Review" disabled={status?.isSystem} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="color" render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <div className="flex items-center gap-2">
                  <input type="color" value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={status?.isSystem} className="h-9 w-12 cursor-pointer rounded border p-0.5 disabled:opacity-50" />
                  <FormControl><Input placeholder="#000000" disabled={status?.isSystem} {...field} className="flex-1" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="order" render={({ field }) => (
              <FormItem>
                <FormLabel>Order *</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {error && <ErrorBanner error={error} />}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : status?.id ? "Update" : "Create"}</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default function ProjectTaskStatuses({ projectId }: Props) {
  const { taskStatuses, taskStatusesAreLoading } = useTaskStatuses(projectId);
  const { deleteStatusFromProject, isPending } = useTaskStatusUpload({ projectId });
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editStatus, setEditStatus] = React.useState<TaskStatusType | null>(null);
  const [statusToDelete, setStatusToDelete] = React.useState<TaskStatusType | null>(null);

  const sorted = [...taskStatuses].sort((a, b) => a.order - b.order);

  const handleDelete = async () => {
    if (!statusToDelete) return;
    await deleteStatusFromProject(statusToDelete.id);
    setStatusToDelete(null);
  };

  if (taskStatusesAreLoading) return <Loading />;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Custom Task Statuses</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Define workflow stages for tasks in this project.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setEditStatus(null); setIsSheetOpen(true); }}>
            <Plus className="size-3.5 mr-1" /> Add Status
          </Button>
        </div>

        {sorted.length === 0 ? (
          <EmptyState message="No custom statuses. Tasks use default statuses." />
        ) : (
          <div className="space-y-1.5">
            {sorted.map((status) => (
              <div key={status.id} className="group flex items-center gap-3 rounded-md border px-3 py-2 hover:border-primary/40 transition-colors">
                <GripVertical className="size-4 text-muted-foreground/40 flex-shrink-0" />
                <span className="inline-block size-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                <span className="text-sm font-medium flex-1 truncate">{status.name}</span>
                <span className="text-xs text-muted-foreground">order: {status.order}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => { setEditStatus(status); setIsSheetOpen(true); }}>
                    <Edit2 className="size-3.5" />
                  </Button>
                  {!status.isSystem && (
                    <Button variant="ghost" size="sm" className="size-7 p-0 text-destructive" onClick={() => setStatusToDelete(status)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StatusUploadSheet
        projectId={projectId}
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); setEditStatus(null); }}
        status={editStatus}
        defaultOrder={taskStatuses.length > 0 ? Math.max(...taskStatuses.map(s => s.order)) + 1 : 1}
      />

      <ConfirmDialog
        open={!!statusToDelete}
        onOpenChange={(open) => !open && setStatusToDelete(null)}
        title="Delete Status"
        description={`Delete status "${statusToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setStatusToDelete(null)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
