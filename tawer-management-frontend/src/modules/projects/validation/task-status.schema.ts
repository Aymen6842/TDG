import { z } from "zod";

export const taskStatusSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Color must be a valid hex color (e.g. #FF5733)",
    ),
  order: z
    .number({ invalid_type_error: "Order must be a number" })
    .int("Order must be an integer")
    .min(1, "Order must be at least 1"),
});

export type TaskStatusFormValues = z.infer<typeof taskStatusSchema>;
