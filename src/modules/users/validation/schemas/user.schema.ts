import { validatePhoneNumber } from "@/lib/phone-number";
import { UserRoleOnBackendSideEnum } from "@/modules/auth/types";
import { CountryCode } from "libphonenumber-js";
import { z } from "zod";

/**
 * Zod validation schema for user creation form
 * Validates fullName, email, password, and role fields
 */
interface Params {
  t: (key: string) => string;
  passwordRequired?: boolean;
}

export const getFormUserSchema = ({ t, passwordRequired = false }: Params) =>
  z
    .object({
      fullName: z.string().min(1, t("fullName.required")),
      email: z.string().min(1, t("email.required")).email(t("email.invalid")),
      phone: z
        .string()
        .min(1, {
          message: t("phone.required")
        })
        .refine((value) => validatePhoneNumber(value, process.env.COUNTRY_CODE as CountryCode), {
          message: t("phone.invalid")
        }),
      password: passwordRequired
        ? z.string().min(1, t("password.required")).min(8, t("password.tooShort"))
        : z.string().optional(),
      roles: z.array(UserRoleOnBackendSideEnum).min(1, {
        message: t("roles.required")
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
      imageUrl: z.string().optional(),

      //notifications settings
      emailNotifications: z.boolean().optional(),
      telegramNotifications: z.boolean().optional(),
      ntfyNotifications: z.boolean().optional(),
      telegramChatId: z.string().optional()
    })
    .refine((data) => data.image || (data.imageUrl && data.imageUrl.trim() !== ""), {
      message: t("image.required"),
      path: ["image"] // highlights both fields in error
    })
    .refine(
      (data) =>
        !data.telegramNotifications ||
        (data.telegramChatId && data.telegramChatId.trim().length > 0),
      {
        message: t("notificationsSettings.noNotificationsReceivedWithoutTelegramChatId"),
        path: ["telegramChatId"]
      }
    );
export type UserFormSchema = z.infer<ReturnType<typeof getFormUserSchema>>;
