import { z } from "zod";

export const sprintSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  details: z.string().optional(),
  language: z.enum(["Arabic", "French", "English"]).optional(),
  status: z.enum(["Pending", "Running", "Stopped", "Completed"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  estimatedStartDate: z.string().min(1, "Estimated start date is required"),
  estimatedEndDate: z.string().min(1, "Estimated end date is required"),
});

export type SprintFormValues = z.infer<typeof sprintSchema>;
