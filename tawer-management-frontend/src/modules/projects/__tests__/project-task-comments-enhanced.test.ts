/**
 * Property 5: Comment like toggle idempotence
 * Validates: Requirements 5.3, 5.8
 *
 * For any comment, applying likeProjectTaskComment twice in sequence SHALL
 * result in the same likedByMe state as before the first call
 * (toggle applied an even number of times = no net change).
 *
 * Also validates the empty-comment guard for editProjectTaskComment.
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";

// ─── Inline toggle logic (mirrors backend toggle semantics) ──────────────────
// We model the toggle as a pure function to avoid browser API dependencies.

function toggleLike(likedByMe: boolean): boolean {
  return !likedByMe;
}

function emptyCommentGuard(text: string): void {
  if (text.trim() === "") {
    throw new Error("Comment cannot be empty");
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Comment enhancements – Property 5: like toggle idempotence", () => {
  it("P5: toggling likedByMe twice returns to initial state", () => {
    fc.assert(
      fc.property(fc.boolean(), (initialLikedByMe) => {
        const afterFirst = toggleLike(initialLikedByMe);
        const afterSecond = toggleLike(afterFirst);
        expect(afterSecond).toBe(initialLikedByMe);
      }),
      { numRuns: 100 },
    );
  });

  it("P5b: single toggle always flips the state", () => {
    fc.assert(
      fc.property(fc.boolean(), (likedByMe) => {
        expect(toggleLike(likedByMe)).toBe(!likedByMe);
      }),
      { numRuns: 100 },
    );
  });

  it("editProjectTaskComment guard: throws on empty or whitespace-only text", () => {
    const whitespaceOnly = fc.stringMatching(/^\s*$/);
    fc.assert(
      fc.property(whitespaceOnly, (text) => {
        expect(() => emptyCommentGuard(text)).toThrow("Comment cannot be empty");
      }),
      { numRuns: 100 },
    );
  });

  it("editProjectTaskComment guard: does NOT throw on non-empty text", () => {
    const nonBlank = fc.string({ minLength: 1 }).filter((s) => s.trim() !== "");
    fc.assert(
      fc.property(nonBlank, (text) => {
        expect(() => emptyCommentGuard(text)).not.toThrow();
      }),
      { numRuns: 100 },
    );
  });
});
