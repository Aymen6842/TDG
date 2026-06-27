"use client";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorBanner } from "@/components/error-banner";
import { ReminderType, ChannelType } from "@/modules/reminders/types/reminders";
import useReminderUpload from "@/modules/reminders/hooks/use-reminder-upload";

const CHANNELS: ChannelType[] = ["EMAIL", "TELEGRAM", "PUSH", "NTFY"];

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  reminder?: ReminderType | null;
  currentUserId?: string;
}

export default function ReminderUploadSheet({ projectId, isOpen, onClose, reminder, currentUserId }: Props) {
  const { form, isPending, onSubmit, error, isEdit } = useReminderUpload({
    projectId,
    reminder,
    currentUserId,
    onSuccess: onClose,
  });

  const isRecurring = form.watch("isRecurring");

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{reminder?.id ? "Edit Reminder" : "Create Reminder"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-5 px-6 pb-6">
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl><Textarea placeholder="Reminder message (optional)" className="min-h-[80px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="reminderAt" render={({ field }) => (
              <FormItem>
                <FormLabel>Remind At *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {!isEdit && (
              <>
                <FormField control={form.control} name="channels" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channels *</FormLabel>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                      {CHANNELS.map((ch) => (
                        <label key={ch} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={field.value?.includes(ch)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              field.onChange(checked ? [...current, ch] : current.filter((c) => c !== ch));
                            }}
                          />
                          <span className="text-sm">{ch}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="entityType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select value={field.value ?? "CUSTOM"} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Custom" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                          <SelectItem value="TASK">Task</SelectItem>
                          <SelectItem value="SPRINT">Sprint</SelectItem>
                          <SelectItem value="MILESTONE">Milestone</SelectItem>
                          <SelectItem value="PROJECT">Project</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="entityId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity ID</FormLabel>
                      <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </>
            )}

            <FormField control={form.control} name="isRecurring" render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  <span className="text-sm font-medium">Recurring reminder</span>
                </label>
              </FormItem>
            )} />

            {isRecurring && (
              <FormField control={form.control} name="recurrenceRule" render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence Rule (cron) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 0 9 * * *"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {error && <ErrorBanner error={error} />}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : reminder?.id ? "Update Reminder" : "Create Reminder"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
