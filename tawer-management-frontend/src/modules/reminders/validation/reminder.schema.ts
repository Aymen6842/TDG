import { z } from "zod";

const VALID_CHANNELS = ["EMAIL", "TELEGRAM", "PUSH", "NTFY"] as const;
const VALID_ENTITY_TYPES = [
  "TASK",
  "SPRINT",
  "MILESTONE",
  "PROJECT",
  "CUSTOM",
] as const;

const futureReminderAt = z
  .string()
  .min(1, "Reminder date is required")
  .refine(
    (val) => {
      const t = new Date(val).getTime();
      return !isNaN(t) && t > Date.now();
    },
    { message: "Reminder must be scheduled in the future" },
  );

const recurringRefinement = (
  data: { isRecurring: boolean; recurrenceRule?: string },
  ctx: z.RefinementCtx,
) => {
  if (data.isRecurring && !data.recurrenceRule) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Recurrence rule (cron expression) is required when recurring is enabled",
      path: ["recurrenceRule"],
    });
  }
};

export const createReminderSchema = z
  .object({
    userId: z.string().min(1, "User is required"),
    entityType: z.enum(VALID_ENTITY_TYPES),
    entityId: z.string().optional(),
    message: z.string().optional(),
    reminderAt: futureReminderAt,
    isRecurring: z.boolean(),
    recurrenceRule: z.string().optional(),
    channels: z
      .array(z.enum(VALID_CHANNELS))
      .min(1, "At least one channel is required"),
  })
  .superRefine(recurringRefinement);

export const updateReminderSchema = z
  .object({
    message: z.string().optional(),
    reminderAt: futureReminderAt,
    isRecurring: z.boolean(),
    recurrenceRule: z.string().optional(),
  })
  .superRefine(recurringRefinement);

/** @deprecated Use createReminderSchema */
export const reminderSchema = createReminderSchema;

export type CreateReminderFormValues = z.infer<typeof createReminderSchema>;
export type UpdateReminderFormValues = z.infer<typeof updateReminderSchema>;
export type ReminderFormValues = CreateReminderFormValues;
