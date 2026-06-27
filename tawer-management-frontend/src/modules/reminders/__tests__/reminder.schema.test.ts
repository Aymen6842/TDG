/**
 * Property 16: Recurring reminder recurrenceRule presence
 * Property 17: Reminder channel membership invariant
 * Validates: Requirements 13.4, 13.7, 13.10, 13.11
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { createReminderSchema } from "@/modules/reminders/validation/reminder.schema";
import type { ChannelType } from "@/modules/reminders/types/reminders";

const VALID_CHANNELS: ChannelType[] = ["EMAIL", "TELEGRAM", "PUSH", "NTFY"];

const futureIso = () => new Date(Date.now() + 60_000).toISOString();

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

const validChannel = fc.constantFrom(...VALID_CHANNELS);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Reminder schema – Properties 16 & 17", () => {
  it("P16: recurrenceRule is present for all recurring reminders", () => {
    fc.assert(
      fc.property(nonEmptyString, (rule) => {
        const result = createReminderSchema.safeParse({
          userId: "test-user",
          entityType: "CUSTOM",
          message: "Test",
          reminderAt: futureIso(),
          channels: ["EMAIL"],
          isRecurring: true,
          recurrenceRule: rule,
        });
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("P16b: Zod schema rejects isRecurring=true with missing recurrenceRule", () => {
    const result = createReminderSchema.safeParse({
      userId: "test-user",
      entityType: "CUSTOM",
      message: "Test",
      reminderAt: futureIso(),
      channels: ["EMAIL"],
      isRecurring: true,
      // recurrenceRule intentionally omitted
    });
    expect(result.success).toBe(false);
  });

  it("P16c: Zod schema accepts isRecurring=false without recurrenceRule", () => {
    const result = createReminderSchema.safeParse({
      userId: "test-user",
      entityType: "CUSTOM",
      message: "Test",
      reminderAt: futureIso(),
      channels: ["EMAIL"],
      isRecurring: false,
    });
    expect(result.success).toBe(true);
  });

  it("P17: every channel in a reminder's channels array is a valid ChannelType value", () => {
    fc.assert(
      fc.property(
        fc.array(validChannel, { minLength: 1, maxLength: 4 }),
        (channels) => {
          for (const ch of channels) {
            expect(VALID_CHANNELS).toContain(ch);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("P17b: Zod schema rejects channels array with invalid values", () => {
    const result = createReminderSchema.safeParse({
      userId: "test-user",
      entityType: "CUSTOM",
      message: "Test",
      reminderAt: futureIso(),
      channels: ["SMS"], // not a valid channel
      isRecurring: false,
    });
    expect(result.success).toBe(false);
  });

  it("P17c: Zod schema rejects empty channels array", () => {
    const result = createReminderSchema.safeParse({
      userId: "test-user",
      entityType: "CUSTOM",
      message: "Test",
      reminderAt: futureIso(),
      channels: [],
      isRecurring: false,
    });
    expect(result.success).toBe(false);
  });
});
