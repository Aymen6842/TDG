import { z } from "zod";

export const milestoneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
});

export type MilestoneFormValues = z.infer<typeof milestoneSchema>;
