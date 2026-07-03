// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches exactly what the API returns. Edit this when the backend contract changes.

export interface MilestoneInResponseType {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate?: string | null;
  completedAt: string | null;
  totalTasks: number;
  doneTasks: number;
  progress: number;
  createdAt: string;
  /** Omitted on list (MilestoneSummaryDto); cast falls back to createdAt */
  updatedAt?: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────
// What the rest of the app uses. Dates are converted to Date objects.

export interface MilestoneType {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate?: Date | null;
  completedAt: Date | null;
  totalTasks: number;
  doneTasks: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Gantt Shapes ─────────────────────────────────────────────────────────────
// Matches GanttChartDto: backend returns milestones, epics, sprints AND tasks.

export type GanttMilestoneStatus = "COMPLETED" | "OVERDUE" | "PENDING" | "IN_PROGRESS";

export interface GanttMilestoneInResponse {
  id: string;
  name: string;
  description?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  status: GanttMilestoneStatus;
}

export interface GanttEpicInResponse {
  id: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface GanttSprintInResponse {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

export interface GanttTaskInResponse {
  id: string;
  key: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  dueDate?: string | null;
  completedAt?: string | null;
  storyPoints?: number | null;
  epicId?: string | null;
  sprintId?: string | null;
  createdAt: string;
}

export interface GanttInResponseType {
  milestones: GanttMilestoneInResponse[];
  epics: GanttEpicInResponse[];
  sprints: GanttSprintInResponse[];
  tasks: GanttTaskInResponse[];
}

export interface GanttMilestone {
  id: string;
  name: string;
  dueDate: Date | null;
  completedAt: Date | null;
  status: GanttMilestoneStatus;
}

export interface GanttEpic {
  id: string;
  name: string;
  description?: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

export interface GanttSprint {
  id: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface GanttTask {
  id: string;
  key: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  storyPoints?: number | null;
  epicId?: string | null;
  sprintId?: string | null;
}

export interface GanttType {
  milestones: GanttMilestone[];
  epics: GanttEpic[];
  sprints: GanttSprint[];
  tasks: GanttTask[];
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────

export type CreateMilestonePayload = {
  name: string;
  description?: string;
  dueDate: string;
};

export type UpdateMilestonePayload = {
  name?: string;
  description?: string;
  dueDate?: string;
};
