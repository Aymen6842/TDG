"use client";;
import { useEffect } from "react";
import { RiDeleteBinLine } from "@remixicon/react";
import { useTranslations } from "next-intl";

import type { CalendarEventType, EventColor } from ".";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEventStore } from "../../store/events";
import useEventUpload from "../../hooks/event-actions/use-event-upload";
import UsersExtractionInput from "@/modules/users/components/users-extraction-input";
import { ErrorBanner } from "@/components/error-banner";
import getEventTailwindColor from "../../utils/event-colors";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import TimeInput from "@/components/time-input";

interface EventDialogProps {
  event: CalendarEventType | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (eventId: string) => void;
}

export function EventDialog({ event, isOpen, onClose, onDelete }: EventDialogProps) {
  const t = useTranslations("modules.events.upload");

  const eventType = useEventStore((store) => store.eventType);
  const { user } = useCurrentUser();
  const userHasDeletionPermession = eventType === "personalEvent" ? true : user ? hasPermissions(user.roles, eventType === "meeting" ? "meetingsManagement" : "eventsManagement", "delete") || event?.createdById === user.id : false;
  const userHasEditionPermission = eventType === "personalEvent" ? true : user ? hasPermissions(user.roles, eventType === "meeting" ? "meetingsManagement" : "eventsManagement", "edit") || event?.createdById === user.id : false;

  const { onSubmit, form, isPending, error } = useEventUpload({
    event,
    type: eventType || "personalEvent",
    onSuccess: onClose
  });

  const watchAllUsers = form.watch("allUsers");

  useEffect(() => {
    if (isOpen) {
      if (event) {
        form.reset({
          title: event.title,
          description: event.description || "",
          location: event.location || "",
          startTime: event.startDate.toISOString(),
          endTime: event.endDate?.toISOString(),
          color: (event.color as any) || "sky",
          allUsers: event.toAllUsers || false,
          participantsId: event.participantsIds // Map your existing participants here if available
        });
      } else {
        const startTime = new Date();
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 1);

        form.reset({
          title: "",
          description: "",
          location: "",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          color: "sky",
          allUsers: false,
          participantsId: []
        });
      }
    }
  }, [event, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{event?.id ? t("dialog.title.edit") : t("dialog.title.create")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.fields.title")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allUsers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("dialog.fields.allUsers")}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Participants (Only show if not All Users) */}
            {!watchAllUsers && eventType !== "personalEvent" && (
              <UsersExtractionInput
                inputName="participantsId"
                label={t("dialog.fields.participants")}
              />
            )}

            <TimeInput inputName="startTime" dateLabel={t("dialog.fields.startDate")} timeLabel={t("dialog.fields.startTime")} />

            <TimeInput inputName="endTime" dateLabel={t("dialog.fields.endDate")} timeLabel={t("dialog.fields.endTime")} />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.fields.location")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.fields.color")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-2">
                      {["sky", "amber", "violet", "rose", "emerald", "orange"].map((c) => (
                        <FormItem key={c} className="flex items-center">
                          <FormControl>
                            <RadioGroupItem
                              value={c}
                              className={cn(
                                "size-6 border-none shadow-none",
                                getEventTailwindColor(c as EventColor)
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            {error && <ErrorBanner error={error} />}

            <DialogFooter className="flex-row pt-4 sm:justify-between">
              {event?.id && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!userHasDeletionPermession}
                  onClick={() => onDelete(event.id)}>
                  <RiDeleteBinLine size={16} />
                </Button>
              )}
              <div className="flex flex-1 justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("dialog.actions.cancel")}
                </Button>
                <Button type="submit" disabled={isPending || !userHasEditionPermission}>
                  {isPending ? "..." : t("dialog.actions.save")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
