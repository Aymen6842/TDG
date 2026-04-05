import { EnumTaskPriority, EnumTaskStatus } from "../types/tasks";


export const priorityClasses: Record<EnumTaskPriority, string> = {
  [EnumTaskPriority.High]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [EnumTaskPriority.Medium]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [EnumTaskPriority.Low]: "bg-gray-200 text-green-80 dark:bg-gray-700 dark:text-gray-200"
};

export const priorityDotColors: Record<EnumTaskPriority, string> = {
  [EnumTaskPriority.High]: "bg-red-500",
  [EnumTaskPriority.Medium]: "bg-yellow-500",
  [EnumTaskPriority.Low]: "bg-gray-400"
};

export const statusClasses: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  [EnumTaskStatus.InProgress]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [EnumTaskStatus.Completed]: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
};

export const taskStatusNamed: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]: "Pending",
  [EnumTaskStatus.InProgress]: "In Progress",
  [EnumTaskStatus.Completed]: "Completed"
};

export const statusDotColors: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]: "bg-blue-500",
  [EnumTaskStatus.InProgress]: "bg-purple-500",
  [EnumTaskStatus.Completed]: "bg-green-500"
};
