import { z } from "zod";

export const timeEntrySchema = z.object({
  hours: z
    .number({ invalid_type_error: "Hours must be a number" })
    .min(0.01, "Hours must be greater than 0"),
  description: z.string().optional(),
});

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;
