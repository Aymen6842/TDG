# Execution Plan — Verified Backlog

Read-only audit pass. No code was changed. Line numbers reflect the **current** code, not the
snapshot the original `diagnostic-report.md` was written against.

---

## Part A — Verification of the diagnostic report

Each report finding re-checked against current files. Verdicts: **FIXED** (no longer reproducible),
**HOLDS** (still valid), **NARROWED** (valid but smaller/different than described), **IMPROVED**
(partially mitigated, residue remains).

### 1. Multer crash on task update — **FIXED**
`tasks.controller.ts:372–376` now passes `UploadStorage.TaskAttachments()` **directly** as the second
arg to `FileFieldsInterceptor`, identical to the create route (`:197–201`). The double-wrapped
`{ storage: UploadStorage.TaskAttachments(), limits }` described in the report is gone. A full-backend
sweep for `storage: UploadStorage.*` and `storage: {` finds **no remaining double-wraps**. Nothing to do
beyond not regressing it.

### 2. P8002 invalid status transition — **IMPROVED, residue HOLDS**
Backend `isValidStatusTransitionDynamic` (`tasks.service.ts:354–403`) has been hardened since the report:
case-insensitive matching, orphaned/legacy current status is allowed, and any custom (non-system)
source **or** target is allowed. System→system still enforces `allowedTransitions`, so intentionally
one-way seeded flows still reject reverse moves (by design). Residual real bugs:
- **Failure mode B still holds.** `project-tasks-list.tsx:150` mints local columns `CUSTOM_${Date.now()}`;
  dropping a task there sends that string as `status` (`project-tasks-kanban-board.tsx:135`). Backend can't
  resolve it → `targetStatusRecord` not found → `false` → P8002.
- **Failure mode A is now mitigated but by duplication.** `task-status-stepper.tsx:63–85` re-implements the
  backend rule (respects `allowedTransitions` for system→system). Correct behavior, but see item 5 (drift).

### 3a. Task labels nested shape — **NARROWED (list endpoint only)**
NestJS 11's `ClassSerializerInterceptor.transformToPlain` runs `plainToInstance(options.type, …)` when
`@SerializeOptions({ type })` is set (verified in installed `node_modules/@nestjs/common/serializer`),
so `{ toClassOnly: true }` transforms **do** fire outbound — but only on the type that gets instantiated:
- **Detail** (`GET …/tasks/:taskId`, `@SerializeOptions({ type: TaskResponseDto })`): `labels` transform
  lives on the top-level `TaskResponseDto` → it runs → labels flattened → **works.**
- **Kanban**: service manually flattens (`tasks.service.ts:2024`) → **works.**
- **List** (`GET …/tasks`, `@SerializeOptions({ type: TaskListDto })`): `TaskListDto.data` is typed
  `TaskSummaryDto[]` but has **no `@Type(() => TaskSummaryDto)`** (`task-list.dto.ts:29`), so `plainToInstance`
  does not instantiate the array items → the `labels` transform never runs → labels arrive nested as
  `{ label: { id, name, color } }`. Frontend cast (`cast-project-task.ts:65–74`) reads `l.id`/`l.name` →
  `undefined` → broken label chips + duplicate `key={undefined}` in list/board rows that render from list data.
  **Bug is real but list-only; the detail sheet is fine.**
- **Secondary HOLDS:** `assignLabel` (`use-label-upload.ts:88–93`) invalidates only `["project-tasks", projectId]`,
  not `["project-task", projectId, taskId]`, so the open detail sheet can show stale labels.

### 3b. Kanban milestone badge — **FIXED**
`findKanban` now selects `milestoneId: true` (`fetch-task.repository.ts:646`) and the service flattens labels
for the kanban path. The card (`project-tasks-kanban-card.tsx:35`) can resolve the milestone name. No action.

### 4. Mutation / validation 400s — **MOSTLY FIXED, one residue + hardening**
- **4A numeric/boolean coercion — FIXED.** `UpdateTaskDto` now has `@Transform(toOptionalNumber)+@Type(()=>Number)`
  on `storyPoints/estimatedHours/progressPercent/displayOrder` and `@Transform(toOptionalBoolean)` on
  `isFavorite/archived` (`update-task.dto.ts:20–190`). FormData string values no longer fail these validators.
- **4B empty-string UUID — HOLDS (latent).** UUID fields (`assigneeId/epicId/sprintId/milestoneId/parentTaskId`)
  keep `@IsUUID()` with no empty-string→undefined transform. The multipart path appends any present value via
  `String(value)` (`project-task-upload.ts:35`); an empty-string UUID would reach `@IsUUID()` → 400. Depends on
  whether the payload builder ever emits `""` for these; worth a guard.
- **ValidationPipe** has `transform:true` but no `whitelist`/`forbidNonWhitelisted` (`main.ts:12–25`) — hardening, see 6.

### 5a. Gantt data gap — **HOLDS**
Backend returns `{ milestones, epics, sprints, tasks }` but frontend `GanttType` declares only `milestones`
(`project-milestones.ts:45–47`); epics/sprints/tasks are discarded at the type/cast layer and the UI is a
milestone list, not a timeline. Milestones also expose only `dueDate` (no `startDate`), so duration bars need
derived ranges.

### 5b. Analytics empty charts — **HOLDS**
Burndown `chartData` is only built when `sprint.startDate && sprint.endDate` (`sprints.service.ts:704`); velocity
counts only completed sprints. New/date-less sprints → empty series → flat charts with nothing to hover. This is a
data-precondition + empty-state-UX issue, not a broken Tooltip.

### 6. Reminder `entityId` UX — **HOLDS**
`reminder-upload-sheet.tsx:107–113` is a free-text "Entity ID" input, not tied to `entityType`, with no picker;
edit mode hides entity fields. Backend accepts `entityId` as an unvalidated optional string
(`create-reminder.dto.ts`). Presentation/discoverability problem, not a missing API field.

---

## Part B — Sibling sweep (same bug classes elsewhere)

**Multer double-wrap siblings:** none. All `FileFieldsInterceptor`/`FileInterceptor` call sites (sprints,
personal-tasks, users, auth, notifications) pass a storage-config object directly.

**`toClassOnly` served outbound siblings — one real hit:** the failure requires a *paginated wrapper DTO* whose
nested item array lacks `@Type`. Of 14 list-wrapper DTOs, **12 have `@Type` and are safe**; the only two missing it are:
- `tasks/…/task-list.dto.ts` → `data!: TaskSummaryDto[]` (the labels bug above).
- **`projects/…/project-list.dto.ts` → `data!: ProjectSummaryDto[]` (NEW).** `ProjectSummaryDto.name` and
  `.description` are derived via `toClassOnly` from `contents[0]` (`project-summary.dto.ts:114–128`). Without
  `@Type`, the **project list endpoint returns projects with empty/missing `name` and `description`** (raw
  `contents` array instead). Currently masked because mock mode is the default. This will surface as blank project
  cards the moment the app talks to the real list API.

**Prisma select vs. frontend-expected fields:** the `findKanban`/`milestoneId` gap is fixed and the kanban card's
fields (`assignee, labels, milestoneId, storyPoints, isFavorite, subtask count`) are all present. A full
field-by-field FE-type ↔ BE-select diff was **not** exhaustively performed; recommended as a hardening task (6.3).

---

## Part C — Mock-data inventory (nothing removed; toggles noted)

Default state is **mock ON** for both data and auth. Two independent toggle mechanisms exist, which behave
inconsistently (see note at the end).

| # | Source | Toggle mechanism |
|---|--------|------------------|
| 1 | `lib/mock-toggle.tsx` | Zustand store persisted as `dev-mock-store`; defaults `isMock:true`, `isMockAuth:true`; renders a draggable floating `<MockToggle/>` panel |
| 2 | `lib/mock-config.ts` | Re-exports `USE_MOCK`/`getUseMock`/`MOCK_USER` from the store |
| 3 | `app/[locale]/layout.tsx:13` | Mounts `<MockToggle/>` (marked "REMOVE THIS LINE FOR PROD") |
| 4 | `modules/projects/services/index.ts` | `const isMock = USE_MOCK()` evaluated **once at import** — swaps projects/tasks/sprints extraction + all project/member/sprint mutations to mock impls |
| 5 | `modules/projects/services/mock/*.mock.ts` | Fixtures/impls: `projects.mock`, `project.mock`, `project-tasks.mock`, `project-sprints.mock`, `mutations.mock` |
| 6 | `modules/projects/services/extraction/assigned-project-tasks.ts:41` | Inline `if (USE_MOCK()) return mockRetrieveAssignedProjectTasks(...)` |
| 7 | `modules/tasks/services/extraction/task.ts:16`, `tasks.ts:21` | Inline `if (USE_MOCK())` → `mockTasks` fixture |
| 8 | `modules/auth/services/users/user-details-extraction.ts:11` | `if (getUseMockAuth()) return MOCK_USER` |
| 9 | `modules/notifications/services/notifications-extractions.ts:17` + `hook/use-notifications-token-setup.ts:19` | `if (USE_MOCK())` early returns |
| 10 | `modules/tracking/services/current-work-day-extraction.ts:7` | `if (USE_MOCK()) return null` |
| 11 | `src/mock_data/mock.json`, `modules/projects/mock_data/mock.json` | Raw fixture data |

**Not mocked (already API-only):** epics, reminders, milestones, labels, analytics, backlog, kanban.

**Toggle inconsistency to be aware of before removal:** #4 freezes its mock/real choice at module import, while
#6–#10 read the store live. Flipping the panel's "Data" switch invalidates queries but does **not** re-bind the
frozen #4 services until a full reload — so the app can be half-mock/half-real mid-session.

---

## Part D — Phased backlog

Ordered lowest-risk / highest-certainty first. Effort: S ≤ ~1h, M ≈ half-day, L ≈ 1–2 days.
Frontend-first per constraint; backend items are called out with justification.

### Phase 1 — Isolated frontend bug fixes (low risk, high certainty)

**1.1 — Defensive label mapping in the task cast**
- Files: `tawer-management-frontend/src/modules/projects/types/cast-project-task.ts`
- Layer: Frontend · Effort: S · Risk: Low
- Why this phase: pure input-normalization; no API contract change; unblocks list/board label rendering
  regardless of which shape the endpoint sends.
- Acceptance: label chips render with real names and stable keys in list AND board views, with the list
  endpoint's current nested `{ label: {…} }` payload.

**1.2 — Stop illegal-status drops into local kanban columns**
- Files: `…/project-task/project-tasks-list.tsx`, `…/project-tasks-kanban-board.tsx`
- Layer: Frontend · Effort: S–M · Risk: Low
- Why this phase: eliminates a reproducible P8002 with a frontend-only guard (block/skip persisting moves whose
  target status isn't a registered project status, or don't allow ad-hoc `CUSTOM_…` columns to accept drops).
- Acceptance: dragging a task into a user-added local column no longer fires a failing `moveTaskInKanban`; the
  card either stays put or the column is not droppable.

**1.3 — Invalidate the task-detail query on label assign/unassign**
- Files: `…/hooks/labels/use-label-upload.ts`
- Layer: Frontend · Effort: S · Risk: Low
- Why this phase: one-line-ish cache-key addition; removes stale detail sheet after label changes.
- Acceptance: assigning/removing a label updates the open detail sheet without a manual refresh.

### Phase 2 — API-parity fixes required *before* disabling mock (root cause)

**2.1 — Restore `name`/`description` on the project list endpoint**
- Files (BE, recommended): `tdg-management-api-backend/src/projects/dto/response/fetch/project-list.dto.ts`
  · Alt (FE): `tawer-management-frontend/src/modules/projects/…/cast` for projects
- Layer: Backend (1-line `@Type(() => ProjectSummaryDto)` + import) · Effort: S · Risk: Low
- Backend justification: the frontend already expects the flattened shape everywhere else (detail/kanban already
  deliver it); making the list endpoint consistent by letting `plainToInstance` recurse is the correct, minimal
  fix. A frontend workaround would have to re-derive `name` from raw `contents[0]` and duplicate the backend's
  own transform — a drift source. Flagged for approval as a backend change.
- Acceptance: `GET …/projects` returns non-empty `name`/`description` per project against the real API.

**2.2 — Restore flattened labels on the task list endpoint**
- Files (BE, recommended): `…/tasks/dto/response/fetch/task-list.dto.ts` (add `@Type(() => TaskSummaryDto)`)
  · Alt (FE): already covered defensively by 1.1
- Layer: Backend 1-liner (or none if 1.1 is accepted as the fix) · Effort: S · Risk: Low
- Why this phase: same root cause as 2.1. If 1.1 ships, this is optional cleanup for a correct API contract; if
  not, this is the fix. Decide alongside 2.1.
- Acceptance: `GET …/tasks` returns `labels: [{ id, name, color }]` flat.

**2.3 — Guard empty-string UUIDs in the task upload payload**
- Files: `…/services/api/project-task-upload.ts` (+ the payload builder `use-project-task-upload.ts`)
- Layer: Frontend · Effort: S · Risk: Low
- Why this phase: prevents a latent 400 on multipart save when an optional UUID is cleared to `""`; strip
  empty-string UUID fields before `formData.append`.
- Acceptance: saving a task with a cleared assignee/epic/sprint/milestone via multipart succeeds (field omitted,
  not sent as `""`).

### Phase 3 — Remove mock mode (the core request; do after Phase 2)

**3.1 — Delete mock infrastructure and wire services to the API only**
- Files: `lib/mock-toggle.tsx`, `lib/mock-config.ts`, `app/[locale]/layout.tsx` (`<MockToggle/>` line),
  `modules/projects/services/index.ts`, `modules/projects/services/mock/*`, `modules/projects/services/extraction/assigned-project-tasks.ts`,
  `modules/tasks/services/extraction/task.ts` + `tasks.ts`, `modules/auth/services/users/user-details-extraction.ts`,
  `modules/notifications/services/notifications-extractions.ts` + `hook/use-notifications-token-setup.ts`,
  `modules/tracking/services/current-work-day-extraction.ts`, `src/mock_data/mock.json`, `modules/projects/mock_data/mock.json`
- Layer: Frontend · Effort: M · Risk: Medium
- Why this phase: sequenced after 2.1–2.3 so the first all-real run doesn't surface blank project names, broken
  labels, or save 400s. Medium risk because it exercises every real endpoint at once — do it as one reviewable
  change per module and smoke-test each module (projects, tasks, sprints, auth, notifications, tracking).
- Acceptance: no `USE_MOCK`/`useMockStore`/`MOCK_USER` references remain; all data/auth flows hit the real API;
  app builds and each listed module loads real data.

### Phase 4 — UX / feature gaps (medium, isolated)

**4.1 — Reminder entity picker**
- Files: `…/reminders/reminder-upload-sheet.tsx`, `…/project-reminders.tsx` (display)
- Layer: Frontend · Effort: M · Risk: Low–Med
- Why this phase: replace the free-text "Entity ID" with an entity-type-driven searchable picker (task/sprint/
  milestone lists already available via existing hooks); show resolved entity title in the list; expose the field
  in edit mode. No backend change needed.
- Acceptance: creating a reminder with `entityType=TASK` lets the user pick a task by title; the reminder list
  shows the linked entity's name; edit mode can view/change it.

**4.2 — Expand Gantt to consume the full backend payload**
- Files: `…/types/project-milestones.ts` (`GanttType`), the Gantt cast, `GanttView` in `project-milestones.tsx`
- Layer: Frontend · Effort: L · Risk: Med
- Why this phase: widen `GanttType` to include `epics/sprints/tasks`, then render a real timeline with those
  layers. Derive milestone ranges where only `dueDate` exists. Backend already provides the data.
- Acceptance: Gantt shows epic/sprint/task bars on a time axis, not just a milestone list.

**4.3 — Analytics empty-state handling**
- Files: analytics chart components (burndown/velocity) under `…/project-detail/…`
- Layer: Frontend · Effort: S–M · Risk: Low
- Why this phase: render explicit "no data — sprint needs start/end dates" / "no completed sprints yet" states
  instead of a blank chart, so empty series read as intentional rather than broken. (Backend date-precondition
  behavior is by design; no BE change.)
- Acceptance: date-less/new-project analytics show a clear empty state, not an unhoverable flat chart.

### Phase 5 — De-duplication (drift source)

**5.1 — Single source of truth for status transitions**
- Files: `…/project-task/task-status-stepper.tsx` (remove hardcoded `AGILE_TRANSITIONS`/`FREESTYLE_TRANSITIONS`
  and `getNextStatuses`), `…/project-tasks-toolbar.tsx:141–142` (hardcoded status sets); consume backend
  `allowedTransitions` / project statuses instead
- Layer: Frontend · Effort: M · Risk: Med
- Why this phase: transition legality currently lives in four places — backend `isValidStatusTransitionDynamic`,
  backend `isValidStatusTransitionEnum` (freestyle/agile maps), and the frontend stepper's own maps + logic. They
  can (and the enum maps already appear to) drift from the seeded `allowedTransitions`. Drive the UI purely from
  the statuses/`allowedTransitions` the API returns; keep the enum maps only as a backend last-resort fallback.
- Acceptance: the stepper offers exactly the transitions the backend will accept for a given project; no
  hardcoded transition map remains in the frontend; a legal move never shows as disabled and an offered move
  never returns P8002.

### Phase 6 — Hardening (OPTIONAL — separate approval, not bugs today)

**6.1 — Tighten global `ValidationPipe`**
- Files: `tdg-management-api-backend/src/main.ts`
- Layer: Backend · Effort: S · Risk: **Med–High** (behavior change across every endpoint)
- Why separate: adding `whitelist`/`forbidNonWhitelisted` is good prod hygiene but can start rejecting requests
  that currently pass, so it needs its own regression pass. Not causing a bug today.
- Acceptance: unknown body fields are stripped (or rejected) uniformly, with all existing flows still passing.

**6.2 — Restrict CORS**
- Files: `main.ts` (`app.enableCors()`)
- Layer: Backend · Effort: S · Risk: Med
- Why separate: `enableCors()` with no options is wide open; production should pin allowed origins. Config/ops
  decision, separate from functional bugs.
- Acceptance: only configured origins are accepted in production.

**6.3 — Systematic FE-type ↔ BE-select audit**
- Files: audit-only across `…/repositories/*` selects vs. frontend `types/*` and `cast-*`
- Layer: Both (analysis) · Effort: M · Risk: Low
- Why separate: the `milestoneId` gap is fixed and kanban parity confirmed, but a full field-by-field diff was
  not exhaustively done. Produces a checklist, not code.
- Acceptance: a documented list of any remaining fields the frontend reads that a backend select omits.

**6.4 — Fix `fc.float` incompatibility in `project-time-entries.test.ts`**
- Files: `tawer-management-frontend/src/modules/projects/__tests__/project-time-entries.test.ts:25`
- Layer: Frontend (test) · Effort: S · Risk: Low
- Why separate: the installed `fast-check` version requires 32-bit float bounds (`fc.float({ min: 0.1, max: 24 })`
  throws `constraints.min must be a 32-bit float`), so this suite fails to even execute. Confirmed pre-existing
  and unrelated to app code across Phase 1, 2, and 3 verification passes (reproduced independently of any of
  this plan's changes via `git stash`) — not fixed inline each time to avoid scope creep, but it should not keep
  being re-confirmed as a side note forever.
- Acceptance: wrap bounds with `Math.fround(...)` (or equivalent) so the suite runs; all other suites unaffected.

---

## Open questions & assumptions

1. **Preferred fix layer for 2.1/2.2.** I recommend the one-line backend `@Type` additions (correct + consistent
   with detail/kanban, avoids duplicating the flatten logic in the frontend). If backend changes are off-limits,
   1.1 covers labels defensively but project `name`/`description` would need an equivalent `contents[0]` fallback
   in the frontend project cast. Which layer do you want?
2. **Mock removal scope.** Assumed you want the mock system fully deleted (files + toggle + fixtures), not merely
   defaulted off. Confirm; also confirm auth mock (`MOCK_USER`) should go at the same time as data mock.
3. **4B reproducibility.** I flagged the empty-string-UUID 400 as latent from the DTO + multipart-stringify code;
   I did not confirm the payload builder ever emits `""`. 2.3 is cheap insurance regardless — keep it or drop it
   based on whether you've actually seen that 400.
4. **Custom kanban columns intent (1.2).** Are user-added local columns meant to become real project statuses
   (persisted via the task-status API) or purely a local view grouping? That decides whether 1.2 blocks the drop
   or should instead create a backing status. Assumed local-only for now.
5. **Gantt ambition (4.2).** Assumed a genuine multi-layer timeline is wanted. If a milestone list is acceptable
   short-term, 4.2 drops to S and only the type widening is needed to stop discarding data.
6. **Serialization assumption.** The list-endpoint verdicts rely on NestJS 11's `transformToPlain` doing
   `plainToInstance(options.type, …)` (confirmed in the installed package) and on class-transformer not recursing
   into untyped arrays. Both were checked against the vendored code, not via a running request.
