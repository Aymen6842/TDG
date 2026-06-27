import { validatePhoneNumber } from "@/lib/phone-number";
import { TranslateFunction } from "@/types";
import { CountryCode } from "libphonenumber-js";
import { z } from "zod";

export function getSignUpFormSchema(t?: TranslateFunction) {
  return z.object({
    name: z.string().min(1, {
      message: t ? t("fullName.required") : "Full name is required."
    }),
    image: z
      .instanceof(File, {
        message: t ? t("image.required") : "Image is required."
      }) // ensures it's a File object
      .refine(
        (file) =>
          file.type.startsWith("image/") &&
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        { message: t ? t("image.invalidFormat") : "Format d'adresse e-mail invalide." }
      ),
    email: z
      .string()
      .email(t ? t("email.invalid") : "Format d'adresse e-mail invalide.")
      .min(1, {
        message: t ? t("email.required") : "L'adresse e-mail est requise."
      }),
    phone: z
      .string()
      .min(1, {
        message: t ? t("phone.required") : ""
      })
      .refine((value) => validatePhoneNumber(value, process.env.COUNTRY_CODE as CountryCode), {
        message: t ? t("phone.invalid") : ""
      }),
    password: z.string().min(8, {
      message: t
        ? t("password.passwordTooShort", { min: 8 })
        : "Le mot de passe doit contenir au moins 8 caractères."
    })
  });
}

export type SignUpFormSchemaType = z.infer<ReturnType<typeof getSignUpFormSchema>>;
