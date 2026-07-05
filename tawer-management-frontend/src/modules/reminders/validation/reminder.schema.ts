import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

const VALID_CHANNELS = ["EMAIL", "TELEGRAM", "PUSH", "NTFY"] as const;
const VALID_ENTITY_TYPES = [
  "TASK",
  "SPRINT",
  "MILESTONE",
  "PROJECT",
  "CUSTOM",
] as const;

function buildFutureReminderAt(t: (key: string) => string) {
  return z
    .string()
    .min(1, t("reminderAtRequired"))
    .refine(
      (val) => {
        const time = new Date(val).getTime();
        return !isNaN(time) && time > Date.now();
      },
      { message: t("reminderAtFuture") },
    );
}

function buildRecurringRefinement(t: (key: string) => string) {
  return (
    data: { isRecurring: boolean; recurrenceRule?: string },
    ctx: z.RefinementCtx,
  ) => {
    if (data.isRecurring && !data.recurrenceRule) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("recurrenceRuleRequired"),
        path: ["recurrenceRule"],
      });
    }
  };
}

export function getCreateReminderSchema({ t }: Params) {
  return z
    .object({
      userId: z.string().min(1, t("userRequired")),
      entityType: z.enum(VALID_ENTITY_TYPES),
      entityId: z.string().optional(),
      message: z.string().optional(),
      reminderAt: buildFutureReminderAt(t),
      isRecurring: z.boolean(),
      recurrenceRule: z.string().optional(),
      channels: z
        .array(z.enum(VALID_CHANNELS))
        .min(1, t("channelsRequired")),
    })
    .superRefine(buildRecurringRefinement(t));
}

export function getUpdateReminderSchema({ t }: Params) {
  return z
    .object({
      message: z.string().optional(),
      reminderAt: buildFutureReminderAt(t),
      isRecurring: z.boolean(),
      recurrenceRule: z.string().optional(),
    })
    .superRefine(buildRecurringRefinement(t));
}

export type CreateReminderFormValues = z.infer<ReturnType<typeof getCreateReminderSchema>>;
export type UpdateReminderFormValues = z.infer<ReturnType<typeof getUpdateReminderSchema>>;
export type ReminderFormValues = CreateReminderFormValues;
