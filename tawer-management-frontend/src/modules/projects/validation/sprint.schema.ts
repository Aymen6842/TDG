import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getSprintSchema = ({ t }: Params) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    description: z.string().optional(),
    details: z.string().optional(),
    language: z.enum(["Arabic", "French", "English"]).default("English"),
    status: z.enum(["Pending", "Running", "Stopped", "Completed"]),
    startDate: z.string().min(1, t("startDateRequired")),
    endDate: z.string().min(1, t("endDateRequired")),
    estimatedStartDate: z.string().min(1, t("estimatedStartDateRequired")),
    estimatedEndDate: z.string().min(1, t("estimatedEndDateRequired")),
    capacity: z.coerce.number().min(0).optional(),
  });

export type SprintFormValues = z.infer<ReturnType<typeof getSprintSchema>>;
