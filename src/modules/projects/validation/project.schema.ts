import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  details: z.string().optional(),
  repositoryUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["Running", "Pending", "Completed"]),
  projectType: z.enum(["AGILE", "FREESTYLE"]),
  businessUnit: z.string().optional(),
  paid: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  displayOrder: z.coerce.number().optional(),
  language: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
