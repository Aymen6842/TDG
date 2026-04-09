# Projects Module Documentation

This document covers every file in `src/modules/projects/`, organized folder by folder.

---

## types/

### `types/projects.ts`
**Purpose:** Defines all TypeScript types for the projects domain — enums, backend response shapes, mutation payloads, and the frontend-facing `ProjectType`.

**Exports:**
- `ProjectStatus` — union type: `"Running" | "Pending" | "Stopped" | "Completed"`
- `ProjectLanguage` — union type: `"Arabic" | "French" | "English"`
- `ProjectTypeEnum` — union type: `"AGILE" | "FREESTYLE"`
- `BusinessUnit` — union type: `"TawerDev" | "TawerCreative"`
- `ProjectMemberInResponse` — raw API shape for a project member
- `ProjectInvitationInResponse` — raw API shape for a project invitation
- `ProjectContentInResponse` — raw API shape for a project content (i18n name/description)
- `ProjectInResponseType` — full raw API response shape for a project
- `CreatedProjectDto` — POST /projects/register response DTO
- `UpdatedProjectDto` — PATCH /projects/:id response DTO
- `CreatedProjectMemberDto` — response DTO for adding a member
- `UpdatedProjectMemberDto` — response DTO for updating a member role
- `CreatedInvitationDto` — response DTO for creating an invitation
- `ProjectContentPayload` — mutation payload for project content (create/update)
- `ProjectMemberPayload` — mutation payload for a project member
- `CreateProjectPayload` — full payload for POST /projects/register
- `UpdateProjectPayload` — partial payload for PATCH /projects/:id
- `AddMemberPayload` — payload for adding a member (by userId or email)
- `UpdateMemberRolePayload` — payload for updating a member's manager role
- `CreateInvitationPayload` — payload for creating an email invitation
- `AcceptInvitationPayload` — payload for accepting an invitation via token
- `ProjectMember` — frontend shape for a project member (dates as `Date`)
- `ProjectInvitation` — frontend shape for a project invitation (dates as `Date`)
- `ProjectContent` — frontend shape for a project content entry (dates as `Date`)
- `ProjectType` — main frontend shape for a project, used throughout the UI


### `types/project-tasks.ts`
**Purpose:** Defines all TypeScript types for project tasks — enums, backend response shapes, and the frontend `ProjectTaskType`.

**Exports:**
- `EnumProjectTaskStatus` — enum: `BACKLOG | TODO | IN_PROGRESS | TESTING | IN_REVIEW | DONE`
- `EnumProjectTaskPriority` — enum: `URGENT | HIGH | MEDIUM | LOW`
- `EnumProjectTaskType` — enum: `STORY | TASK | BUG | SPIKE | EPIC`
- `ProjectTaskCommentInResponse` — raw API shape for a task comment
- `ProjectTaskSubTaskInResponse` — raw API shape for a subtask
- `ProjectTaskInResponseType` — full raw API response shape for a project task
- `ProjectTaskComment` — frontend shape for a task comment
- `ProjectTaskSubTask` — frontend shape for a subtask
- `ProjectTaskType` — main frontend shape for a project task, used throughout the UI

### `types/project-sprints.ts`
**Purpose:** Defines all TypeScript types for project sprints — status/language unions, backend response shapes, mutation payloads, and the frontend `SprintType`.

**Exports:**
- `SprintStatus` — union type: `"Pending" | "Running" | "Stopped" | "Completed"`
- `SprintLanguage` — union type: `"Arabic" | "French" | "English"`
- `SprintContentInResponse` — raw API shape for sprint content (i18n name/description)
- `SprintInResponseType` — full raw API response shape for a sprint
- `SprintContentPayload` — mutation payload for sprint content
- `CreateSprintPayload` — full payload for POST /projects/:id/sprints
- `UpdateSprintPayload` — partial payload for PATCH /projects/:id/sprints/:id
- `SprintContent` — frontend shape for sprint content (dates as `Date`)
- `SprintType` — main frontend shape for a sprint, used throughout the UI

### `types/cast-project.ts`
**Purpose:** Provides a pure function that converts a raw `ProjectInResponseType` from the API into the frontend `ProjectType`, converting ISO date strings to `Date` objects and deriving computed fields like `slug` and `name`.

**Exports:**
- `castProjectToFrontend(raw: ProjectInResponseType): ProjectType` — maps raw API response to the frontend project shape

### `types/cast-project-task.ts`
**Purpose:** Provides a pure function that converts a raw `ProjectTaskInResponseType` from the API into the frontend `ProjectTaskType`, mapping nested comments and subtasks.

**Exports:**
- `castProjectTaskToFrontend(raw: ProjectTaskInResponseType): ProjectTaskType` — maps raw API response to the frontend task shape

### `types/cast-project-sprint.ts`
**Purpose:** Provides a pure function that converts a raw `SprintInResponseType` from the API into the frontend `SprintType`, converting ISO date strings to `Date` objects and extracting the primary content entry.

**Exports:**
- `castSprintToFrontend(raw: SprintInResponseType): SprintType` — maps raw API response to the frontend sprint shape


---

## validation/

### `validation/project.schema.ts`
**Purpose:** Defines the Zod validation schema for the project create/update form and exports the inferred TypeScript type.

**Exports:**
- `projectSchema` — Zod object schema validating name, description, details, language, businessUnit, projectType, status, startDate, endDate, estimatedStartDate, estimatedEndDate, paid, isArchived, displayOrder, and manager fields
- `ProjectFormValues` — TypeScript type inferred from `projectSchema`

### `validation/project-task.schema.ts`
**Purpose:** Provides a factory function that builds the Zod validation schema for the project task form, accepting a translation function for i18n error messages.

**Exports:**
- `getProjectTaskFormSchema({ t }): ZodObject` — returns a Zod schema validating title, description, type, status, priority, storyPoints, dueDate, attachments, and deletedAttachments
- `ProjectTaskFormSchema` — TypeScript type inferred from the returned schema

### `validation/sprint.schema.ts`
**Purpose:** Defines the Zod validation schema for the sprint create/update form and exports the inferred TypeScript type.

**Exports:**
- `sprintSchema` — Zod object schema validating name, description, details, language, status, startDate, endDate, estimatedStartDate, and estimatedEndDate
- `SprintFormValues` — TypeScript type inferred from `sprintSchema`

---

## store/

### `store/projects.ts`
**Purpose:** Zustand store managing global UI state for the projects list page — selected project, active status tab, dialog/sheet visibility, and view mode.

**Exports:**
- `ProjectFilterTab` — type alias for the active tab value: `"all" | "Running" | "Pending" | "Stopped" | "Completed"`
- `ViewMode` — type alias: `"list" | "grid"`
- `useProjectStore` — Zustand store hook; manages `selectedProjectId`, `activeTab`, `isAddDialogOpen`, `isProjectSheetOpen`, `viewMode`, and their respective setters

### `store/project-tasks.ts`
**Purpose:** Zustand store managing global UI state for the project tasks view — selected task, dialog/sheet visibility, view mode, and which task attributes are visible in the list/kanban.

**Exports:**
- `useProjectTasksStore` — Zustand store hook; manages `selectedTodoId`, `isAddDialogOpen`, `isTodoSheetOpen`, `viewMode`, `visibleAttributes` (key, type, status, priority, points, assignee, milestone, epic), and their respective setters/togglers

---

## utils/

### `utils/badges/project-badges.ts`
**Purpose:** Exports Tailwind CSS class maps for rendering colored badges for project status, project type, and business unit.

**Exports:**
- `projectStatusClasses` — `Record<ProjectStatus, string>` mapping each status to badge CSS classes
- `projectTypeClasses` — `Record<ProjectTypeEnum, string>` mapping each project type to badge CSS classes
- `businessUnitClasses` — `Record<string, string>` mapping each business unit to badge CSS classes
- `businessUnitFallbackClasses` — fallback CSS string for unknown business units
- `businessUnitNamed` — `Record<string, string>` mapping business unit keys to display names (e.g. `"TawerDev"` → `"Tawer Dev"`)

### `utils/badges/project-task-badges.ts`
**Purpose:** Exports Tailwind CSS class maps for rendering colored badges and dot indicators for task status, priority, and type.

**Exports:**
- `projectTaskStatusClasses` — badge CSS classes keyed by task status string
- `projectTaskStatusDotColors` — dot indicator CSS classes keyed by task status string
- `projectTaskPriorityClasses` — badge CSS classes keyed by task priority string
- `projectTaskPriorityDotColors` — dot indicator CSS classes keyed by task priority string
- `projectTaskTypeClasses` — badge CSS classes keyed by task type string
- `projectTaskTypeDotColors` — dot indicator CSS classes keyed by task type string
- `epicBadgeClasses` — fixed CSS string for epic badges

### `utils/badges/sprint-badges.ts`
**Purpose:** Exports Tailwind CSS class maps for rendering colored badges and dot indicators for sprint status.

**Exports:**
- `sprintStatusClasses` — `Record<SprintStatus, string>` mapping each sprint status to badge CSS classes
- `sprintStatusDotColors` — `Record<SprintStatus, string>` mapping each sprint status to dot indicator CSS classes


---

## services/api/

### `services/api/projects.ts`
**Purpose:** Fetches a paginated, filtered list of projects from the API.

**Exports:**
- `retrieveProjects(params): Promise<{ data: ProjectType[]; pagination: PaginationType } | null>` — calls `GET /projects` with query params (page, limit, name, status, businessUnit, paid, sortBy); returns cast frontend projects and pagination metadata; handles 401 via token refresh

### `services/api/project.ts`
**Purpose:** Fetches a single project by ID from the API.

**Exports:**
- `retrieveProjectById(id): Promise<ProjectType | null>` — calls `GET /projects/:id`; returns the cast frontend project or null on error; handles 401 via token refresh

### `services/api/project-creators.ts`
**Purpose:** Fetches a list of users eligible to be project managers (CEO, CTO, CMO roles).

**Exports:**
- `ProjectCreator` — interface `{ id: string; name: string }`
- `retrieveProjectCreators(): Promise<ProjectCreator[]>` — calls `GET /users?roles=CEO,CTO,CMO&limit=100&page=1`; returns a simplified list of user id/name pairs

### `services/api/project-lifecycle.ts`
**Purpose:** Handles project archive, restore, and permanent deletion via dedicated API endpoints.

**Exports:**
- `archiveProject(projectId): Promise<ProjectInResponseType>` — calls `POST /projects/:id/archive`
- `restoreProject(projectId): Promise<ProjectInResponseType>` — calls `POST /projects/:id/restore`
- `deleteProject(projectId): Promise<void>` — calls `DELETE /projects/:id`

### `services/api/project-members.ts`
**Purpose:** Handles all project member and invitation mutations — add, update role, remove, create invitation, delete invitation, resend invitation.

**Exports:**
- `addProjectMember(projectId, data): Promise<CreatedProjectMemberDto | CreatedInvitationDto>` — calls `POST /projects/:id/members`
- `updateProjectMemberRole(projectId, memberId, data): Promise<UpdatedProjectMemberDto>` — calls `PATCH /projects/:id/members/:memberId`
- `removeProjectMember(projectId, memberId): Promise<void>` — calls `DELETE /projects/:id/members/:memberId`
- `createProjectInvitation(projectId, data): Promise<CreatedInvitationDto>` — calls `POST /projects/:id/invitations`
- `deleteProjectInvitation(projectId, invitationId): Promise<void>` — calls `DELETE /projects/:id/invitations/:invitationId`
- `resendProjectInvitation(projectId, invitationId): Promise<CreatedInvitationDto>` — calls `POST /projects/:id/invitations/:invitationId/resend`

### `services/api/project-upload.ts`
**Purpose:** Creates or updates a project via the API.

**Exports:**
- `uploadProject(data, id?): Promise<void>` — calls `POST /projects/register` for create or `PATCH /projects/:id` for update

### `services/api/project-tasks.ts`
**Purpose:** Fetches the list of tasks for a given project, with optional server-side filters.

**Exports:**
- `retrieveProjectTasks(params): Promise<ProjectTaskType[]>` — calls `GET /projects/:projectId/tasks` with optional query params (search, status, priority, type, assigneeId, milestoneId, epicId); returns cast frontend tasks

### `services/api/project-task-upload.ts`
**Purpose:** Creates or updates a project task, supporting both JSON and multipart/form-data (for file attachments).

**Exports:**
- `ProjectTaskPayload` — interface describing the task mutation payload fields
- `uploadProjectTask(params): Promise<any>` — calls `POST /projects/:projectId/tasks` or `PATCH /projects/:projectId/tasks/:id`; uses multipart when attachments are present

### `services/api/project-task-deletion.ts`
**Purpose:** Permanently deletes a project task.

**Exports:**
- `deleteProjectTask(projectId, taskId): Promise<void>` — calls `DELETE /projects/:projectId/tasks/:taskId`

### `services/api/project-task-comment.ts`
**Purpose:** Adds or deletes a comment on a project task.

**Exports:**
- `addProjectTaskComment(projectId, taskId, comment): Promise<void>` — calls `POST /projects/:projectId/tasks/:taskId/comments`
- `deleteProjectTaskComment(projectId, taskId, commentId): Promise<void>` — calls `DELETE /projects/:projectId/tasks/:taskId/comments/:commentId`

### `services/api/project-sprints.ts`
**Purpose:** Fetches the list of sprints for a given project with optional status filter.

**Exports:**
- `retrieveProjectSprints(params): Promise<SprintType[]>` — calls `GET /projects/:projectId/sprints`; returns cast frontend sprints

### `services/api/sprint-upload.ts`
**Purpose:** Creates or updates a sprint for a project.

**Exports:**
- `uploadSprint(projectId, data, id?): Promise<void>` — calls `POST /projects/:projectId/sprints` for create or `PATCH /projects/:projectId/sprints/:id` for update

### `services/api/sprint-deletion.ts`
**Purpose:** Permanently deletes a sprint from a project.

**Exports:**
- `deleteSprint(projectId, sprintId): Promise<void>` — calls `DELETE /projects/:projectId/sprints/:sprintId`


---

## services/mock/

### `services/mock/projects.mock.ts`
**Purpose:** In-memory mock implementation of `retrieveProjects` that reads from `mock_data/mock.json` and applies client-side filtering and pagination.

**Exports:**
- `mockRetrieveProjects(params): Promise<{ data: ProjectType[]; pagination: PaginationType }>` — filters mock projects by status, businessUnit, projectType, paid, and name; returns a paginated slice

### `services/mock/project.mock.ts`
**Purpose:** In-memory mock implementation of `retrieveProjectById` that looks up a project by ID from `mock_data/mock.json`.

**Exports:**
- `mockRetrieveProjectById(id): Promise<ProjectType | null>` — finds and casts a project from mock data, or returns null if not found

### `services/mock/project-tasks.mock.ts`
**Purpose:** In-memory mock implementation of `retrieveProjectTasks` that reads tasks from the matching project in `mock_data/mock.json` and applies client-side filters.

**Exports:**
- `mockRetrieveProjectTasks(params): Promise<ProjectTaskType[]>` — filters mock tasks by status, priority, type, assigneeId, milestoneId, epicId, and search string

### `services/mock/project-sprints.mock.ts`
**Purpose:** In-memory mock implementation of `retrieveProjectSprints` that reads sprints from the matching project in `mock_data/mock.json`.

**Exports:**
- `mockRetrieveProjectSprints(params): Promise<SprintType[]>` — filters mock sprints by status

### `services/mock/mutations.mock.ts`
**Purpose:** No-op mock implementations for all mutation operations. All functions resolve immediately without modifying data; React Query cache invalidation still fires so the UI refreshes from mock data.

**Exports:**
- `mockUploadProject(): Promise<void>` — no-op
- `mockUploadProjectTask(): Promise<{ success: boolean }>` — returns `{ success: true }`
- `mockDeleteProjectTask(): Promise<void>` — no-op
- `mockAddProjectTaskComment(): Promise<void>` — no-op
- `mockDeleteProjectTaskComment(): Promise<void>` — no-op
- `mockUploadSprint(): Promise<void>` — no-op
- `mockDeleteSprint(): Promise<void>` — no-op

---

## services/index.ts
**Purpose:** Central service barrel that reads the `USE_MOCK` flag at runtime and re-exports either the real API implementations or the mock implementations under unified names. All consumers import from this file rather than directly from `api/` or `mock/`.

**Exports:**
- `retrieveProjects` — API or mock
- `retrieveProjectById` — API or mock
- `retrieveProjectTasks` — API or mock
- `retrieveProjectCreators` — API or no-op in mock mode
- `retrieveProjectSprints` — API or mock
- `uploadProject` — API or mock
- `uploadProjectTask` — API or mock
- `deleteProjectTask` — API or mock
- `addProjectTaskComment` — API or mock
- `deleteProjectTaskComment` — API or mock
- `archiveProject` — API or no-op in mock mode
- `restoreProject` — API or no-op in mock mode
- `deleteProject` — API or no-op in mock mode
- `addProjectMember` — API or no-op in mock mode
- `updateProjectMemberRole` — API or no-op in mock mode
- `removeProjectMember` — API or no-op in mock mode
- `createProjectInvitation` — API or no-op in mock mode
- `deleteProjectInvitation` — API or no-op in mock mode
- `resendProjectInvitation` — API or no-op in mock mode
- `uploadSprint` — API or mock
- `deleteSprint` — API or mock
- `ProjectTaskPayload` — re-exported type from `api/project-task-upload`
- `ProjectCreator` — re-exported type from `api/project-creators`


---

## hooks/projects/

### `hooks/projects/use-projects.ts`
**Purpose:** Main data hook for the projects list page. Manages server-side and client-side filtering, multi-page accumulation, debounced search, and pagination. Fetches additional backend pages on demand.

**State managed:** `pool` (accumulated projects), `backendPage`, `backendTotalPages`, `allPagesFetched`, `displayPage`, `search`, `businessUnit`, `paid`, `sortBy`, `projectType`, `isArchived`, `createdById`, `sessionKey`

**Returns:**
- `projects` — current page of filtered projects
- `projectsAreLoading` — true when initial load is in progress
- `projectsPageLoading` — true when a page is loading but some results already exist
- `projectsError` — boolean error flag
- `page` / `setPage` — current display page and setter
- `pagesNumber` — total number of display pages
- `records` — total filtered record count (undefined while still fetching all pages)
- `currentUserId` — ID of the logged-in user
- `creators` — list of project creators for the filter dropdown
- `refresh` — function to force a data re-fetch
- `searchState`, `projectTypeState`, `businessUnitState`, `isArchivedState`, `paidState`, `sortByState`, `createdByState` — `[value, setter]` tuples for each filter

### `hooks/projects/use-project.ts`
**Purpose:** Fetches a single project by ID using React Query.

**State managed:** React Query cache for `["project", id]`

**Returns:**
- `project` — the fetched `ProjectType` or null
- `projectIsLoading` — boolean loading flag
- `projectError` — boolean error flag

### `hooks/projects/use-project-upload.ts`
**Purpose:** Manages the project create/update form — builds default values from an existing project, handles form submission (including archive/restore via dedicated endpoints), invalidates the projects query on success.

**State managed:** `isPending`, `error`, react-hook-form state

**Returns:**
- `form` — react-hook-form instance
- `isPending` — boolean submission flag
- `onSubmit` — form submit handler
- `error` — error message string

### `hooks/projects/use-project-actions.ts`
**Purpose:** Provides imperative action handlers for project status change, archive/restore, and deletion, with toast notifications and cache invalidation.

**State managed:** `archivingId` — ID of the project currently being archived

**Returns:**
- `archivingId` — string or null
- `handleStatusChange(project, status)` — updates project status
- `handleArchiveProject(project)` — toggles archive/restore
- `handleDeleteProject(project)` — deletes the project and invalidates cache

---

## hooks/tasks/

### `hooks/tasks/use-project-tasks.ts`
**Purpose:** Fetches and filters project tasks for a given project. Manages all filter states and exposes a `setDisplayedTasks` for local reordering (e.g. drag-and-drop).

**State managed:** `search`, `status`, `priority`, `type`, `assigneeId`, `milestoneId`, `epicId`, `displayedTasks`

**Returns:**
- `tasks` — current list of `ProjectTaskType`
- `tasksAreLoading` — boolean loading flag
- `tasksError` — boolean error flag
- `searchState`, `statusState`, `priorityState`, `typeState`, `assigneeState`, `milestoneState`, `epicState` — `[value, setter]` tuples
- `setDisplayedTasks` — direct setter for local task reordering

### `hooks/tasks/use-project-task-upload.ts`
**Purpose:** Manages the project task create/update form — builds default values from an existing task, handles submission with attachment support, invalidates the tasks query on success.

**State managed:** `isPending`, `error`, react-hook-form state

**Returns:**
- `form` — react-hook-form instance
- `error` — error message string
- `isPending` — boolean submission flag
- `onSubmit` — form submit handler

### `hooks/tasks/use-project-task-comment.ts`
**Purpose:** Manages the comment form for a specific task — handles adding and deleting comments with toast notifications and cache invalidation.

**State managed:** `isPending`, react-hook-form state for the comment field

**Returns:**
- `form` — react-hook-form instance
- `onSubmit` — comment form submit handler
- `isPending` — boolean submission flag
- `deleteComment(commentId)` — deletes a comment by ID

---

## hooks/members/

### `hooks/members/use-project-members.ts`
**Purpose:** Provides imperative handlers for adding, updating the role of, and removing project members, with toast notifications and project cache invalidation.

**State managed:** `isPending`

**Returns:**
- `addMember(data)` — adds a member or sends an invitation
- `updateRole(memberId, data)` — updates a member's manager role
- `removeMember(memberId)` — removes a member from the project
- `isPending` — boolean flag

### `hooks/members/use-project-invitations.ts`
**Purpose:** Provides imperative handlers for creating, revoking, and resending project invitations, with toast notifications and project cache invalidation.

**State managed:** `isPending`

**Returns:**
- `createInvitation(data)` — sends a new email invitation
- `revokeInvitation(invitationId)` — deletes a pending invitation
- `resendInvitation(invitationId)` — resends an existing invitation
- `isPending` — boolean flag

---

## hooks/sprints/

### `hooks/sprints/use-project-sprints.ts`
**Purpose:** Fetches sprints for a project with server-side status filtering and client-side search and sort.

**State managed:** `status`, `search`, `sortBy`

**Returns:**
- `sprints` — sorted and filtered list of `SprintType`
- `sprintsAreLoading` — boolean loading flag
- `sprintsError` — boolean error flag
- `statusState`, `searchState`, `sortByState` — `[value, setter]` tuples

### `hooks/sprints/use-sprint-upload.ts`
**Purpose:** Manages the sprint create/update form — builds default values from an existing sprint, handles submission, invalidates the sprints query on success.

**State managed:** `isPending`, `error`, react-hook-form state

**Returns:**
- `form` — react-hook-form instance
- `isPending` — boolean submission flag
- `onSubmit` — form submit handler
- `error` — error message string


---

## components/shared/

### `components/shared/confirm-dialog.tsx`
**Purpose:** Generic reusable confirmation dialog (destructive action pattern) built on shadcn's `AlertDialog`.

**Exports:**
- `ConfirmDialog` — renders a modal with a title, description, confirm, and cancel buttons; confirm button is styled destructive

**UI imports:**
- `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` from `@/components/ui/alert-dialog`

### `components/shared/dot-badge-option.tsx`
**Purpose:** Provides two reusable option components that render a colored dot alongside a label — one for `Select` items and one for `Toggle` buttons.

**Exports:**
- `DotBadgeSelectItem` — renders a `SelectItem` with a colored dot and label
- `DotBadgeToggle` — renders a `Toggle` with a colored dot and label; controlled via `pressed`/`onPressedChange`

**UI imports:**
- `SelectItem` from `@/components/ui/select`
- `Toggle` from `@/components/ui/toggle`

### `components/shared/empty-state.tsx`
**Purpose:** Simple centered empty-state display with a heading and optional description text.

**Exports:**
- `EmptyState` — renders a full-height centered block with a message and optional description

### `components/shared/filter-panel.tsx`
**Purpose:** Wrapper container for filter controls; optionally renders a "Clear Filters" button when active filters are present.

**Exports:**
- `FilterPanel` — wraps children in a padded container; shows a clear button when `hasActiveFilters` is true

**UI imports:**
- `Button` from `@/components/ui/button`

### `components/shared/filter-section.tsx`
**Purpose:** Labeled section wrapper for grouping related filter controls inside a `FilterPanel`.

**Exports:**
- `FilterSection` — renders a label heading above its children

### `components/shared/list-card.tsx`
**Purpose:** Generic horizontal list item layout with slots for avatar, primary text, secondary text, a badge, and action buttons.

**Exports:**
- `ListCard` — renders a bordered row with avatar, primary/secondary text, badge, and actions

### `components/shared/section-header.tsx`
**Purpose:** Page/section header with a title, optional description, and optional action buttons aligned to the right.

**Exports:**
- `SectionHeader` — renders a two-column header with title+description on the left and actions on the right

### `components/shared/toolbar.tsx`
**Purpose:** Reusable toolbar combining status tabs, a search input, a filter dropdown, a list/grid view toggle, and custom action slots.

**Exports:**
- `Toolbar` — renders a responsive toolbar row; filter content is shown in a `DropdownMenu`; view mode toggle uses `ToggleGroup`

**UI imports:**
- `Input` from `@/components/ui/input`
- `Button` from `@/components/ui/button`
- `Badge` from `@/components/ui/badge`
- `ToggleGroup`, `ToggleGroupItem` from `@/components/ui/toggle-group`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuTrigger` from `@/components/ui/dropdown-menu`

---

## components/ (root level)

### `components/project-status-tabs.tsx`
**Purpose:** Renders the status filter tabs (All, Pending, Running, Stopped, Completed) for the projects list page.

**Exports:**
- `ProjectStatusTabs` — controlled tab component; calls `onTabChange` with the selected `ProjectFilterTab` value

**UI imports:**
- `Tabs`, `TabsList`, `TabsTrigger` from `@/components/ui/tabs`

### `components/project-upload-sheet.tsx`
**Purpose:** Side sheet form for creating or updating a project. Renders all project fields and delegates submission to `useProjectUpload`.

**Exports:**
- `ProjectUploadSheet` — sheet with a full project form; shows manager field only on create; shows archive toggle only on edit

**UI imports:**
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` from `@/components/ui/form`
- `Textarea` from `@/components/ui/textarea`
- `Switch` from `@/components/ui/switch`
- `TextEditor` from `@/components/ui/text-editor`
- `TimeInput` from `@/components/time-input`
- `ErrorBanner` from `@/components/error-banner`

### `components/project.tsx`
**Purpose:** Renders a single project card in either grid or list view mode. Supports drag-and-drop via `@dnd-kit/sortable`, selection mode, and inline action buttons (edit, archive, delete, status change).

**Exports:**
- `ProjectContainer` (default) — draggable project card; navigates to the project detail page on click (unless in selection mode or dragging)

**UI imports:**
- `Card`, `CardContent`, `CardFooter` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Checkbox` from `@/components/ui/checkbox`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`
- `Button` from `@/components/ui/button`

### `components/projects-bulk-bar.tsx`
**Purpose:** Bulk action bar shown when one or more projects are selected. Provides select-all, a status/archive/delete action dropdown, and a clear selection button.

**Exports:**
- `ProjectsBulkBar` — renders a sticky bar with a checkbox, selection count, action select, and clear button

**UI imports:**
- `Checkbox` from `@/components/ui/checkbox`
- `Button` from `@/components/ui/button`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`

### `components/projects-dnd-grid.tsx`
**Purpose:** Wraps the projects grid in a `@dnd-kit` drag-and-drop context with `rectSortingStrategy`, rendering each project as a sortable `ProjectContainer` in grid layout.

**Exports:**
- `ProjectsDndGrid` — DnD-enabled grid of project cards with a `DragOverlay`

**UI imports:**
- `ProjectContainer` from `./project`

### `components/projects-dnd-list.tsx`
**Purpose:** Wraps the projects list in a `@dnd-kit` drag-and-drop context restricted to the vertical axis, rendering each project as a sortable `ProjectContainer` in list layout.

**Exports:**
- `ProjectsDndList` — DnD-enabled vertical list of project cards with a `DragOverlay`

**UI imports:**
- `ProjectContainer` from `./project`

### `components/projects-filter-panel.tsx`
**Purpose:** Filter panel content for the projects toolbar — provides dropdowns for sort order, project type, business unit, archived status, paid status, and creator.

**Exports:**
- `ProjectsFilterPanel` — renders filter sections inside a `FilterPanel`; uses `FilterSection` for each group

**UI imports:**
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `FilterPanel` from `./shared/filter-panel`
- `FilterSection` from `./shared/filter-section`

### `components/projects-list.tsx`
**Purpose:** Top-level projects list page component. Orchestrates the toolbar, bulk bar, DnD grid/list, pagination, upload sheet, and delete confirmation dialog. Connects `useProjects` and `useProjectActions` to the UI.

**Exports:**
- `ProjectsList` (default) — full projects list page; renders `Toolbar`, `ProjectsBulkBar`, `ProjectsDndGrid`/`ProjectsDndList`, pagination controls, `ProjectUploadSheet`, and `ConfirmDialog`

**UI imports:**
- `Button` from `@/components/ui/button`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`
- `Toolbar` from `./shared/toolbar`
- `ConfirmDialog` from `./shared/confirm-dialog`
- `EmptyState` from `./shared/empty-state`
- `ProjectsFilterPanel` from `./projects-filter-panel`
- `ProjectsBulkBar` from `./projects-bulk-bar`
- `ProjectsDndGrid` from `./projects-dnd-grid`
- `ProjectsDndList` from `./projects-dnd-list`
- `ProjectStatusTabs` from `./project-status-tabs`
- `ProjectUploadSheet` from `./project-upload-sheet`
- `Loading` from `@/components/page-loader`
- `Error500` from `@/components/error/500`


---

## components/project-detail/members/

### `components/project-detail/members/project-members.tsx`
**Purpose:** Top-level members tab for a project detail page. Renders the members list card, invitations list card, add member dialog, invite by email dialog, and confirmation dialogs for remove/revoke actions.

**Exports:**
- `ProjectMembers` (default) — orchestrates all member management UI for a project

**UI imports:**
- `Button` from `@/components/ui/button`
- `SectionHeader` from `../../shared/section-header`
- `ConfirmDialog` from `../../shared/confirm-dialog`
- `MembersListCard` from `./members-list-card`
- `InvitationsListCard` from `./invitations-list-card`
- `AddMemberDialog` from `./add-member-dialog`
- `InviteByEmailDialog` from `./invite-by-email-dialog`

### `components/project-detail/members/add-member-dialog.tsx`
**Purpose:** Dialog for adding a project member either by selecting an existing user (via `UserSearchCombobox`) or by entering an email address. Supports toggling manager role and setting invitation expiry.

**Exports:**
- `AddMemberDialog` — controlled dialog with a mode toggle (userId / email), user search or email input, manager switch, and optional expiry field

**UI imports:**
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Switch` from `@/components/ui/switch`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `@/components/ui/dialog`
- `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` from `@/components/ui/form`
- `UserSearchCombobox` from `./user-search-combobox`

### `components/project-detail/members/invite-by-email-dialog.tsx`
**Purpose:** Dialog for sending a project invitation by email address, with manager role toggle and expiry days input.

**Exports:**
- `InviteByEmailDialog` — controlled dialog with email input, manager switch, and expiry days field

**UI imports:**
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Switch` from `@/components/ui/switch`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `@/components/ui/dialog`
- `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` from `@/components/ui/form`

### `components/project-detail/members/invitations-list-card.tsx`
**Purpose:** Card displaying all pending project invitations with resend and revoke actions per invitation.

**Exports:**
- `InvitationsListCard` — renders a `Card` with a list of `ListCard` rows for each invitation; each row has a dropdown with resend and revoke options

**UI imports:**
- `Avatar`, `AvatarFallback` from `@/components/ui/avatar`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger` from `@/components/ui/dropdown-menu`
- `ListCard` from `../../shared/list-card`

### `components/project-detail/members/members-list-card.tsx`
**Purpose:** Card displaying all active project members with promote/demote and remove actions per member.

**Exports:**
- `MembersListCard` — renders a `Card` with a list of `ListCard` rows for each member; each row has a dropdown with role toggle and remove options

**UI imports:**
- `Avatar`, `AvatarFallback` from `@/components/ui/avatar`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger` from `@/components/ui/dropdown-menu`
- `ListCard` from `../../shared/list-card`

### `components/project-detail/members/user-search-combobox.tsx`
**Purpose:** Custom typeahead input that searches users by name via the users API and lets the caller select a user by ID. Closes the dropdown on outside click.

**Exports:**
- `UserSearchInput` (default) — controlled input with a live-search dropdown; calls `onChange(userId, name)` on selection

**UI imports:**
- `Input` from `@/components/ui/input`


---

## components/project-detail/project-task/

### `components/project-detail/project-task/project-tasks.tsx`
**Purpose:** Thin wrapper component for the project tasks tab; delegates rendering to `ProjectTasksList`.

**Exports:**
- `ProjectTasks` (default) — renders `ProjectTasksList` with the current project

**UI imports:**
- `ProjectTasksList` from `./project-tasks-list`

### `components/project-detail/project-task/project-tasks-toolbar.tsx`
**Purpose:** Toolbar for the project tasks view — provides status tabs, search input, a filter dropdown (type, priority, assignee, milestone, epic), a display settings dropdown (visible attributes), and a list/kanban view toggle.

**Exports:**
- `ProjectTasksToolbar` (default) — full tasks toolbar; reads/writes `visibleAttributes` from `useProjectTasksStore`

**UI imports:**
- `Input` from `@/components/ui/input`
- `Button` from `@/components/ui/button`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuCheckboxItem`, `DropdownMenuTrigger` from `@/components/ui/dropdown-menu`
- `ToggleGroup`, `ToggleGroupItem` from `@/components/ui/toggle-group`
- `Toggle` from `@/components/ui/toggle`
- `Tabs`, `TabsList`, `TabsTrigger` from `@/components/ui/tabs`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `FilterPanel` from `../../shared/filter-panel`
- `FilterSection` from `../../shared/filter-section`
- `DotBadgeToggle` from `../../shared/dot-badge-option`

### `components/project-detail/project-task/project-tasks-list.tsx`
**Purpose:** Main tasks view component. Renders the toolbar, then either a kanban board or a DnD-sortable list depending on `viewMode`. Manages task selection, upload sheet, detail sheet, and duplicate logic.

**Exports:**
- `ProjectTasksList` (default) — full tasks view with toolbar, list/kanban toggle, DnD list, upload sheet, and detail sheet

**UI imports:**
- `Button` from `@/components/ui/button`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`
- `Loading` from `@/components/page-loader`
- `Error500` from `@/components/error/500`
- `ProjectTaskItem` from `./project-task-item`
- `ProjectTaskUploadSheet` from `./project-task-upload`
- `ProjectTaskDetailSheet` from `./project-task-details-sheet`
- `ProjectTasksToolbar` from `./project-tasks-toolbar`
- `ProjectTasksKanbanBoard` from `./project-tasks-kanban-board`
- `EmptyState` from `../../shared/empty-state`

### `components/project-detail/project-task/project-tasks-kanban-board.tsx`
**Purpose:** Kanban board for project tasks. Renders draggable columns (using `@/components/ui/kanban`), each containing draggable task cards. Supports adding and deleting custom columns.

**Exports:**
- `ProjectTasksKanbanBoard` (default) — full kanban board with column management and drag-and-drop

**UI imports:**
- `Button` from `@/components/ui/button`
- `Badge` from `@/components/ui/badge`
- `Card`, `CardContent` from `@/components/ui/card`
- `Input` from `@/components/ui/input`
- `Tooltip`, `TooltipContent`, `TooltipTrigger` from `@/components/ui/tooltip`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from `@/components/ui/dialog`
- `Kanban` (namespace) from `@/components/ui/kanban`
- `ConfirmDialog` from `../../shared/confirm-dialog`
- `ProjectTasksKanbanCard` from `./project-tasks-kanban-card`

### `components/project-detail/project-task/project-tasks-kanban-card.tsx`
**Purpose:** Individual task card for the kanban board. Displays task key, title, type/priority/points/milestone/epic badges, assignee avatar, and a duplicate button. Integrates with `@/components/ui/kanban` for drag handle.

**Exports:**
- `ProjectTasksKanbanCard` (default) — kanban card for a single task

**UI imports:**
- `Card`, `CardContent`, `CardFooter` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Checkbox` from `@/components/ui/checkbox`
- `Button` from `@/components/ui/button`
- `Tooltip`, `TooltipContent`, `TooltipTrigger` from `@/components/ui/tooltip`
- `Kanban` (namespace) from `@/components/ui/kanban`

### `components/project-detail/project-task/project-task-item.tsx`
**Purpose:** Sortable task row/card for the list view. Renders task attributes (key, title, type, status, priority, points, milestone, epic, assignee) respecting `visibleAttributes` from the store. Supports grid and list view modes.

**Exports:**
- `ProjectTaskItem` (default) — draggable task item for list or grid view

**UI imports:**
- `Card`, `CardContent`, `CardFooter` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Checkbox` from `@/components/ui/checkbox`
- `Button` from `@/components/ui/button`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`

### `components/project-detail/project-task/project-task-upload.tsx`
**Purpose:** Side sheet form for creating or updating a project task. Renders title, description (rich text), type, priority, status, story points (AGILE only), due date, and attachment upload fields.

**Exports:**
- `ProjectTaskUploadSheet` (default) — sheet with the full task form; delegates to `useProjectTaskUpload`

**UI imports:**
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `TextEditor` from `@/components/ui/text-editor`
- `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` from `@/components/ui/form`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `ErrorBanner` from `@/components/error-banner`
- `DotBadgeSelectItem` from `../../shared/dot-badge-option`
- `AttachementUpload` from `./attachments`

### `components/project-detail/project-task/project-task-details-sheet.tsx`
**Purpose:** Read-only detail sheet for a project task. Displays description (sanitized HTML), metadata fields, and renders subtasks, attachments, and comments sections. Provides edit and delete actions.

**Exports:**
- `ProjectTaskDetailSheet` — sheet showing full task details with edit/delete buttons and sub-sections
- (also default export)

**UI imports:**
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`
- `Separator` from `@/components/ui/separator`
- `CustomDialog` from `@/components/custom-dialog`
- `DeletionConfirmationDialog` from `@/modules/users/components/deletion/deletion-confirmation-dialog`
- `TaskSubtasksSection` from `./task-subtasks-section`
- `TaskAttachmentsSection` from `./task-attachments-section`
- `TaskCommentsSection` from `./task-comments-section`

### `components/project-detail/project-task/attachments.tsx`
**Purpose:** File upload control for task attachments. Manages new file selection (via `useFileUpload`), displays previews of already-saved attachments, handles deletion tracking via a hidden `deletedAttachments` form field, and supports in-dialog file preview.

**Exports:**
- `AttachmentsUpload` (default) — form-connected attachment upload widget; integrates with react-hook-form via `useFormContext`

**UI imports:**
- `Button` from `@/components/ui/button`
- `FormControl`, `FormField`, `FormItem`, `FormMessage` from `@/components/ui/form`
- `AttachementPreview` from `./attachement-preview`
- `CustomDialog` from `@/components/custom-dialog`

### `components/project-detail/project-task/attachement-preview.tsx`
**Purpose:** Displays a single already-saved attachment with view, download, and optional delete actions. Detects image vs. PDF vs. generic file for appropriate icon/thumbnail rendering.

**Exports:**
- `AttachementPreview` (default) — attachment row with eye, download, and trash buttons

**UI imports:**
- `Button` from `@/components/ui/button`

### `components/project-detail/project-task/task-attachments-section.tsx`
**Purpose:** Read-only section in the task detail sheet that lists all task attachments using `AttachementPreview`.

**Exports:**
- `TaskAttachmentsSection` — renders a labeled list of attachment previews or an empty state

**UI imports:**
- `AttachementPreview` from `./attachement-preview`

### `components/project-detail/project-task/task-comments-section.tsx`
**Purpose:** Section in the task detail sheet that lists existing comments (with delete) and provides a textarea form for adding new comments.

**Exports:**
- `TaskCommentsSection` — renders comment list and add-comment form; delegates to `useProjectTaskComment`

**UI imports:**
- `Button` from `@/components/ui/button`
- `Textarea` from `@/components/ui/textarea`
- `Form`, `FormControl`, `FormField`, `FormItem`, `FormMessage` from `@/components/ui/form`

### `components/project-detail/project-task/task-subtasks-section.tsx`
**Purpose:** Section in the task detail sheet that lists existing subtasks (with delete) and provides an inline input for creating new subtasks linked to the parent task.

**Exports:**
- `TaskSubtasksSection` — renders subtask list and inline create form; uses `useProjectTaskUpload` with `parentTaskId` pre-set

**UI imports:**
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Form`, `FormControl`, `FormField`, `FormItem`, `FormMessage` from `@/components/ui/form`


---

## components/project-detail/settings/

### `components/project-detail/settings/project-settings.tsx`
**Purpose:** Read-only settings tab for a project detail page. Displays general information (name, description, business unit, type), status/payment flags, and the project timeline in a two-column card layout.

**Exports:**
- `ProjectSettings` (default) — renders project metadata in organized cards

**UI imports:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Label` from `@/components/ui/label`
- `SectionHeader` from `../../shared/section-header`

---

## components/project-detail/sprints/

### `components/project-detail/sprints/project-sprints.tsx`
**Purpose:** Top-level sprints tab for a project detail page. Renders a toolbar with status tabs, search, sort filter, and view mode toggle; then displays sprints as a grid or list of `SprintCard` components. Handles sprint deletion with a confirmation dialog.

**Exports:**
- `ProjectSprints` (default) — full sprints view with toolbar, grid/list layout, upload sheet, and delete confirmation

**UI imports:**
- `Button` from `@/components/ui/button`
- `Tabs`, `TabsList`, `TabsTrigger` from `@/components/ui/tabs`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `Loading` from `@/components/page-loader`
- `Error500` from `@/components/error/500`
- `SprintCard` from `./sprint-card`
- `SprintUploadSheet` from `./sprint-upload-sheet`
- `Toolbar` from `../../shared/toolbar`
- `FilterPanel` from `../../shared/filter-panel`
- `FilterSection` from `../../shared/filter-section`
- `EmptyState` from `../../shared/empty-state`
- `ConfirmDialog` from `../../shared/confirm-dialog`

### `components/project-detail/sprints/sprint-card.tsx`
**Purpose:** Renders a single sprint in either grid or list view. Displays name, description, start date, end date (in a tooltip), status badge, and edit/delete action buttons that appear on hover.

**Exports:**
- `SprintCard` (default) — sprint card with hover actions for edit and delete

**UI imports:**
- `Card`, `CardContent`, `CardFooter` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`

### `components/project-detail/sprints/sprint-upload-sheet.tsx`
**Purpose:** Side sheet form for creating or updating a sprint. Renders name, description (rich text), status, and four date/time inputs (start, end, estimated start, estimated end).

**Exports:**
- `SprintUploadSheet` (default) — sheet with the full sprint form; delegates to `useSprintUpload`

**UI imports:**
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` from `@/components/ui/form`
- `TextEditor` from `@/components/ui/text-editor`
- `TimeInput` from `@/components/time-input`
- `ErrorBanner` from `@/components/error-banner`
