import { z } from "zod";

export const ProjectColorEnum = z.enum(["sky", "amber", "violet", "rose", "emerald", "orange"]);
export type ProjectColor = z.infer<typeof ProjectColorEnum>;
export type ProjectColorOnBackendSide = "Sky" | "Amber" | "Violet" | "Rose" | "Emerald" | "Orange";

export interface ProjectType {
  id: string;
  slug: string;
  name: string
  description?: string
  repositoryUrl?: string
  liveUrl?: string
  projectColor: ProjectColor;
  startTime: Date;
  endTime: Date;
  createdAt: Date
  updatedAt: Date
}