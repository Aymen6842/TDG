import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getTaskStatusSchema = ({ t }: Params) =>
  z.object({
    name: z.string().min(1, t("nameRequired")).max(50, t("nameMaxLength")),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, t("colorInvalid")),
    order: z
      .number({ invalid_type_error: t("orderNotANumber") })
      .int(t("orderNotInteger"))
      .min(1, t("orderMin")),
  });

export type TaskStatusFormValues = z.infer<ReturnType<typeof getTaskStatusSchema>>;
