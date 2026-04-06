import { EnumTaskPriority, EnumTaskStatus } from "../types/tasks";

export const priorityClasses: Record<EnumTaskPriority, string> = {
  [EnumTaskPriority.High]:   "bg-chart-3/20 text-chart-3 border-chart-3/30",
  [EnumTaskPriority.Medium]: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  [EnumTaskPriority.Low]:    "bg-chart-4/10 text-chart-4 border-chart-4/20"
};

export const priorityDotColors: Record<EnumTaskPriority, string> = {
  [EnumTaskPriority.High]:   "bg-chart-3",
  [EnumTaskPriority.Medium]: "bg-chart-1",
  [EnumTaskPriority.Low]:    "bg-chart-4/50"
};

export const statusClasses: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]:    "bg-chart-2/10 text-chart-2 border-chart-2/20",
  [EnumTaskStatus.InProgress]: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  [EnumTaskStatus.Completed]:  "bg-chart-5/10 text-chart-5 border-chart-5/20"
};

export const taskStatusNamed: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]:    "Pending",
  [EnumTaskStatus.InProgress]: "In Progress",
  [EnumTaskStatus.Completed]:  "Completed"
};

export const statusDotColors: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]:    "bg-chart-2",
  [EnumTaskStatus.InProgress]: "bg-chart-1",
  [EnumTaskStatus.Completed]:  "bg-chart-5"
};

export const favoriteActiveClasses = "fill-chart-3 text-chart-3";
