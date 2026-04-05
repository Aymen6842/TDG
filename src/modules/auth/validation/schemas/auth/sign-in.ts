import { TranslateFunction } from "@/types";
import z from "zod";

export function getSignInFormSchema(t?: TranslateFunction) {
  return z.object({
    email: z
      .string()
      .email(t ? t("email.invalid") : "L'adresse e-mail est invalide.")
      .min(1, {
        message: t ? t("email.required") : "L'adresse e-mail est requise."
      }),
    password: z.string().min(8, {
      message: t
        ? t("password.passwordTooShort", { min: 8 })
        : "Le mot de passe doit contenir au moins 8 caractères."
    })
  });
}
