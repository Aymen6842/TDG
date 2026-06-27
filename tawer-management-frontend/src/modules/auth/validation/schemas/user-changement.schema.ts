import { validatePhoneNumber } from "@/lib/phone-number";
import { CountryCode } from "libphonenumber-js";
import { z } from "zod";

/**
 * Zod validation schema for user creation form
 * Validates fullName, email, password, and role fields
 */
interface Params {
  t: (key: string) => string;
}

export const getUserChangementFormSchema = ({ t }: Params) =>
  z
    .object({
      fullName: z.string().min(1, t("fullName.required")),
      phone: z
        .string()
        .min(1, {
          message: t("phone.required")
        })
        .refine((value) => validatePhoneNumber(value, process.env.COUNTRY_CODE as CountryCode), {
          message: t("phone.invalid")
        }),
      image: z
        .instanceof(File) // ensures it's a File object
        .refine(
          (file) =>
            file.type.startsWith("image/") &&
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          { message: t("image.invalid") }
        )
        .optional(),
      //image Url and images Url will be used in edition.
      imageUrl: z.string().optional()
    })
    .refine((data) => data.image || (data.imageUrl && data.imageUrl.trim() !== ""), {
      message: t("image.required"),
      path: ["image"] // highlights both fields in error
    });

export type UserChangementFormSchema = z.infer<ReturnType<typeof getUserChangementFormSchema>>;
