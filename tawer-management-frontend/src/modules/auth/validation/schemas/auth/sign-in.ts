import { TranslateFunction } from "@/types";
import z from "zod";

export function getSignInFormSchema(t?: TranslateFunction) {
  return z.object({
    email: z
      .string()
      .email(t ? t("email.invalid") : "Email address is invalid.")
      .min(1, {
        message: t ? t("email.required") : "Email address is required."
      }),
    password: z.string().min(8, {
      message: t
        ? t("password.passwordTooShort", { min: 8 })
        : "Password must be at least 8 characters"
    })
  });
}
