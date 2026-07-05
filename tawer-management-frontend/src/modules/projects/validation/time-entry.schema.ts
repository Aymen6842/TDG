import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getTimeEntrySchema = ({ t }: Params) =>
  z.object({
    hours: z
      .number({ invalid_type_error: t("hoursNotANumber") })
      .min(0.01, t("hoursMin")),
    description: z.string().optional(),
  });

export type TimeEntryFormValues = z.infer<ReturnType<typeof getTimeEntrySchema>>;
