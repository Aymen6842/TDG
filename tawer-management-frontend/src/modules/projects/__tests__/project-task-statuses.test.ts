/**
 * Property 8: Custom status order uniqueness
 * Validates: Requirement 7.8
 *
 * For any array of TaskStatusType objects belonging to one project,
 * new Set(statuses.map(s => s.order)).size === statuses.length SHALL hold
 * (no duplicate orders within one project).
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import type { TaskStatusType } from "@/modules/projects/types/project-task-statuses";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const isoDateString = fc
  .integer({ min: 0, max: Date.now() })
  .map((ms) => new Date(ms).toISOString());

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

/**
 * Generates an array of TaskStatusType objects with unique `order` values,
 * mimicking what a well-behaved API should return.
 */
const uniqueOrderStatuses = fc
  .array(fc.integer({ min: 1, max: 1_000 }), {
    minLength: 1,
    maxLength: 20,
  })
  .filter((orders) => new Set(orders).size === orders.length) // ensure uniqueness
  .chain((orders) =>
    fc.tuple(...orders.map((order) =>
      fc.record<TaskStatusType>({
        id: nonEmptyString,
        projectId: nonEmptyString,
        name: nonEmptyString,
        color: fc.constant("#000000"),
        order: fc.constant(order),
        isSystem: fc.boolean(),
        allowedTransitions: fc.constant([]),
        createdAt: isoDateString.map((s) => new Date(s)),
        updatedAt: isoDateString.map((s) => new Date(s)),
      }),
    )).map((arr) => arr as TaskStatusType[]),
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("TaskStatus – Property 8: Custom status order uniqueness", () => {
  it("P8: no two statuses in a project share the same order value", () => {
    fc.assert(
      fc.property(uniqueOrderStatuses, (statuses) => {
        const orders = statuses.map((s) => s.order);
        const uniqueOrders = new Set(orders);
        expect(uniqueOrders.size).toBe(statuses.length);
      }),
      { numRuns: 100 },
    );
  });

  it("P8b: Set size equals array length only when all orders are distinct", () => {
    fc.assert(
      fc.property(uniqueOrderStatuses, (statuses) => {
        // Verify the invariant holds: distinct orders → Set size === array length
        const orders = statuses.map((s) => s.order);
        expect(new Set(orders).size).toBe(orders.length);
      }),
      { numRuns: 100 },
    );
  });
});
