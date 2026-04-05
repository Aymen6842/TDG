import { TaskType } from "./tasks";


export type TaskStatus = "Pending" | "InProgress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type TaskSort = "statusAsc" | "statusDesc" | "priorityAsc" |
  "priorityDesc" | "dueDateAsc" | "dueDateDesc";


export interface FilteringTasksHookResult {
  tasks: TaskType[] | undefined | null;
  tasksAreLoading: boolean;
  tasksError: boolean;
  filterVersion: number;
  searchState: [string, (value: string) => void];
  archivedState: [boolean | undefined, (value: boolean | undefined) => void];
  statusState: [TaskStatus | undefined, (value: TaskStatus | undefined) => void];
  priorityState: [TaskPriority | undefined, (value: TaskPriority | undefined) => void];
  sortByState: [TaskSort | undefined, (value: TaskSort) => void];
  applyFilter: () => void;
  setDisplayedTasks: (tasks: TaskType[]) => void;
}