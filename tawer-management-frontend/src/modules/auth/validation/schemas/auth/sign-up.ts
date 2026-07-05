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
        { message: t ? t("image.invalid") : "Only JPEG/PNG/WEBP images allowed." }
      ),
    email: z
      .string()
      .email(t ? t("email.invalid") : "Email address is invalid.")
      .min(1, {
        message: t ? t("email.required") : "Email address is required."
      }),
    phone: z
      .string()
      .min(1, {
        message: t ? t("phone.required") : "Phone number is required."
      })
      .refine((value) => validatePhoneNumber(value, process.env.COUNTRY_CODE as CountryCode), {
        message: t ? t("phone.invalid") : "Phone number is invalid."
      }),
    password: z.string().min(8, {
      message: t
        ? t("password.passwordTooShort", { min: 8 })
        : "Password must be at least 8 characters"
    })
  });
}

export type SignUpFormSchemaType = z.infer<ReturnType<typeof getSignUpFormSchema>>;
