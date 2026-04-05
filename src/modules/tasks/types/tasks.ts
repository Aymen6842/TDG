import { TaskStatus, TaskPriority } from "./filtering";

export enum EnumTaskPriority {
  High = "High",
  Medium = "Medium",
  Low = "Low"
}

export enum EnumTaskStatus {
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed"
}
export type TaskEnumPriority = `${EnumTaskPriority}`;
export type TaskEnumStatus = `${EnumTaskStatus}`;
export type FilterTab = "all" | TaskEnumStatus;
export type ViewMode = "list" | "grid";

export interface TaskUpdateType {
  status?: TaskEnumStatus;
  isFavorite?: boolean;
  priority?: TaskEnumPriority;
  displayOrder?: number;
}

export interface TaskDetailsType {
  id: string;
  title: string;
  description?: string;
  details?: string;
  archived: boolean;
  isFavorite: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  parentTaskId?: string;
  attachments?: string[];
  comments?: TaskCommentType[];
  subTasks?: SubTaskType[];
  dueTime: Date;
  reminderTime: Date;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetailsInResponseType {
  id: string;
  title: string;
  description?: string;
  details?: string;
  archived: boolean;
  isFavorite: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  parentTaskId?: string;
  attachments?: string[];
  comments?: TaskCommentType[];
  subTasks?: SubTaskType[];
  dueDate: string;
  reminderDate: string;
  createdAt: string;
  updatedAt: string;
}


export interface TaskCommentType {
  id: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubTaskType {
  id: string;
  title: string;
  description?: string;
  details?: string;
  archived: boolean;
  isFavorite: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  parentTaskId?: string;
  attachments?: string[];
  dueDate: Date;
  reminderDate: Date;
  createdAt: string;
  updatedAt: string;
}




export interface Comment {
  id: string;
  text: string;
  createdAt: Date;
}

export interface TodoFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoPosition {
  id: string;
  position: number;
}

export interface TaskType {
  id: string;
  title: string;
  description?: string;
  details?: string;
  archived: boolean;
  isFavorite: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  parentTaskId?: string;
  attachments?: string[];
  dueTime: Date;
  reminderTime: Date;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInResponseType {
  id: string;
  title: string;
  description?: string;
  details?: string;
  archived: boolean;
  isFavorite: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  parentTaskId?: string;
  attachments?: string[];
  dueDate: string;
  reminderDate: string;
  createdAt: string;
  updatedAt: string;
}
