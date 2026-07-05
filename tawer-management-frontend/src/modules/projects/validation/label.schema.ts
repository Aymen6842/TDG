import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getLabelSchema = ({ t }: Params) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, t("colorInvalid")),
  });

export type LabelFormValues = z.infer<ReturnType<typeof getLabelSchema>>;
