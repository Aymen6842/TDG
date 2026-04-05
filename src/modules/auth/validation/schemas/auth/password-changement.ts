import { z } from "zod";

// Function that generates the schema with translated messages
export function getPasswordChangementSchema(t: (key: string) => string) {
  return z
    .object({
      currentPassword: z.string().min(8, {
        message: t("passwordTooShort") // e.g., "Password must be at least 8 characters."
      }),
      newPassword: z.string().min(8, {
        message: t("passwordTooShort")
      }),
      confirmationPassword: z.string().min(8, {
        message: t("passwordTooShort")
      })
    })
    .refine((data) => data.newPassword === data.confirmationPassword, {
      message: t("mismatch"), // e.g., "Passwords don't match"
      path: ["confirmationPassword"]
    });
}

// Type inference stays the same
export type PasswordChangementFormValues = z.infer<ReturnType<typeof getPasswordChangementSchema>>;
