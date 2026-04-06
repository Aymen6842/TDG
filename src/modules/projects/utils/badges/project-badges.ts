import { ProjectStatus, ProjectTypeEnum } from "../../types/projects";

// Project status badge classes
export const projectStatusClasses: Record<ProjectStatus, string> = {
  Running: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Pending: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Completed: "bg-chart-5/10 text-chart-5 border-chart-5/20"
};

// Project type badge classes
export const projectTypeClasses: Record<ProjectTypeEnum, string> = {
  AGILE: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  FREESTYLE: "bg-chart-3/10 text-chart-3 border-chart-3/20"
};

// Business unit badge classes
export const businessUnitClasses: Record<string, string> = {
  TawerDev: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  TawerCreative: "bg-chart-4/10 text-chart-4 border-chart-4/20"
};

export const businessUnitFallbackClasses = "bg-muted text-muted-foreground";

export const businessUnitNamed: Record<string, string> = {
  TawerDev: "Tawer Dev",
  TawerCreative: "Tawer Creative"
};
