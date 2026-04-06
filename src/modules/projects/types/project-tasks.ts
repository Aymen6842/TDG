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

// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches exactly what the API returns. Edit this when the backend contract changes.

export interface ProjectTaskCommentInResponse {
  id: string;
  comment: string;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskSubTaskInResponse {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskInResponseType {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  storyPoints?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  displayOrder?: number;
  assigneeId?: string;
  reporterId?: string;
  milestoneId?: string;
  epicId?: string;
  sprintId?: string;
  parentTaskId?: string;
  attachments?: string[];
  comments?: ProjectTaskCommentInResponse[];
  subTasks?: ProjectTaskSubTaskInResponse[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────
// What the rest of the app uses. Edit this when the UI needs change.

export interface ProjectTaskComment {
  id: string;
  comment: string;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskSubTask {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskType {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  storyPoints?: number;
  dueDate?: string;
  assigneeId?: string;
  milestoneId?: string;
  epicId?: string;
  sprintId?: string;
  parentTaskId?: string;
  attachments?: string[];
  comments?: ProjectTaskComment[];
  subTasks?: ProjectTaskSubTask[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}
