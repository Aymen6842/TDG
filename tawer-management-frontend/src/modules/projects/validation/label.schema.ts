import { z } from "zod";

export const labelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Color must be a valid hex color (e.g. #FF5733)",
    ),
});

export type LabelFormValues = z.infer<typeof labelSchema>;
