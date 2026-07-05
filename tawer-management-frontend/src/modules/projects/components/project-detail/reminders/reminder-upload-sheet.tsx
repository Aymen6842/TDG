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
import { useTranslations } from "next-intl";
import { ReminderType, ChannelType } from "@/modules/reminders/types/reminders";
import useReminderUpload from "@/modules/reminders/hooks/use-reminder-upload";
import ReminderEntityPicker from "./reminder-entity-picker";
import ReminderEntityLabel from "./reminder-entity-label";

const CHANNELS: ChannelType[] = ["EMAIL", "TELEGRAM", "PUSH", "NTFY"];

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  reminder?: ReminderType | null;
  currentUserId?: string;
}

export default function ReminderUploadSheet({ projectId, isOpen, onClose, reminder, currentUserId }: Props) {
  const t = useTranslations("modules.reminders");
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
          <SheetTitle>{reminder?.id ? t("upload.editTitle") : t("upload.createTitle")}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-5 px-6 pb-6">
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.messageLabel")}</FormLabel>
                <FormControl><Textarea placeholder={t("upload.messagePlaceholder")} className="min-h-[80px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="reminderAt" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.remindAtLabel")}</FormLabel>
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

            {isEdit && reminder?.entityType && (
              <div className="grid grid-cols-2 gap-3">
                <FormItem>
                  <FormLabel>{t("upload.entityTypeLabel")}</FormLabel>
                  <p className="text-sm text-muted-foreground mt-2">{t(`entityTypes.${reminder.entityType.toLowerCase()}`)}</p>
                </FormItem>
                {reminder.entityType !== "CUSTOM" && reminder.entityType !== "PROJECT" && (
                  <FormItem>
                    <FormLabel>{t("upload.linkedLabel", { entity: t(`entityTypes.${reminder.entityType.toLowerCase()}`) })}</FormLabel>
                    <p className="text-sm text-muted-foreground mt-2 truncate">
                      <ReminderEntityLabel projectId={projectId} entityType={reminder.entityType} entityId={reminder.entityId} />
                    </p>
                  </FormItem>
                )}
              </div>
            )}

            {!isEdit && (
              <>
                <FormField control={form.control} name="channels" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.channelsLabel")}</FormLabel>
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
                      <FormLabel>{t("upload.entityTypeLabel")}</FormLabel>
                      <Select
                        value={field.value ?? "CUSTOM"}
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("entityId", "");
                        }}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t("entityTypes.custom")} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CUSTOM">{t("entityTypes.custom")}</SelectItem>
                          <SelectItem value="TASK">{t("entityTypes.task")}</SelectItem>
                          <SelectItem value="SPRINT">{t("entityTypes.sprint")}</SelectItem>
                          <SelectItem value="MILESTONE">{t("entityTypes.milestone")}</SelectItem>
                          <SelectItem value="PROJECT">{t("entityTypes.project")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="entityId" render={({ field }) => {
                    const entityType = form.watch("entityType") ?? "CUSTOM";
                    if (entityType === "CUSTOM" || entityType === "PROJECT") {
                      return (
                        <FormItem>
                          <FormLabel>{t("upload.entityIdLabel")}</FormLabel>
                          <FormControl><Input placeholder={t("upload.entityIdPlaceholder")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }
                    return (
                      <FormItem>
                        <FormLabel>{t("upload.linkedLabel", { entity: t(`entityTypes.${entityType.toLowerCase()}`) })}</FormLabel>
                        <FormControl>
                          <ReminderEntityPicker
                            projectId={projectId}
                            entityType={entityType}
                            value={field.value}
                            onChange={(id) => field.onChange(id ?? "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }} />
                </div>
              </>
            )}

            <FormField control={form.control} name="isRecurring" render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  <span className="text-sm font-medium">{t("upload.recurringLabel")}</span>
                </label>
              </FormItem>
            )} />

            {isRecurring && (
              <FormField control={form.control} name="recurrenceRule" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.recurrenceRuleLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("upload.recurrenceRulePlaceholder")}
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
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>{t("upload.cancel")}</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("upload.saving") : reminder?.id ? t("upload.update") : t("upload.create")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
