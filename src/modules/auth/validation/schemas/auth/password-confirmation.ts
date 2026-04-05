import { z } from "zod";

export function getPasswordConfirmationSchema(t: (key: string) => string) {
  return z
    .object({
      password: z.string().min(1, t("passwordRequired")).min(8, t("passwordTooShort")),
      confirmationPassword: z.string().min(1, t("passwordRequired"))
    })
    .refine((data) => data.password === data.confirmationPassword, {
      message: t("mismatch"),
      path: ["confirmationPassword", "generalWarning"]
    });
}
