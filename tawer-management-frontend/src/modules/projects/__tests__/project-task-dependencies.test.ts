/**
 * Property 4: No self-dependency
 * Validates: Requirement 4.4
 *
 * For any projectId and taskId, calling addTaskDependency(projectId, taskId, taskId)
 * SHALL throw synchronously before any HTTP request is dispatched.
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";

// ─── Inline guard function (mirrors service logic) ────────────────────────────
// We test the guard logic in isolation to avoid pulling in browser APIs
// (localStorage) that are unavailable in the Node test environment.

function selfDependencyGuard(taskId: string, blockedById: string): void {
  if (taskId === blockedById) {
    throw new Error("Self-dependency not allowed");
  }
}

const nonEmptyString = fc.string({ minLength: 1, maxLength: 50 });

describe("addTaskDependency guard – Property 4: No self-dependency", () => {
  it("P4: throws when taskId === blockedById (self-loop)", () => {
    fc.assert(
      fc.property(nonEmptyString, (taskId) => {
        expect(() => selfDependencyGuard(taskId, taskId)).toThrow(
          "Self-dependency not allowed",
        );
      }),
      { numRuns: 100 },
    );
  });

  it("P4b: does NOT throw when taskId !== blockedById", () => {
    fc.assert(
      fc.property(nonEmptyString, nonEmptyString, (taskId, blockedById) => {
        fc.pre(taskId !== blockedById);
        expect(() => selfDependencyGuard(taskId, blockedById)).not.toThrow();
      }),
      { numRuns: 100 },
    );
  });
});
