import { z } from "zod";

export function getEmailSchema(t: (key: string) => string) {
  return z.object({
    email: z
      .string()
      .min(1, { message: t("email.required") })
      .email(t("email.invalid"))
  });
}
