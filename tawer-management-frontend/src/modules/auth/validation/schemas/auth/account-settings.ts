import { TranslateFunction } from "@/types";
import { z } from "zod";

function buildAccountSettingsSchema(t?: TranslateFunction) {
  return z.object({
    name: z
      .string()
      .min(2, {
        message: t ? t("accountSettings.name.minLength") : "Name must be at least 2 characters."
      })
      .max(30, {
        message: t
          ? t("accountSettings.name.maxLength")
          : "Name must not be longer than 30 characters."
      }),
    email: z.string().email({
      message: t ? t("accountSettings.email.invalid") : "Please enter a valid email address."
    }),
    language: z.string({
      required_error: t ? t("accountSettings.language.required") : "Please select a language."
    })
  });
}

export type AccountSettingsFormValues = z.infer<ReturnType<typeof buildAccountSettingsSchema>>;

export function getAccountSettingsSchema(t?: TranslateFunction) {
  return buildAccountSettingsSchema(t);
}
