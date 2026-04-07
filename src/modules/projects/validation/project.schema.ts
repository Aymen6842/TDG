import { z } from "zod";

export const projectSchema = z.object({
  // content fields (flattened in form, nested on submit)
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  details: z.string().optional(),
  language: z.enum(["Arabic", "French", "English"]).optional(),

  // project fields
  businessUnit: z.enum(["TawerDev", "TawerCreative"]),
  projectType: z.enum(["AGILE", "FREESTYLE"]),
  status: z.enum(["Running", "Pending", "Stopped", "Completed"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  estimatedStartDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
  paid: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  displayOrder: z.coerce.number().optional(),

  // manager UUID — required for create, optional for update
  manager: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
