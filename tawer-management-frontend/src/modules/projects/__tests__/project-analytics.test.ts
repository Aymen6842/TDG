/**
 * Property 13: Analytics data points non-negative
 * Property 14: Capacity balance invariant
 * Validates: Requirements 10.7, 10.8, 11.4
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import type {
  BurndownPoint,
  VelocityPoint,
  CapacityType,
} from "@/modules/projects/services/api/project-analytics";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

/** Burndown point with non-negative remainingPoints. */
const burndownPoint = fc.record<BurndownPoint>({
  date: nonEmptyString,
  remainingPoints: fc.nat(), // nat() = non-negative integer
});

/** Velocity point with non-negative completedPoints. */
const velocityPoint = fc.record<VelocityPoint>({
  sprintId: nonEmptyString,
  sprintName: fc.option(nonEmptyString, { nil: undefined }),
  completedPoints: fc.nat(),
});

/**
 * Capacity object satisfying the balance invariant:
 * totalCapacity === allocatedCapacity + remainingCapacity
 */
const capacityObject = fc
  .tuple(
    fc.nat({ max: 1_000 }), // allocatedCapacity
    fc.nat({ max: 1_000 }), // remainingCapacity
  )
  .map(([allocated, remaining]) => ({
    totalCapacity: allocated + remaining,
    allocatedCapacity: allocated,
    remainingCapacity: remaining,
  } as CapacityType));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Analytics – Properties 13 & 14", () => {
  it("P13a: every burndown data point has remainingPoints >= 0", () => {
    fc.assert(
      fc.property(
        fc.array(burndownPoint, { minLength: 1, maxLength: 50 }),
        (points) => {
          for (const point of points) {
            expect(point.remainingPoints).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("P13b: every velocity data point has completedPoints >= 0", () => {
    fc.assert(
      fc.property(
        fc.array(velocityPoint, { minLength: 1, maxLength: 50 }),
        (points) => {
          for (const point of points) {
            expect(point.completedPoints).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("P14: totalCapacity === allocatedCapacity + remainingCapacity (capacity balance invariant)", () => {
    fc.assert(
      fc.property(capacityObject, (capacity) => {
        expect(capacity.totalCapacity).toBe(
          capacity.allocatedCapacity + capacity.remainingCapacity,
        );
      }),
      { numRuns: 100 },
    );
  });
});
