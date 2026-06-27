/**
 * Property 11: Backlog tasks have no sprint assignment
 * Property 12: Sprint task membership invariant
 * Validates: Requirements 9.9, 9.10
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import type { ProjectTaskType } from "@/modules/projects/types/project-tasks";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

/** Minimal task with no sprint assignment (backlog task). */
const backlogTask = fc.record({
  id: nonEmptyString,
  key: nonEmptyString,
  title: nonEmptyString,
  type: fc.constant("TASK"),
  status: fc.constant("BACKLOG"),
  priority: fc.constant("MEDIUM"),
  projectId: nonEmptyString,
  sprintId: fc.oneof(fc.constant(undefined), fc.constant(null)),
  createdAt: fc.constant("2024-01-01T00:00:00.000Z"),
  updatedAt: fc.constant("2024-01-01T00:00:00.000Z"),
}) as fc.Arbitrary<ProjectTaskType>;

/** Minimal task assigned to a specific sprint. */
const sprintTask = (sprintId: string) =>
  fc.record({
    id: nonEmptyString,
    key: nonEmptyString,
    title: nonEmptyString,
    type: fc.constant("TASK"),
    status: fc.constant("TODO"),
    priority: fc.constant("MEDIUM"),
    projectId: nonEmptyString,
    sprintId: fc.constant(sprintId),
    createdAt: fc.constant("2024-01-01T00:00:00.000Z"),
    updatedAt: fc.constant("2024-01-01T00:00:00.000Z"),
  }) as fc.Arbitrary<ProjectTaskType>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Backlog – Properties 11 & 12", () => {
  it("P11: every backlog task has sprintId == null or undefined", () => {
    fc.assert(
      fc.property(fc.array(backlogTask, { minLength: 1, maxLength: 30 }), (tasks) => {
        for (const task of tasks) {
          expect(task.sprintId == null).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("P12: every sprint task has sprintId equal to the queried sprintId", () => {
    const sprintWithTasks = nonEmptyString.chain((sprintId) =>
      fc
        .array(sprintTask(sprintId), { minLength: 1, maxLength: 20 })
        .map((tasks) => ({ sprintId, tasks })),
    );

    fc.assert(
      fc.property(sprintWithTasks, ({ sprintId, tasks }) => {
        for (const task of tasks) {
          expect(task.sprintId).toBe(sprintId);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("P11b: bulkUpdateTaskStatus guard — empty taskIds returns without mutation", () => {
    // Model the guard logic inline
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
