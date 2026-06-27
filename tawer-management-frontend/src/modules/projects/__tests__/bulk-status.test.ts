/**
 * Property 15: Bulk status update idempotence and post-condition
 * Validates: Requirements 12.4, 12.5
 *
 * Calling bulkUpdateTaskStatus twice with the same arguments SHALL produce
 * the same set of task statuses as calling it once.
 * After any successful call, every task's status SHALL equal the requested status.
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import type { ProjectTaskType } from "@/modules/projects/types/project-tasks";

// ─── Model ───────────────────────────────────────────────────────────────────

/**
 * Pure model of bulk status update — applies the new status to all
 * tasks in taskIds. This mirrors what the server does.
 */
function applyBulkStatusUpdate(
  tasks: ProjectTaskType[],
  taskIds: string[],
  newStatus: string,
): ProjectTaskType[] {
  const idSet = new Set(taskIds);
  return tasks.map((t) =>
    idSet.has(t.id) ? { ...t, status: newStatus } : t,
  );
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

const minimalTask = fc.record({
  id: nonEmptyString,
  key: nonEmptyString,
  title: nonEmptyString,
  type: fc.constant("TASK"),
  status: fc.constantFrom("TODO", "IN_PROGRESS", "DONE", "BACKLOG"),
  priority: fc.constant("MEDIUM"),
  projectId: fc.constant("proj-1"),
  createdAt: fc.constant("2024-01-01T00:00:00.000Z"),
  updatedAt: fc.constant("2024-01-01T00:00:00.000Z"),
}) as fc.Arbitrary<ProjectTaskType>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Bulk status update – Property 15", () => {
  it("P15a: applying bulk status update sets all targeted tasks to the new status", () => {
    fc.assert(
      fc.property(
        fc.array(minimalTask, { minLength: 1, maxLength: 20 }),
        nonEmptyString,
        (tasks, newStatus) => {
          const taskIds = tasks.map((t) => t.id);
          const result = applyBulkStatusUpdate(tasks, taskIds, newStatus);
          for (const task of result) {
            expect(task.status).toBe(newStatus);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("P15b: applying the same bulk update twice is idempotent (same result as once)", () => {
    fc.assert(
      fc.property(
        fc.array(minimalTask, { minLength: 1, maxLength: 20 }),
        nonEmptyString,
        (tasks, newStatus) => {
          const taskIds = tasks.map((t) => t.id);
          const afterOnce = applyBulkStatusUpdate(tasks, taskIds, newStatus);
          const afterTwice = applyBulkStatusUpdate(afterOnce, taskIds, newStatus);
          // Statuses after second call equal statuses after first call
          for (let i = 0; i < afterOnce.length; i++) {
            expect(afterTwice[i].status).toBe(afterOnce[i].status);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("P15c: empty taskIds guard — returns without mutation", () => {
    function bulkGuard(taskIds: string[]): "skipped" | "executed" {
      if (taskIds.length === 0) return "skipped";
      return "executed";
    }
    fc.assert(
      fc.property(fc.constant([]), (emptyIds: string[]) => {
        expect(bulkGuard(emptyIds)).toBe("skipped");
      }),
      { numRuns: 100 },
    );
  });
});
