import { z } from "zod";
import { EventColorEnum } from "../types";

/**
 * Zod validation schema for user creation form
 * Validates fullName, email, password, and role fields
 */
interface Params {
  t: (key: string) => string;
}

export const getEventFormSchema = ({ t }: Params) =>
  z
    .object({
      title: z.string().min(1, t("title.required")),
      description: z.string().optional(),
      location: z.string().optional(),

      participantsId: z.array(z.string()).optional(),
      allUsers: z.boolean().default(false),

      startTime: z.string().min(1, t("startTime.isRequired")),
      endTime: z.string().min(1, t("endTime.isRequired")),

      color: EventColorEnum.default("sky")
    })
    .superRefine((data, ctx) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      if (start > end) {
        ctx.addIssue({
          code: "custom",
          message: t("timeRange.invalid"),
          path: ["endTime"] // attach error to endTime field
        });
      }
    });

export type EventFormSchema = z.infer<ReturnType<typeof getEventFormSchema>>;
