# Implementation Plan: projects-shared-components

## Overview

Pure internal refactoring of `src/modules/projects/`. No user-visible behaviour changes — rendered
output must be identical before and after every task. Work is ordered lowest-risk first: service
facade → shared UI components → file splitting → wire consumers → delete old files.

## Tasks

- [x] 1. Create the Service Facade (`services/index.ts` + `services/api/`)
  - [x] 1.1 Create `services/api/projects.ts` — copy `services/extraction/projects.ts`, remove all `USE_MOCK` imports, `if (USE_MOCK())` branches, mock imports, and `// REMOVE THIS LINE FOR PROD` comments
    - _Requirements: 10.1, 10.2_
  - [x] 1.2 Create `services/api/project.ts` — same strip process from `services/extraction/project.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.3 Create `services/api/project-tasks.ts` — same strip process from `services/extraction/project-tasks.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.4 Create `services/api/project-creators.ts` — same strip process from `services/extraction/project-creators.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.5 Create `services/api/project-sprints.ts` — same strip process from `services/extraction/project-sprints.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.6 Create `services/api/project-upload.ts` — same strip process from `services/mutations/project-upload.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.7 Create `services/api/project-task-upload.ts` — same strip process from `services/mutations/project-task-upload.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.8 Create `services/api/project-task-deletion.ts` — same strip process from `services/mutations/project-task-deletion.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.9 Create `services/api/project-task-comment.ts` — same strip process from `services/mutations/project-task-comment.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.10 Create `services/api/project-lifecycle.ts` — same strip process from `services/mutations/project-lifecycle.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.11 Create `services/api/project-members.ts` — same strip process from `services/mutations/project-members.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.12 Create `services/api/sprint-upload.ts` — same strip process from `services/mutations/sprint-upload.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.13 Create `services/api/sprint-deletion.ts` — same strip process from `services/mutations/sprint-deletion.ts`
    - _Requirements: 10.1, 10.2_
  - [x] 1.14 Create `services/index.ts` — the Service Facade that imports from both `api/` and `mock/` and re-exports the correct implementation per function based on `USE_MOCK()`; match the exact export names and signatures used by existing hooks
    - _Requirements: 10.4, 10.5, 10.6_
  - [ ]* 1.15 Write property test for API files containing no mock code (Property 9)
    - **Property 9: API service files contain no mock code**
    - Static analysis: read each file in `services/api/`, assert source text does not contain `USE_MOCK`, `mock`, or `REMOVE THIS LINE FOR PROD`
    - **Validates: Requirements 10.2**
  - [ ]* 1.16 Write property test for Service Facade selecting correct implementation (Property 10)
    - **Property 10: Service facade selects correct implementation**
    - Mock `USE_MOCK` return value; assert each exported function identity matches the expected branch
    - **Validates: Requirements 10.5, 10.6**

- [x] 2. Migrate hooks to import from `services/index.ts`
  - [x] 2.1 Update `hooks/projects/use-projects.ts` — replace imports from `extraction/projects` and `extraction/project-creators` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.2 Update `hooks/projects/use-project.ts` — replace import from `extraction/project` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.3 Update `hooks/projects/use-project-upload.ts` — replace import from `mutations/project-upload` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.4 Update `hooks/projects/use-project-actions.ts` — replace import from `mutations/project-lifecycle` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.5 Update `hooks/tasks/use-project-tasks.ts` — replace import from `extraction/project-tasks` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.6 Update `hooks/tasks/use-project-task-upload.ts` — replace import from `mutations/project-task-upload` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.7 Update `hooks/tasks/use-project-task-comment.ts` — replace import from `mutations/project-task-comment` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.8 Update `hooks/members/use-project-members.ts` — replace import from `mutations/project-members` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.9 Update `hooks/members/use-project-invitations.ts` — replace import from `mutations/project-members` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.10 Update `hooks/sprints/use-project-sprints.ts` — replace import from `extraction/project-sprints` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.11 Update `hooks/sprints/use-sprint-upload.ts` — replace import from `mutations/sprint-upload` with `../../services`
    - _Requirements: 10.7_
  - [x] 2.12 Update `project-task-details-sheet.tsx` — replace direct import from `mutations/project-task-deletion` with `../../../services`
    - _Requirements: 10.7_
  - [x] 2.13 Update `project-detail/sprints/project-sprints.tsx` — replace direct import from `mutations/sprint-deletion` with `../../../services`
    - _Requirements: 10.7_
  - [ ]* 2.14 Write property test for hooks importing only from the facade (Property 11)
    - **Property 11: Hooks import services only from the facade**
    - Static analysis: read each hook file, assert import statements do not reference `services/api/`, `services/mock/`, `services/extraction/`, or `services/mutations/`
    - **Validates: Requirements 10.7**
  - [ ]* 2.15 Write property test for no dual api+mock imports (Property 12)
    - **Property 12: No file imports from both api and mock simultaneously**
    - Static analysis: for every file outside `services/index.ts`, assert it does not import from both `services/api/` and `services/mock/`
    - **Validates: Requirements 10.8**

- [x] 3. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 4. Delete old `services/extraction/` and `services/mutations/` directories
  - Delete all files under `services/extraction/` and `services/mutations/` now that all consumers import from `services/index.ts`
  - _Requirements: 10.9_

- [x] 5. Create shared UI primitives in `components/shared/`
  - [x] 5.1 Create `components/shared/empty-state.tsx` — exports `EmptyState` with `message` (required) and `description` (optional) props; renders centred flex container with `h-[calc(100vh-12rem)]`
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 5.2 Write property test for EmptyState (Property 4)
    - **Property 4: EmptyState renders message and optional description**
    - **Validates: Requirements 3.2, 3.3**
  - [x] 5.3 Create `components/shared/confirm-dialog.tsx` — exports `ConfirmDialog` wrapping `AlertDialog`; destructive action carries `bg-destructive text-destructive-foreground hover:bg-destructive/90`; `confirmLabel` defaults to "Confirm", `cancelLabel` defaults to "Cancel"
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_
  - [ ]* 5.4 Write property test for ConfirmDialog (Property 5)
    - **Property 5: ConfirmDialog renders destructive action with correct labels**
    - **Validates: Requirements 4.3, 4.5, 4.6**
  - [x] 5.5 Create `components/shared/dot-badge-option.tsx` — exports `DotBadgeSelectItem` and `DotBadgeToggle`; both render a coloured dot `<span>` and label
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 5.6 Write property test for DotBadge components (Property 6)
    - **Property 6: DotBadge components render dot and label**
    - **Validates: Requirements 5.2, 5.3**
  - [x] 5.7 Create `components/shared/section-header.tsx` — exports `SectionHeader` with `title` (h2), optional `description` (p), optional `actions` (right-aligned)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 5.8 Write property test for SectionHeader (Property 7)
    - **Property 7: SectionHeader renders title and conditional slots**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  - [x] 5.9 Create `components/shared/list-card.tsx` — exports `ListCard` with `avatar`, `primary`, `secondary`, `badge`, `actions` props; renders `flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors`
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 5.10 Write property test for ListCard (Property 8)
    - **Property 8: ListCard renders primary text**
    - **Validates: Requirements 7.2**
  - [x] 5.11 Create `components/shared/filter-section.tsx` — exports `FilterSection` with `label` and `children`; renders `<h4>` above children with `space-y-3`
    - _Requirements: 2.4_
  - [ ]* 5.12 Write property test for FilterSection (Property 3)
    - **Property 3: FilterSection renders label above children**
    - **Validates: Requirements 2.4**
  - [x] 5.13 Create `components/shared/filter-panel.tsx` — exports `FilterPanel` with `children`, optional `hasActiveFilters`, optional `onClear`; renders `space-y-6 p-4` wrapper; shows "Clear Filters" button only when `hasActiveFilters` is true
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 5.14 Write property test for FilterPanel (Property 2)
    - **Property 2: FilterPanel renders children and conditional clear button**
    - **Validates: Requirements 2.2, 2.3**
  - [x] 5.15 Create `components/shared/toolbar.tsx` — exports `Toolbar` with `search`, `onSearchChange`, optional `tabs`, `filterContent`, `activeFilterCount`, `viewMode`, `onViewModeChange`, `actions`; layout `flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center`; shows numeric Badge on filter button when `activeFilterCount > 0`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [ ]* 5.16 Write property test for Toolbar (Property 1)
    - **Property 1: Toolbar renders all provided props**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6**

- [x] 6. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 7. Split `projects-list.tsx` into focused files
  - [x] 7.1 Create `components/projects-filter-panel.tsx` — extract `renderFilterContent()` inline function into `ProjectsFilterPanel`; accept all filter state and setter props; use `FilterPanel` and `FilterSection` internally
    - _Requirements: 9.1, 8.3, 2.5_
  - [x] 7.2 Create `components/projects-bulk-bar.tsx` — extract selection checkbox and bulk-action Select bar into `ProjectsBulkBar`
    - _Requirements: 9.2_
  - [x] 7.3 Create `components/projects-dnd-grid.tsx` — extract DnD grid with `SortableContext` + `rectSortingStrategy` into `ProjectsDndGrid`
    - _Requirements: 9.3_
  - [x] 7.4 Create `components/projects-dnd-list.tsx` — extract DnD list with `SortableContext` + `restrictToVerticalAxis` into `ProjectsDndList`
    - _Requirements: 9.4_
  - [x] 7.5 Refactor `projects-list.tsx` to ≤120 lines — replace all extracted inline blocks with `<ProjectsFilterPanel>`, `<ProjectsBulkBar>`, `<ProjectsDndGrid>`, `<ProjectsDndList>`; use `<Toolbar>` and `<ConfirmDialog>` from shared
    - _Requirements: 9.5, 9.6, 1.8, 4.4, 8.2_

- [x] 8. Split `project-members.tsx` into focused files
  - [x] 8.1 Create `components/project-detail/members/members-list-card.tsx` — extract active-members `<Card>` with rows into `MembersListCard`; use `ListCard` for each row
    - _Requirements: 9.7, 7.4_
  - [x] 8.2 Create `components/project-detail/members/invitations-list-card.tsx` — extract pending-invitations `<Card>` with rows into `InvitationsListCard`; use `ListCard` for each row
    - _Requirements: 9.8, 7.4_
  - [x] 8.3 Create `components/project-detail/members/add-member-dialog.tsx` — extract Add Member `<Dialog>`, `addMemberSchema`, form, and `handleAddMember` logic into `AddMemberDialog`
    - _Requirements: 9.9_
  - [x] 8.4 Create `components/project-detail/members/invite-by-email-dialog.tsx` — extract Invite by Email `<Dialog>`, `inviteSchema`, form, and `handleInvite` logic into `InviteByEmailDialog`
    - _Requirements: 9.10_
  - [x] 8.5 Refactor `project-members.tsx` to ≤80 lines — replace all extracted inline blocks with `<MembersListCard>`, `<InvitationsListCard>`, `<AddMemberDialog>`, `<InviteByEmailDialog>`, `<SectionHeader>`, and two `<ConfirmDialog>` instances
    - _Requirements: 9.11, 9.12, 6.5, 4.4, 8.6_

- [x] 9. Split `project-task-details-sheet.tsx` into focused files
  - [x] 9.1 Create `components/project-detail/project-task/task-subtasks-section.tsx` — extract subtasks list and inline add form into `TaskSubtasksSection` accepting `{ projectId, task, onSubTaskDeleted }`
    - _Requirements: 9.13_
  - [x] 9.2 Create `components/project-detail/project-task/task-attachments-section.tsx` — extract attachments list and preview trigger into `TaskAttachmentsSection` accepting `{ attachments, onViewAttachment }`
    - _Requirements: 9.14_
  - [x] 9.3 Create `components/project-detail/project-task/task-comments-section.tsx` — extract comments list and comment form into `TaskCommentsSection` accepting `{ projectId, taskId, comments }`
    - _Requirements: 9.15_
  - [x] 9.4 Refactor `project-task-details-sheet.tsx` to ≤80 lines — replace all extracted inline blocks with `<TaskSubtasksSection>`, `<TaskAttachmentsSection>`, `<TaskCommentsSection>`; retain `<Sheet>` header, metadata grid, and `<ConfirmDialog>` for task deletion
    - _Requirements: 9.16, 9.17_

- [x] 10. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 11. Wire remaining consumers to shared components
  - [x] 11.1 Refactor `project-detail/sprints/project-sprints.tsx` — replace inline toolbar, filter panel, empty state, and confirm dialog with `<Toolbar>`, `<FilterPanel>`, `<FilterSection>`, `<EmptyState>`, `<ConfirmDialog>`
    - _Requirements: 1.8, 2.5, 3.4, 4.4_
  - [x] 11.2 Refactor `project-detail/project-task/project-tasks-toolbar.tsx` — replace inline filter panel layout and dot-badge items with `<FilterPanel>`, `<FilterSection>`, `<DotBadgeSelectItem>`, `<DotBadgeToggle>`; use `<Toolbar>` for the outer bar
    - _Requirements: 1.8, 2.5, 5.4, 8.4_
  - [x] 11.3 Refactor `project-detail/project-task/project-tasks-list.tsx` — replace inline empty state with `<EmptyState>`
    - _Requirements: 3.4_
  - [x] 11.4 Refactor `project-detail/project-task/project-tasks-kanban-board.tsx` — replace inline confirm dialog with `<ConfirmDialog>`
    - _Requirements: 4.4_
  - [x] 11.5 Refactor `project-detail/project-task/project-task-upload.tsx` — replace inline dot-badge items with `<DotBadgeSelectItem>` and `<DotBadgeToggle>`
    - _Requirements: 5.4_
  - [x] 11.6 Refactor `project-detail/settings/project-settings.tsx` — replace inline section header with `<SectionHeader>`
    - _Requirements: 6.5_

- [x] 12. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Every task must leave the app in a working state — no orphaned imports or broken renders
- The `services/mock/` directory is never modified
- Property tests use fast-check with a minimum of 100 iterations per property
- Each property test must include the comment `// Feature: projects-shared-components, Property N: ...`
