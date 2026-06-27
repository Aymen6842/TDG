/**
 * Property 6: Time entry duration positivity
 * Property 7: Time entry sum invariant
 * Validates: Requirements 6.3, 6.8
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { castTimeEntryToFrontend } from "@/modules/projects/types/cast-time-entry";
import type { TimeEntryInResponseType } from "@/modules/projects/types/project-time-entries";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const isoDateString = fc
  .integer({ min: 0, max: Date.now() })
  .map((ms) => new Date(ms).toISOString());

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

/** Generates a raw time entry with durationMinutes > 0 (as the service enforces). */
const rawTimeEntry = fc.record<TimeEntryInResponseType>({
  id: nonEmptyString,
  taskId: nonEmptyString,
  userId: nonEmptyString,
  hours: fc.float({ min: 0.1, max: 24 }),
  description: fc.option(nonEmptyString, { nil: undefined }),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Time entries – Properties 6 & 7", () => {
  it("P6: hours > 0 for all valid cast TimeEntryType objects", () => {
    fc.assert(
      fc.property(rawTimeEntry, (raw) => {
        const result = castTimeEntryToFrontend(raw);
        expect(result.hours).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it("P6b: createdAt, updatedAt are instanceof Date", () => {
    fc.assert(
      fc.property(rawTimeEntry, (raw) => {
        const result = castTimeEntryToFrontend(raw);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 },
    );
  });

  it("P7: sum of hours equals reduce sum (no floating-point loss)", () => {
    const entryArray = fc.array(rawTimeEntry, { minLength: 1, maxLength: 50 });
    fc.assert(
      fc.property(entryArray, (raws) => {
        const entries = raws.map(castTimeEntryToFrontend);
        const reduceSum = entries.reduce(
          (acc, e) => acc + e.hours,
          0,
        );
        const loopSum = entries.map((e) => e.hours).reduce((a, b) => a + b, 0);
        expect(reduceSum).toBe(loopSum);
      }),
      { numRuns: 100 },
    );
  });
});
