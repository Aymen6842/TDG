import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getTaskFormSchema = ({ t }: Params) =>
  z.object({
    archived: z.boolean().optional(),
    isFavorite: z.boolean().optional(),

    parentTaskId: z.string().nullable().optional(),

    deletedAttachments: z.string().optional(),

    status: z.enum(["Pending", "InProgress", "Completed"], {
      errorMap: () => ({ message: t("status.invalid") })
    }).optional(),

    priority: z.enum(["Low", "Medium", "High"], {
      errorMap: () => ({ message: t("priority.invalid") })
    }).optional(),

    dueTime: z.string().min(1, t("dueTime.required")).optional(),
    reminderTime: z.string().min(1, t("reminderTime.required")).optional(),

    title: z.string().min(1, t("title.required")),
    description: z.string().optional(),
    details: z.string().optional(),

    attachments: z.array(
      z.instanceof(File).refine(
        (file) =>
          file.type.startsWith("image/") &&
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        { message: t("attachments.invalidImageFormat") }
      )
    ).optional(),
  }).superRefine((data, ctx) => {
    if (data.dueTime && data.reminderTime) {
      const dueTime = new Date(data.dueTime);
      const reminderTime = new Date(data.reminderTime);

      if (reminderTime >= dueTime) {
        ctx.addIssue({
          code: "custom",
          message: t("timeRange.invalid"),
          path: ["reminderTime"] // attach error to endTime field
        });
      }
    }

  });;



export type TaskFormSchema = z.infer<ReturnType<typeof getTaskFormSchema>>;
