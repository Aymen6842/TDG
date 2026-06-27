/**
 * Property 2: Label name preserved through cast
 * Property 3: Label color format invariant
 * Validates: Requirements 3.9, 3.10, 3.11
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { castLabelToFrontend } from "@/modules/projects/types/cast-project-label";
import type { LabelInResponseType } from "@/modules/projects/types/project-labels";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const isoDateString = fc
  .integer({ min: 0, max: Date.now() })
  .map((ms) => new Date(ms).toISOString());

const nonEmptyString = fc.string({ minLength: 1, maxLength: 50 });

/** Generates a valid 6-digit hex color string e.g. #A1B2C3 */
const hexColor = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
  )
  .map(
    ([r, g, b]) =>
      `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase(),
  );

const rawLabel = fc.record<LabelInResponseType>({
  id: nonEmptyString,
  projectId: nonEmptyString,
  name: nonEmptyString,
  color: hexColor,
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("castLabelToFrontend – Properties 2 & 3", () => {
  it("P2: name is preserved exactly through cast", () => {
    fc.assert(
      fc.property(rawLabel, (raw) => {
        const result = castLabelToFrontend(raw);
        expect(result.name).toBe(raw.name);
      }),
      { numRuns: 100 },
    );
  });

  it("P3: color matches hex format /^#[0-9A-Fa-f]{6}$/ after cast", () => {
    fc.assert(
      fc.property(rawLabel, (raw) => {
        const result = castLabelToFrontend(raw);
        expect(result.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }),
      { numRuns: 100 },
    );
  });

  it("P3b: color is preserved exactly through cast", () => {
    fc.assert(
      fc.property(rawLabel, (raw) => {
        const result = castLabelToFrontend(raw);
        expect(result.color).toBe(raw.color);
      }),
      { numRuns: 100 },
    );
  });

  it("createdAt and updatedAt are instanceof Date after cast", () => {
    fc.assert(
      fc.property(rawLabel, (raw) => {
        const result = castLabelToFrontend(raw);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 },
    );
  });
});
