/**
 * Property 18 (reminders): Reminder date fields cast to Date instances
 * Validates: Requirement 13.9
 *
 * For any ReminderInResponseType, castReminderToFrontend SHALL produce
 * reminderAt, createdAt, and updatedAt as instanceof Date.
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { castReminderToFrontend } from "@/modules/reminders/types/cast-reminder";
import type {
  ReminderInResponseType,
  ChannelType,
  ReminderEntityType,
  ReminderStatus,
} from "@/modules/reminders/types/reminders";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const VALID_CHANNELS: ChannelType[] = ["EMAIL", "TELEGRAM", "PUSH", "NTFY"];
const VALID_ENTITY_TYPES: ReminderEntityType[] = ["TASK", "SPRINT", "MILESTONE", "PROJECT", "CUSTOM"];
const VALID_STATUSES: ReminderStatus[] = ["PENDING", "SENT", "DISMISSED", "FAILED", "CANCELLED"];

const isoDateString = fc
  .integer({ min: 0, max: Date.now() })
  .map((ms) => new Date(ms).toISOString());

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

const validChannel = fc.constantFrom(...VALID_CHANNELS);
const validEntityType = fc.constantFrom(...VALID_ENTITY_TYPES);
const validStatus = fc.constantFrom(...VALID_STATUSES);

const channelObject = fc.record({
  id: nonEmptyString,
  channel: validChannel,
});

const rawReminder = fc.record<ReminderInResponseType>({
  id: nonEmptyString,
  userId: nonEmptyString,
  entityType: validEntityType,
  entityId: fc.option(nonEmptyString, { nil: null }) as fc.Arbitrary<string | null>,
  projectId: fc.option(nonEmptyString, { nil: null }) as fc.Arbitrary<string | null>,
  taskId: fc.option(nonEmptyString, { nil: null }) as fc.Arbitrary<string | null>,
  milestoneId: fc.option(nonEmptyString, { nil: null }) as fc.Arbitrary<string | null>,
  message: fc.option(nonEmptyString, { nil: null }) as fc.Arbitrary<string | null>,
  reminderAt: isoDateString,
  channels: fc.array(channelObject, { minLength: 1, maxLength: 4 }),
  isRecurring: fc.boolean(),
  recurrenceRule: fc.option(nonEmptyString, { nil: null }) as fc.Arbitrary<string | null>,
  createdById: nonEmptyString,
  status: validStatus,
  sentAt: fc.option(isoDateString, { nil: null }) as fc.Arbitrary<string | null>,
  dismissedAt: fc.option(isoDateString, { nil: null }) as fc.Arbitrary<string | null>,
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("castReminderToFrontend – Property 18: date fields cast to Date", () => {
  it("P18: reminderAt is instanceof Date after cast", () => {
    fc.assert(
      fc.property(rawReminder, (raw) => {
        const result = castReminderToFrontend(raw);
        expect(result.reminderAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 },
    );
  });

  it("P18b: createdAt and updatedAt are instanceof Date after cast", () => {
    fc.assert(
      fc.property(rawReminder, (raw) => {
        const result = castReminderToFrontend(raw);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 },
    );
  });

  it("P18c: channels are preserved exactly through cast", () => {
    fc.assert(
      fc.property(rawReminder, (raw) => {
        const result = castReminderToFrontend(raw);
        expect(result.channels).toEqual(raw.channels);
      }),
      { numRuns: 100 },
    );
  });

  it("P18d: isRecurring is preserved exactly through cast", () => {
    fc.assert(
      fc.property(rawReminder, (raw) => {
        const result = castReminderToFrontend(raw);
        expect(result.isRecurring).toBe(raw.isRecurring);
      }),
      { numRuns: 100 },
    );
  });
});
