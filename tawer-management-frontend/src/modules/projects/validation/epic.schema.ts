import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getEpicSchema = ({ t }: Params) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    description: z.string().optional(),
    color: z
      .union([
        z.string().regex(/^#[0-9A-Fa-f]{6}$/, t("colorInvalid")),
        z.literal(""),
      ])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });

export type EpicFormValues = z.infer<ReturnType<typeof getEpicSchema>>;
