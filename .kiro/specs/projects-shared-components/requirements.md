# Requirements Document

## Introduction

The projects module (`src/modules/projects/`) contains several files that define near-identical UI
patterns in isolation. The same toolbar layout (search input + filter dropdown + view-mode toggle),
the same "empty state" block, the same destructive `AlertDialog` confirmation, the same
`TooltipProvider`-wrapped action buttons, and the same dot-colored `Badge` select items are
copy-pasted across `projects-list.tsx`, `project-sprints.tsx`, `project-tasks-list.tsx`,
`project-tasks-toolbar.tsx`, `project-tasks-kanban-board.tsx`, and `project-members.tsx`.

Beyond duplicated UI patterns, several large files mix unrelated concerns: `projects-list.tsx`
(563 lines), `project-members.tsx` (458 lines), and `project-task-details-sheet.tsx` (407 lines)
each bundle multiple distinct sub-components inline. Additionally, every service file mixes real
API logic with mock logic using `if (USE_MOCK())` conditionals, polluting the production bundle
and making mock removal error-prone.

This spec covers three areas of improvement:
1. Centralising duplicated UI patterns into shared, single-responsibility components.
2. Splitting large files into focused, single-export files.
3. Isolating mock and API service logic behind a clean facade.

---

## Glossary

- **Module**: `src/modules/projects/` — the boundary within which all shared components must live.
- **Shared_Components**: Reusable UI components placed in `src/modules/projects/components/shared/`.
- **Toolbar**: The horizontal bar containing a search input, a filter dropdown, and a view-mode toggle that appears in the projects list, sprints list, and tasks list.
- **FilterPanel**: The content rendered inside the filter dropdown — a labelled set of `Select` / `Toggle` controls plus an optional "Clear Filters" link.
- **EmptyState**: A centred, full-height placeholder shown when a list has no items.
- **ConfirmDialog**: A destructive `AlertDialog` used to confirm irreversible actions (delete, remove, revoke).
- **ActionButtons**: The group of icon `Button` elements that appear on hover over a card (edit, delete, archive, status-change).
- **DotBadgeItem**: A `SelectItem` or `Toggle` that renders a coloured dot alongside a label, used for status/priority/type filters.
- **SectionHeader**: A `<h2>` title + `<p>` subtitle block that opens every detail tab (members, settings, sprints).
- **ListCard**: The `<div>` row used for members and invitations — avatar + metadata + role badge + action dropdown.
- **God_File**: A file that defines more than one exported UI component or mixes unrelated concerns.
- **Service_Facade**: `services/index.ts` — the single file that selects between API and mock implementations at runtime.
- **API_Services**: Pure API implementations in `services/api/` with no mock imports or conditionals.
- **Mock_Services**: Mock implementations in `services/mock/` that remain unchanged.

---

## Requirements

### Requirement 1: Shared Toolbar Component

**User Story:** As a developer, I want a single `Toolbar` component, so that the search + filter +
view-mode bar is defined once and used identically in the projects list, sprints list, and tasks list.

#### Acceptance Criteria

1. THE `Shared_Components` directory SHALL contain a `toolbar.tsx` file that exports a `Toolbar` component.
2. THE `Toolbar` SHALL accept a `search` string prop and an `onSearchChange` callback, and SHALL render a left-padded search `Input` with a `Search` icon.
3. THE `Toolbar` SHALL accept an optional `filterContent` ReactNode prop and, WHEN provided, SHALL render a `DropdownMenu` trigger button with a `SlidersHorizontal` icon.
4. WHEN one or more active filters exist, THE `Toolbar` SHALL render a numeric `Badge` indicator on the filter button showing the count of active filters.
5. THE `Toolbar` SHALL accept an optional `viewMode` and `onViewModeChange` prop pair and, WHEN provided, SHALL render a `ToggleGroup` with list and grid toggle items.
6. THE `Toolbar` SHALL accept an optional `actions` ReactNode prop and, WHEN provided, SHALL render those nodes on the right side of the toolbar.
7. THE `Toolbar` SHALL lay out tabs/status-tabs on the left and controls on the right, matching the existing `flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center` pattern.
8. WHEN `projects-list.tsx`, `project-sprints.tsx`, and `project-tasks-toolbar.tsx` are refactored, THE `Toolbar` component SHALL be the sole definition of the search-filter-viewmode bar in the module.

---

### Requirement 2: Shared FilterPanel Component

**User Story:** As a developer, I want a `FilterPanel` wrapper component, so that every filter
dropdown has a consistent layout with labelled sections and a "Clear Filters" link.

#### Acceptance Criteria

1. THE `Shared_Components` directory SHALL contain a `filter-panel.tsx` file that exports a `FilterPanel` component.
2. THE `FilterPanel` SHALL accept a `children` prop and SHALL render them inside a `div` with `space-y-6 p-4` spacing.
3. THE `FilterPanel` SHALL accept an optional `hasActiveFilters` boolean and an `onClear` callback and, WHEN `hasActiveFilters` is `true`, SHALL render a "Clear Filters" `Button` with a variant of `"link"` and an `X` icon.
4. THE `Shared_Components` directory SHALL contain a `filter-section.tsx` file that exports a `FilterSection` component accepting a `label` string and `children` prop, rendering a `<h4>` label above the children with `space-y-3` spacing.
5. WHEN `projects-list.tsx`, `project-sprints.tsx`, and `project-tasks-toolbar.tsx` are refactored, THE `FilterPanel` and `FilterSection` components SHALL be the sole definition of the filter dropdown layout in the module.

---

### Requirement 3: Shared EmptyState Component

**User Story:** As a developer, I want a single `EmptyState` component, so that every empty list
shows the same centred layout without redefining it.

#### Acceptance Criteria

1. THE `Shared_Components` directory SHALL contain an `empty-state.tsx` file that exports an `EmptyState` component.
2. THE `EmptyState` SHALL accept a `message` string prop and SHALL render it inside a centred flex container with `h-[calc(100vh-12rem)]` height.
3. THE `EmptyState` SHALL accept an optional `description` string prop and, WHEN provided, SHALL render it as a secondary paragraph below the message.
4. WHEN `projects-list.tsx`, `project-sprints.tsx`, and `project-tasks-list.tsx` are refactored, THE `EmptyState` component SHALL be the sole definition of the empty-list placeholder in the module.

---

### Requirement 4: Shared ConfirmDialog Component

**User Story:** As a developer, I want a single `ConfirmDialog` component, so that all destructive
confirmation dialogs are consistent and defined in one place.

#### Acceptance Criteria

1. THE `Shared_Components` directory SHALL contain a `confirm-dialog.tsx` file that exports a `ConfirmDialog` component.
2. THE `ConfirmDialog` SHALL accept `open`, `onOpenChange`, `title`, `description`, `onConfirm`, `onCancel`, `confirmLabel`, and `cancelLabel` props.
3. THE `ConfirmDialog` SHALL render an `AlertDialog` with a destructive `AlertDialogAction` styled with `bg-destructive text-destructive-foreground hover:bg-destructive/90`.
4. WHEN `projects-list.tsx`, `project-sprints.tsx`, `project-tasks-kanban-board.tsx`, and `project-members.tsx` are refactored, THE `ConfirmDialog` component SHALL be the sole definition of the destructive confirmation dialog in the module.
5. IF `confirmLabel` is not provided, THEN THE `ConfirmDialog` SHALL default to a generic "Confirm" label.
6. IF `cancelLabel` is not provided, THEN THE `ConfirmDialog` SHALL default to a generic "Cancel" label.

---

### Requirement 5: Shared DotBadgeSelectItem and DotBadgeToggle Components

**User Story:** As a developer, I want shared `DotBadgeSelectItem` and `DotBadgeToggle` components,
so that coloured-dot option items are defined once and used consistently across all filter controls.

#### Acceptance Criteria

1. THE `Shared_Components` directory SHALL contain a `dot-badge-option.tsx` file that exports a `DotBadgeSelectItem` component and a `DotBadgeToggle` component.
2. THE `DotBadgeSelectItem` SHALL accept `value`, `dotColorClass`, and `label` props and SHALL render a `SelectItem` containing a coloured dot `<span>` and the label.
3. THE `DotBadgeToggle` SHALL accept `value`, `dotColorClass`, `label`, `pressed`, and `onPressedChange` props and SHALL render a `Toggle` with `variant="outline"` containing a coloured dot `<span>` and the label.
4. WHEN `project-tasks-toolbar.tsx` and `project-task-upload.tsx` are refactored, THE `DotBadgeSelectItem` and `DotBadgeToggle` components SHALL be the sole definition of dot-coloured option items in the module.

---

### Requirement 6: Shared SectionHeader Component

**User Story:** As a developer, I want a `SectionHeader` component, so that every detail tab opens
with the same title + subtitle layout.

#### Acceptance Criteria

1. THE `Shared_Components` directory SHALL contain a `section-header.tsx` file that exports a `SectionHeader` component.
2. THE `SectionHeader` SHALL accept a `title` string prop and SHALL render it as an `<h2>` with `text-xl font-semibold tracking-tight`.
3. THE `SectionHeader` SHALL accept an optional `description` string prop and, WHEN provided, SHALL render it as a `<p>` with `text-sm text-muted-foreground`.
4. THE `SectionHeader` SHALL accept an optional `actions` ReactNode prop and, WHEN provided, SHALL render those nodes aligned to the right of the title row.
5. WHEN `project-members.tsx` and `project-settings.tsx` are refactored, THE `SectionHeader` component SHALL be the sole definition of the section title block in the module.

---

### Requirement 7: Shared ListCard Component

**User Story:** As a developer, I want a `ListCard` component, so that the member row and invitation
row in `project-members.tsx` share a single layout definition.

#### Acceptance Criteria

1. THE `Shared_Components` directory SHALL contain a `list-card.tsx` file that exports a `ListCard` component.
2. THE `ListCard` SHALL accept `avatar` (ReactNode), `primary` (string), `secondary` (ReactNode), `badge` (ReactNode), and `actions` (ReactNode) props.
3. THE `ListCard` SHALL render a `div` with `flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors`.
4. WHEN `project-members.tsx` is refactored, THE `ListCard` component SHALL be used for both the active-member rows and the pending-invitation rows.

---

### Requirement 8: File Size and Structure Constraints

**User Story:** As a developer, I want every file in the projects module to have a single clear
responsibility, so that the codebase stays navigable and consistent.

#### Acceptance Criteria

1. THE `Module` SHALL contain a `components/shared/` directory as the canonical location for all shared UI components.
2. WHEN a file in the `Module` is refactored, THE file SHALL export no more than one primary component.
3. THE `projects-list.tsx` file SHALL NOT define any inline filter content render functions; THE file SHALL delegate to `FilterPanel` and `FilterSection`.
4. THE `project-tasks-toolbar.tsx` file SHALL NOT define the filter panel layout inline; THE file SHALL delegate to `FilterPanel` and `FilterSection`.
5. THE `project-sprints.tsx` file SHALL NOT define the filter panel layout inline; THE file SHALL delegate to `FilterPanel` and `FilterSection`.
6. THE `project-members.tsx` file SHALL NOT define both the member list and the invitation list as inline JSX blocks; THE file SHALL delegate to `ListCard` for each row.
7. WHILE a shared component exists in `Shared_Components`, THE `Module` SHALL NOT redefine an equivalent component in any other file.
8. THE folder structure of `Shared_Components` SHALL follow the existing naming convention of the module (kebab-case filenames, one component per file).
9. No file in the `Module` SHALL exceed 200 lines.
10. Files that are pure orchestration (composing sub-components without owning logic) SHOULD target under 120 lines.
11. Each file in the `Module` SHALL have exactly one default or named export that is its primary concern.

---

### Requirement 9: Component File Splitting

**User Story:** As a developer, I want large component files split into focused single-export files,
so that each file has one clear responsibility and stays within the line-count budget.

#### Acceptance Criteria

##### projects-list.tsx

1. THE `Module` SHALL contain a `projects-filter-panel.tsx` file that exports a `ProjectsFilterPanel` component encapsulating all `Select` filter controls previously defined inline in `renderFilterContent()`.
2. THE `Module` SHALL contain a `projects-bulk-bar.tsx` file that exports a `ProjectsBulkBar` component encapsulating the selection checkbox and bulk-action `Select` bar.
3. THE `Module` SHALL contain a `projects-dnd-grid.tsx` file that exports a `ProjectsDndGrid` component encapsulating the DnD grid layout with `SortableContext`.
4. THE `Module` SHALL contain a `projects-dnd-list.tsx` file that exports a `ProjectsDndList` component encapsulating the DnD list layout with `SortableContext`.
5. WHEN the above extractions are complete, THE `projects-list.tsx` file SHALL contain no more than 120 lines of orchestration code and SHALL NOT define any of the extracted components inline.
6. Each extracted file SHALL live in the same directory as `projects-list.tsx` and SHALL export exactly one component.

##### project-members.tsx

7. THE `Module` SHALL contain a `members-list-card.tsx` file that exports a `MembersListCard` component encapsulating the active-members `Card` with its rows.
8. THE `Module` SHALL contain an `invitations-list-card.tsx` file that exports an `InvitationsListCard` component encapsulating the pending-invitations `Card` with its rows.
9. THE `Module` SHALL contain an `add-member-dialog.tsx` file that exports an `AddMemberDialog` component encapsulating the "Add Member" `Dialog`, its `addMemberSchema`, `AddMemberForm`, and `handleAddMember` logic.
10. THE `Module` SHALL contain an `invite-by-email-dialog.tsx` file that exports an `InviteByEmailDialog` component encapsulating the "Invite by Email" `Dialog`, its `inviteSchema`, `InviteForm`, and `handleInvite` logic.
11. WHEN the above extractions are complete, THE `project-members.tsx` file SHALL contain no more than 80 lines of orchestration code and SHALL NOT define any of the extracted components inline.
12. Each extracted file SHALL live in the same directory as `project-members.tsx` and SHALL export exactly one component.

##### project-task-details-sheet.tsx

13. THE `Module` SHALL contain a `task-subtasks-section.tsx` file that exports a `TaskSubtasksSection` component encapsulating the subtasks list and inline add form.
14. THE `Module` SHALL contain a `task-attachments-section.tsx` file that exports a `TaskAttachmentsSection` component encapsulating the attachments list.
15. THE `Module` SHALL contain a `task-comments-section.tsx` file that exports a `TaskCommentsSection` component encapsulating the comments list and comment form.
16. WHEN the above extractions are complete, THE `project-task-details-sheet.tsx` file SHALL contain no more than 80 lines of orchestration code and SHALL NOT define any of the extracted components inline.
17. Each extracted file SHALL live in the same directory as `project-task-details-sheet.tsx` and SHALL export exactly one component.

---

### Requirement 10: Mock/API Service Isolation

**User Story:** As a developer, I want mock and API service logic fully separated behind a single
facade, so that the production bundle contains no mock code and removing mock support requires
touching only three files.

#### Acceptance Criteria

1. THE `Module` SHALL contain a `services/api/` directory with pure API implementation files: `projects.ts`, `project.ts`, `project-tasks.ts`, `project-upload.ts`, `project-task-upload.ts`, `project-task-deletion.ts`, `project-task-comment.ts`, `project-lifecycle.ts`, `project-members.ts`, `project-sprints.ts`, `project-creators.ts`, `sprint-upload.ts`, and `sprint-deletion.ts`.
2. Each file in `services/api/` SHALL contain zero `import { USE_MOCK }` statements, zero `if (USE_MOCK())` conditionals, zero mock imports, and zero `// REMOVE THIS LINE FOR PROD` comments.
3. THE `services/mock/` directory SHALL remain unchanged; existing mock files (`projects.mock.ts`, `project.mock.ts`, `project-tasks.mock.ts`, `mutations.mock.ts`, `project-sprints.mock.ts`) SHALL NOT be modified as part of this refactoring.
4. THE `Module` SHALL contain a `services/index.ts` file that is the `Service_Facade` — the single file that imports from both `services/api/` and `services/mock/` and re-exports the correct implementation per function based on `USE_MOCK()`.
5. WHEN `USE_MOCK()` returns `true`, THE `Service_Facade` SHALL export mock implementations for all service functions.
6. WHEN `USE_MOCK()` returns `false`, THE `Service_Facade` SHALL export API implementations for all service functions.
7. All hooks in the `Module` SHALL import service functions exclusively from `services/index.ts` and SHALL NOT import directly from `services/api/` or `services/mock/`.
8. No file outside `services/index.ts` SHALL import from both `services/api/` and `services/mock/` simultaneously.
9. THE old `services/extraction/` and `services/mutations/` directories SHALL be deleted after all hooks are migrated to import from `services/index.ts`.
10. IF a developer removes mock support for production, THEN deleting `services/mock/`, removing the mock branch from `services/index.ts`, and deleting `src/lib/mock-config.ts` SHALL be sufficient — no other file SHALL require modification.
