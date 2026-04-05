import { z } from "zod";

const accountSettingsSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters."
    })
    .max(30, {
      message: "Name must not be longer than 30 characters."
    }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  language: z.string({
    required_error: "Please select a language."
  })
});

export type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;

export function getAccountSettingsSchema() {
  return accountSettingsSchema;
}
