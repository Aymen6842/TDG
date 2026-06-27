"use client";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ErrorBanner } from "@/components/error-banner";
import { MilestoneType } from "@/modules/projects/types/project-milestones";
import useMilestoneUpload from "@/modules/projects/hooks/milestones/use-milestone-upload";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  milestone?: MilestoneType | null;
}

export default function MilestoneUploadSheet({ projectId, isOpen, onClose, milestone }: Props) {
  const { form, isPending, onSubmit, error } = useMilestoneUpload({
    projectId,
    milestone,
    onSuccess: onClose,
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{milestone?.id ? "Edit Milestone" : "Create Milestone"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-5 px-6 pb-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input placeholder="Milestone name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Optional description" className="min-h-[80px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {error && <ErrorBanner error={error} />}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : milestone?.id ? "Update Milestone" : "Create Milestone"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
