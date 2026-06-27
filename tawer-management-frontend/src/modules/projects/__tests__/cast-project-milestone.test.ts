/**
 * Property 18: Milestone completedAt nullable consistency
 * Validates: Requirement 2.9
 *
 * For any MilestoneType where completedAt !== null,
 * completedAt instanceof Date SHALL be true.
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { castMilestoneToFrontend } from "@/modules/projects/types/cast-project-milestone";
import type { MilestoneInResponseType } from "@/modules/projects/types/project-milestones";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const isoDateString = fc
  .integer({ min: 0, max: Date.now() })
  .map((ms) => new Date(ms).toISOString());

const nonEmptyString = fc.string({ minLength: 1, maxLength: 50 });

/** Raw milestone with completedAt present (non-null). */
const milestoneWithCompletedAt = fc.record<MilestoneInResponseType>({
  id: nonEmptyString,
  projectId: nonEmptyString,
  name: nonEmptyString,
  description: fc.option(nonEmptyString, { nil: undefined }),
  dueDate: fc.option(isoDateString, { nil: null }) as fc.Arbitrary<string | null>,
  completedAt: isoDateString,
  totalTasks: fc.integer(),
  doneTasks: fc.integer(),
  progress: fc.integer(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

/** Raw milestone with completedAt explicitly null. */
const milestoneWithNullCompletedAt = fc.record<MilestoneInResponseType>({
  id: nonEmptyString,
  projectId: nonEmptyString,
  name: nonEmptyString,
  description: fc.option(nonEmptyString, { nil: undefined }),
  dueDate: fc.option(isoDateString, { nil: null }) as fc.Arbitrary<string | null>,
  completedAt: fc.constant(null),
  totalTasks: fc.integer(),
  doneTasks: fc.integer(),
  progress: fc.integer(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("castMilestoneToFrontend – Property 18: Milestone completedAt nullable consistency", () => {
  it("P18a: completedAt is instanceof Date when raw completedAt is an ISO string", () => {
    fc.assert(
      fc.property(milestoneWithCompletedAt, (raw) => {
        const result = castMilestoneToFrontend(raw);
        expect(result.completedAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 },
    );
  });

  it("P18b: completedAt is null when raw completedAt is null", () => {
    fc.assert(
      fc.property(milestoneWithNullCompletedAt, (raw) => {
        const result = castMilestoneToFrontend(raw);
        expect(result.completedAt).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it("P18c: dueDate, createdAt, updatedAt are always instanceof Date", () => {
    fc.assert(
      fc.property(milestoneWithCompletedAt, (raw) => {
        const result = castMilestoneToFrontend(raw);
        if (result.dueDate) {
          expect(result.dueDate).toBeInstanceOf(Date);
        }
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 },
    );
  });
});
