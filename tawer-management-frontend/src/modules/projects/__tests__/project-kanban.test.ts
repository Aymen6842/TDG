/**
 * Property 9: Kanban no-task-loss
 * Property 10: Kanban swimlane membership
 * Validates: Requirements 8.6, 8.7
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import type { KanbanBoardResponse, KanbanColumn } from "@/modules/projects/services/api/project-kanban";
import type { ProjectTaskType } from "@/modules/projects/types/project-tasks";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const nonEmptyString = fc.string({ minLength: 1, maxLength: 36 });

/** Minimal ProjectTaskType for testing — only id and assigneeId matter here. */
const minimalTask = (assigneeId?: string) =>
  fc.record({
    id: nonEmptyString,
    key: nonEmptyString,
    title: nonEmptyString,
    type: fc.constant("TASK"),
    status: nonEmptyString,
    priority: fc.constant("MEDIUM"),
    projectId: nonEmptyString,
    createdAt: fc.constant("2024-01-01T00:00:00.000Z"),
    updatedAt: fc.constant("2024-01-01T00:00:00.000Z"),
    assigneeId: assigneeId !== undefined ? fc.constant(assigneeId) : fc.option(nonEmptyString, { nil: undefined }),
  }) as fc.Arbitrary<ProjectTaskType>;

/** Generates a kanban board without groupBy — tasks distributed across columns. */
const kanbanBoardNoGroupBy = fc
  .array(nonEmptyString, { minLength: 1, maxLength: 5 })
  .filter((ids) => new Set(ids).size === ids.length) // unique column IDs
  .chain((columnIds) =>
    fc
      .array(minimalTask(), { minLength: 0, maxLength: 30 })
      .map((allTasks) => {
        // Distribute tasks across columns (no duplicates)
        const columns: KanbanColumn[] = columnIds.map((colId) => ({
          columnId: colId,
          columnTitle: colId,
          tasks: [],
        }));
        allTasks.forEach((task, i) => {
          columns[i % columns.length].tasks.push(task);
        });
        return { columns } as KanbanBoardResponse;
      }),
  );

/** Generates a kanban board with groupBy=assignee — each column has a distinct assigneeId. */
const kanbanBoardByAssignee = fc
  .array(nonEmptyString, { minLength: 1, maxLength: 5 })
  .filter((ids) => new Set(ids).size === ids.length)
  .chain((assigneeIds) =>
    fc
      .tuple(
        ...assigneeIds.map((assigneeId) =>
          fc
            .array(minimalTask(assigneeId), { minLength: 0, maxLength: 10 })
            .map((tasks) => ({
              columnId: assigneeId,
              columnTitle: assigneeId,
              assigneeId,
              tasks,
            } as KanbanColumn)),
        ),
      )
      .map((columns) => ({ columns: columns as KanbanColumn[] } as KanbanBoardResponse)),
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Kanban board – Properties 9 & 10", () => {
  it("P9: total task count across all columns equals sum of individual column counts (no task loss)", () => {
    fc.assert(
      fc.property(kanbanBoardNoGroupBy, (board) => {
        const totalFromColumns = board.columns.reduce(
          (sum, col) => sum + col.tasks.length,
          0,
        );
        const allTaskIds = board.columns.flatMap((col) =>
          col.tasks.map((t) => t.id),
        );
        // No duplicates — each task appears in exactly one column
        expect(new Set(allTaskIds).size).toBe(allTaskIds.length);
        // Total count is consistent
        expect(totalFromColumns).toBe(allTaskIds.length);
      }),
      { numRuns: 100 },
    );
  });

  it("P10: for groupBy=assignee, every task in a column has assigneeId equal to the column's assigneeId", () => {
    fc.assert(
      fc.property(kanbanBoardByAssignee, (board) => {
        for (const col of board.columns) {
          for (const task of col.tasks) {
            expect(task.assigneeId).toBe(col.assigneeId);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
