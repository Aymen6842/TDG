import type { LabelInResponseType, LabelType } from "@/modules/projects/types/project-labels";

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum EnumProjectTaskStatus {
  Backlog    = "BACKLOG",
  Todo       = "TODO",
  InProgress = "IN_PROGRESS",
  Testing    = "TESTING",
  InReview   = "IN_REVIEW",
  Done       = "DONE"
}

export enum EnumProjectTaskPriority {
  Urgent = "URGENT",
  High   = "HIGH",
  Medium = "MEDIUM",
  Low    = "LOW"
}

export enum EnumProjectTaskType {
  Story = "STORY",
  Task  = "TASK",
  Bug   = "BUG",
  Spike = "SPIKE",
  Epic  = "EPIC"
}

export type TaskStatusType = "ENUM" | "CUSTOM";

// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches backend TaskResponseDto / TaskSummaryDto / CreatedTaskDto

export interface ProjectTaskCommentInResponse {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  likedByMe?: boolean;
  mentions?: { id: string; userId: string }[];
  likes?: { id: string; userId: string }[];
}

export interface ProjectTaskSubTaskInResponse {
  id: string;
  key: string;
  title: string;
  type?: string;
  status: string;
  priority: string;
  displayOrder?: number;
  assigneeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskDependencyInResponseType {
  id: string;
  blockingTaskId: string;
  blockedTaskId: string;
  dependencyType: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskLabelAssignmentInResponse {
  id: string;
  name: string;
  color: string;
}

export interface ProjectTaskInResponseType {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  statusType?: TaskStatusType;
  priority: string;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  actualHours?: number;
  progressPercent?: number | null;
  dueDate?: string | null;
  completedAt?: string | null;
  displayOrder?: number;
  assigneeId?: string | null;
  reporterId?: string;
  milestoneId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
  parentTaskId?: string | null;
  isFavorite?: boolean;
  archived?: boolean;
  attachments?: { id: string; file: string; createdAt: string }[];
  comments?: ProjectTaskCommentInResponse[];
  subtasks?: ProjectTaskSubTaskInResponse[];
  subtasksCount?: number;
  completedSubtasksCount?: number;
  labels?: TaskLabelAssignmentInResponse[];
  taskDependenciesAsBlocked?: TaskDependencyInResponseType[];
  taskDependenciesAsBlocking?: TaskDependencyInResponseType[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────
// What the rest of the app uses. Edit this when the UI needs change.

export interface ProjectTaskComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  likedByMe?: boolean;
  mentions?: { id: string; userId: string }[];
  likes?: { id: string; userId: string }[];
}

export interface ProjectTaskSubTask {
  id: string;
  key: string;
  title: string;
  type?: string;
  status: string;
  priority: string;
  displayOrder?: number;
  assigneeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskDependencyType {
  id: string;
  blockingTaskId: string;
  blockedTaskId: string;
  dependencyType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTaskType {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  statusType?: TaskStatusType;
  priority: string;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  actualHours?: number;
  progressPercent?: number | null;
  dueDate?: string | null;
  completedAt?: string | null;
  displayOrder?: number;
  assigneeId?: string | null;
  reporterId?: string;
  milestoneId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
  parentTaskId?: string | null;
  isFavorite?: boolean;
  archived?: boolean;
  attachments?: { id: string; file: string; createdAt: string }[];
  comments?: ProjectTaskComment[];
  subtasks?: ProjectTaskSubTask[];
  subtasksCount?: number;
  completedSubtasksCount?: number;
  labels?: LabelType[];
  taskDependenciesAsBlocked?: TaskDependencyType[];
  taskDependenciesAsBlocking?: TaskDependencyType[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}
