import { z } from "zod";

const nameChangeSchema = z.object({
  newName: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be at most 50 characters long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in name"),
});

export function getNameChangementSchema() {
  return nameChangeSchema;
}
