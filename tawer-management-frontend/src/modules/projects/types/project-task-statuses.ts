// ─── Backend Response Shape ───────────────────────────────────────────────────

export interface TaskStatusInResponseType {
  id: string;
  projectId: string;
  name: string;
  color: string;
  displayOrder: number;
  isSystem: boolean;
  allowedTransitions?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface TaskStatusType {
  id: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
  isSystem: boolean;
  allowedTransitions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────

export type CreateTaskStatusPayload = {
  name: string;
  color: string;
  displayOrder: number;
};

export type UpdateTaskStatusPayload = {
  name?: string;
  color?: string;
  displayOrder?: number;
};
