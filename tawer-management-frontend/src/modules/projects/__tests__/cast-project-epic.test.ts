/**
 * Property 1: Epic date cast round-trip
 * Validates: Requirements 1.8, 1.9
 *
 * For any raw EpicInResponseType object with valid ISO date strings for
 * startDate and endDate, calling castEpicToFrontend(raw) SHALL produce an
 * object where both startDate and endDate are instanceof Date.
 * Also verifies createdAt and updatedAt are instanceof Date.
 * When startDate/endDate are undefined, they remain undefined after cast.
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { castEpicToFrontend } from "@/modules/projects/types/cast-project-epic";
import type { EpicInResponseType } from "@/modules/projects/types/project-epics";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Generates a valid ISO date string from a random timestamp between epoch and now. */
const isoDateString = fc
  .integer({ min: 0, max: Date.now() })
  .map((ms) => new Date(ms).toISOString());

/** Generates a non-empty ASCII string suitable for IDs and names. */
const nonEmptyString = fc.string({ minLength: 1, maxLength: 50 });

/** Full raw epic with both startDate and endDate present. */
const epicWithDates = fc.record<EpicInResponseType>({
  id: nonEmptyString,
  projectId: nonEmptyString,
  name: nonEmptyString,
  description: fc.option(nonEmptyString, { nil: undefined }),
  color: fc.option(nonEmptyString, { nil: undefined }),
  startDate: isoDateString,
  endDate: isoDateString,
  totalTasks: fc.integer(),
  doneTasks: fc.integer(),
  progress: fc.integer(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

/** Raw epic with startDate and endDate explicitly absent (undefined). */
const epicWithoutOptionalDates = fc.record<EpicInResponseType>({
  id: nonEmptyString,
  projectId: nonEmptyString,
  name: nonEmptyString,
  description: fc.option(nonEmptyString, { nil: undefined }),
  color: fc.option(nonEmptyString, { nil: undefined }),
  startDate: fc.constant(undefined),
  endDate: fc.constant(undefined),
  totalTasks: fc.integer(),
  doneTasks: fc.integer(),
  progress: fc.integer(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("castEpicToFrontend – Property 1: Epic date cast round-trip", () => {
  it(
    "P1a: startDate and endDate are instanceof Date when provided as ISO strings",
    () => {
      fc.assert(
        fc.property(epicWithDates, (raw) => {
          const result = castEpicToFrontend(raw);
          expect(result.startDate).toBeInstanceOf(Date);
          expect(result.endDate).toBeInstanceOf(Date);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "P1b: createdAt and updatedAt are always instanceof Date",
    () => {
      fc.assert(
        fc.property(epicWithDates, (raw) => {
          const result = castEpicToFrontend(raw);
          expect(result.createdAt).toBeInstanceOf(Date);
          expect(result.updatedAt).toBeInstanceOf(Date);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "P1c: startDate and endDate remain undefined when absent in raw object",
    () => {
      fc.assert(
        fc.property(epicWithoutOptionalDates, (raw) => {
          const result = castEpicToFrontend(raw);
          expect(result.startDate).toBeUndefined();
          expect(result.endDate).toBeUndefined();
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "P1d: createdAt and updatedAt are instanceof Date even when optional dates are absent",
    () => {
      fc.assert(
        fc.property(epicWithoutOptionalDates, (raw) => {
          const result = castEpicToFrontend(raw);
          expect(result.createdAt).toBeInstanceOf(Date);
          expect(result.updatedAt).toBeInstanceOf(Date);
        }),
        { numRuns: 100 },
      );
    },
  );
});
