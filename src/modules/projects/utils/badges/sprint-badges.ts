import { SprintStatus } from "../../types/project-sprints";

export const sprintStatusClasses: Record<SprintStatus, string> = {
  Running:   "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Pending:   "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Stopped:   "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Completed: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

export const sprintStatusDotColors: Record<SprintStatus, string> = {
  Running:   "bg-chart-1",
  Pending:   "bg-chart-2",
  Stopped:   "bg-chart-3",
  Completed: "bg-chart-5",
};
