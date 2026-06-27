// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches backend TaskDependencyResponseDto

export interface TaskDependencyInResponseType {
  id: string;
  blockingTaskId: string;
  blockedTaskId: string;
  dependencyType: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface TaskDependencyType {
  id: string;
  blockingTaskId: string;
  blockedTaskId: string;
  dependencyType: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────
// Matches backend AddDependencyDto

export type AddDependencyPayload = {
  blockingTaskId: string;
  dependencyType?: string;
};
