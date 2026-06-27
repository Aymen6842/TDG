"use client";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ErrorBanner } from "@/components/error-banner";
import { EpicType } from "@/modules/projects/types/project-epics";
import useEpicUpload from "@/modules/projects/hooks/epics/use-epic-upload";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  epic?: EpicType | null;
}

export default function EpicUploadSheet({ projectId, isOpen, onClose, epic }: Props) {
  const { form, isPending, onSubmit, error } = useEpicUpload({
    projectId,
    epic,
    onSuccess: onClose,
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{epic?.id ? "Edit Epic" : "Create Epic"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-5 px-6 pb-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input placeholder="Epic name" {...field} /></FormControl>
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
            <FormField control={form.control} name="color" render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={field.value || "#6366f1"}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border p-0.5"
                  />
                  <FormControl><Input placeholder="#6366f1" {...field} className="flex-1" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
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
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
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
            </div>
            {error && <ErrorBanner error={error} />}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : epic?.id ? "Update Epic" : "Create Epic"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
