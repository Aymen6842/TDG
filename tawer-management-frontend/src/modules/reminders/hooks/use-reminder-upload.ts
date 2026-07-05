import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  getCreateReminderSchema,
  getUpdateReminderSchema,
  CreateReminderFormValues,
  UpdateReminderFormValues,
} from "@/modules/reminders/validation/reminder.schema";
import {
  createReminder,
  updateReminder,
  deleteReminder,
} from "@/modules/reminders/services/api/reminders";
import { ReminderType } from "@/modules/reminders/types/reminders";

function buildCreateDefaults(
  currentUserId?: string,
): CreateReminderFormValues {
  return {
    userId: currentUserId ?? "",
    entityType: "CUSTOM",
    entityId: "",
    message: "",
    reminderAt: "",
    channels: [],
    isRecurring: false,
    recurrenceRule: undefined,
  };
}

function buildUpdateDefaults(reminder: ReminderType): UpdateReminderFormValues {
  return {
    message: reminder.message ?? "",
    reminderAt: reminder.reminderAt ? reminder.reminderAt.toISOString() : "",
    isRecurring: reminder.isRecurring ?? false,
    recurrenceRule: reminder.recurrenceRule ?? undefined,
  };
}

interface Params {
  projectId: string;
  reminder?: ReminderType | null;
  currentUserId?: string;
  onSuccess?: () => void;
}

export default function useReminderUpload({
  projectId,
  reminder,
  currentUserId,
  onSuccess,
}: Params) {
  const queryClient = useQueryClient();
  const t = useTranslations("modules.reminders.validation");
  const tToasts = useTranslations("modules.reminders.toasts");
  const tErrors = useTranslations("shared.errors");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!reminder?.id;

  const defaultValues = useMemo(
    () =>
      isEdit && reminder
        ? buildUpdateDefaults(reminder)
        : buildCreateDefaults(currentUserId),
    [isEdit, reminder, currentUserId],
  );

  const form = useForm<CreateReminderFormValues | UpdateReminderFormValues>({
    resolver: zodResolver(
      isEdit ? getUpdateReminderSchema({ t }) : getCreateReminderSchema({ t }),
    ) as any,
    defaultValues,
  });

  useEffect(() => {
    form.reset(
      isEdit && reminder
        ? buildUpdateDefaults(reminder)
        : buildCreateDefaults(currentUserId),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminder?.id, currentUserId]);

  async function onSubmit(
    data: CreateReminderFormValues | UpdateReminderFormValues,
  ) {
    setIsPending(true);
    setError("");
    try {
      if (isEdit && reminder?.id) {
        const updateData = data as UpdateReminderFormValues;
        await updateReminder(projectId, reminder.id, {
          message: updateData.message || undefined,
          reminderAt: updateData.reminderAt,
          isRecurring: updateData.isRecurring,
          recurrenceRule: updateData.recurrenceRule || undefined,
        });
        toast.success(tToasts("updated"));
      } else {
        const createData = data as CreateReminderFormValues;
        await createReminder(projectId, {
          userId: createData.userId,
          entityType: createData.entityType,
          entityId: createData.entityId || undefined,
          message: createData.message || undefined,
          reminderAt: createData.reminderAt,
          isRecurring: createData.isRecurring,
          recurrenceRule: createData.recurrenceRule || undefined,
          channels: createData.channels,
        });
        toast.success(tToasts("created"));
      }
      queryClient.invalidateQueries({ queryKey: ["reminders", projectId] });
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || tErrors("generic");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  async function deleteReminderFromProject(reminderId: string) {
    setIsPending(true);
    setError("");
    try {
      await deleteReminder(projectId, reminderId);
      toast.success(tToasts("deleted"));
      queryClient.invalidateQueries({ queryKey: ["reminders", projectId] });
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || tErrors("generic");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { form, isPending, onSubmit, error, deleteReminderFromProject, isEdit };
}
