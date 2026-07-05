import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getMilestoneSchema = ({ t }: Params) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    description: z.string().optional(),
    dueDate: z.string().min(1, t("dueDateRequired")),
  });

export type MilestoneFormValues = z.infer<ReturnType<typeof getMilestoneSchema>>;
