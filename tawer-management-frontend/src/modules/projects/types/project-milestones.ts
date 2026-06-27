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

export interface GanttMilestone {
  id: string;
  name: string;
  dueDate: string | null;
  completedAt: string | null;
}

export interface GanttType {
  milestones: GanttMilestone[];
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
