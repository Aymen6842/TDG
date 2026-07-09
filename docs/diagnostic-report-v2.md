# Diagnostic Report v2 — Fresh Full Audit (Usage + Code)

Read-only audit. **No code was changed.** This is a fresh pass done by actually running both
servers against the real backend (no mock — mock mode was already removed in Phase 3) and clicking
through every major module, plus an independent code-level review.

Line numbers reflect the current tree at the time of writing.

## How this was tested

- **Backend**: existing NestJS process on `:3001` (started today), real Postgres/Redis/Mailpit
  (Docker, healthy). Seeded data: 13 projects, 18 tasks, 2 sprints, 4 epics, 8 milestones, 22 reminders.
- **Frontend**: `next dev` on `:3000`, driven through the browser. Logged in as `ceo@tdg.com`
  (Marco Rossi) via the persisted session; permission checks also run as `intern@tdg.com`.
- **Modules exercised**: login/auth, projects (list, detail, search, status filters), tasks
  (list, kanban, detail sheet, create form + validation, live status transitions), sprints, epics,
  milestones (list + Gantt), reminders, notifications, analytics (burndown/velocity, populated +
  empty), time-tracking check-in. Empty-state project, permission boundaries, blocked transitions,
  and referenced-entity deletes were probed directly against the API.

**Overall health is good.** The Phase 1–5 fixes hold up under real usage: project/label/epic names
resolve, the status stepper offers exactly the backend's `allowedTransitions`, custom-status
persistence works, create/save produces no 400s, empty states render intentionally, permission
boundaries and referential deletes behave gracefully, and there are **zero uncaught console errors or
failed mutations** across every screen. The findings below are the residue.

---

# Part 1 — Bugs / glitches found via real usage

### P1-1. Check-in silently fails to register between 00:00–02:59 UTC — **Breaks a flow · Effort M**
**Backend** · `common/time/service/time.service.ts:38-55`,
`work-days/repositories/filter-work-day.repository.ts:273-281`,
`work-days/services/work-days.service.ts:390-398`

- **What I did:** From the home screen chose "Check In Remotely" → "Check In".
- **What happened:** `POST /work-days/sessions/start` returned **201** and a "Welcome!" modal showed,
  but `GET /work-days/current` kept returning **404** (`P2502 "Work day not found for today!"`) — the
  check-in gate stayed up, and it reappeared on every reload for the whole session. A `WorkDay` row
  *was* created in the DB, yet `current` still couldn't find it.
- **What should happen:** After check-in, `current` returns the active work day and the app shows the
  checked-in / active-session state.
- **Root cause:** `getStartOfBusinessDayUTC()` = *today's* UTC-midnight + 3h (**03:00 UTC**);
  `getEndOfBusinessDayUTC()` = tomorrow 02:59:59 UTC. So the "business day" window is
  `[today 03:00 UTC, tomorrow 02:59:59 UTC]`. When the current time is between **00:00 and 02:59 UTC**,
  those early hours actually belong to the *previous* business day (which started at 03:00 yesterday),
  but the code anchors the window to *today's* 03:00 — a time still in the future. `getOrCreate` uses
  the same query, so it finds nothing and creates a `WorkDay` whose `createdAt` (~00:40) is *before*
  the window it just searched; `getCurrentWorkDayForUser` uses the identical window and can never find
  it. Result: a ~3-hour dead zone each day (01:00–03:59 local for UTC+1) where check-in "succeeds" but
  the app never recognizes it — the gate loops, the tracking widget stays empty, and check-out can't
  find the session. Reproduced live (it was ~01:00 UTC during the audit).
- **Note:** This is why the Phase-3 note recorded check-in as "confirmed working" — it was verified in
  daytime UTC, outside the broken window. Fix belongs in the boundary logic: when `now < 03:00 UTC`,
  the window must span `[yesterday 03:00, today 02:59:59]`.

### P1-2. Task detail sheet shows stale status after a transition — **Degrades UX · Effort S**
**Frontend** · `modules/projects/components/project-detail/project-task/task-status-stepper.tsx:55`,
`.../project-task-details-sheet.tsx:46-53`

- **What I did:** Opened TASK-3's detail sheet, used the status stepper to move **Todo → In Progress**
  (a legal transition the stepper offered).
- **What happened:** Toast confirmed `Status → In Progress` (PATCH 200, list updated in the
  background), but the sheet's own status badge stayed **Todo** until the sheet was closed and reopened.
- **What should happen:** The open sheet reflects the new status immediately.
- **Root cause:** The stepper invalidates `["project-tasks", projectId]` (the list) but not
  `["project-task", projectId, taskId]` (the detail query the sheet prefers via
  `displayTask = fullTask ?? task`). This is the **exact same cache-key class** already fixed for label
  assign/unassign in Phase 1.3 (`use-label-upload.ts` invalidates the detail key) — the status stepper
  was simply not given the same treatment. Add the detail key to the invalidation.

### P1-3. Gantt "Sprints" rows have no name/title — **Degrades UX · Effort S–M**
**Backend + Frontend** · `milestones/services/milestones.service.ts:440-445`,
`milestones/repositories/fetch-milestone.repository.ts:187-198`,
`modules/projects/components/project-detail/milestones/project-milestones.tsx:75-82`,
`modules/projects/types/project-milestones.ts:58-63,103-108`

- **What I did:** Milestones tab → Gantt view on the populated project.
- **What happened:** The **Milestones** and **Epics** rows show their names; the **Sprints** row shows
  only a status badge ("Completed") and a date range — no sprint name, so a sprint is unidentifiable.
- **What should happen:** Sprint rows show the sprint title like the other two sections.
- **Root cause:** The Gantt payload's `sprints.map` returns only `{ id, status, startDate, endDate }`
  (epics include `name`, milestones include `name`). Sprint names live in `SprintContent`, which
  `findAllSprints` doesn't join, and the FE `GanttSprint` type has no `name` field at all. Fix = join
  `sprintContents` in `findAllSprints`, add `name` to the map + FE type, render it. (The Gantt itself
  is still the labelled-list rendering acknowledged under plan item 4.2, not a true timeline — that
  part is tracked; only the missing sprint name is new.)

### P1-4. Project task list & kanban are hard-capped at 100 tasks with no pagination — **Degrades UX / scalability · Effort M**
**Frontend** · `modules/projects/services/api/project-tasks.ts:54`

- **What I observed:** Every project-tasks load fires `GET /projects/:id/tasks?limit=100` and renders
  the flat array; status-tab filtering is done client-side over that same 100-cap. Both the list view
  and the kanban board share this one fetch. There is no pagination or infinite-scroll control.
- **Why it matters:** A project with more than 100 tasks silently loses everything past the 100th in
  both views (and the kanban column counts/backlog would be wrong). The backend list endpoint *is*
  paginated; the frontend just doesn't use it. This is a direct scalability gap. (`project-epics.ts:17`
  and `project-creators.ts:16` use the same `limit=100`, no-pagination pattern.)

### P1-5. Leftover `DEBUG` console.log spam on the task list — **Degrades UX (polish) · Effort S**
**Frontend** · `modules/projects/components/project-detail/project-task/project-task-item.tsx:73-75`

- **What happened:** The task list logs three `DEBUG …` lines (`Task ID`, `Epic ID … Found in epics`,
  `epics array length`) **for every task item on every render** — confirmed live, the console fills with
  dozens of them on the populated project. Clearly leftover debugging that shipped. Delete the three lines.

### P1-6. Minor / cosmetic (confirmed, low value)
- **Analytics tooltips show raw data keys** — velocity tooltip reads `completedPoints : 8`
  (`analytics/velocity-chart.tsx:41-42` uses a bare `<Tooltip />`, no formatter). This is the same raw
  `<Tooltip/>` the original report flagged in 5b; now that data renders, it surfaces as an
  un-humanized label. **Cosmetic · S.**
- **Create-Task due-date uses a native `datetime-local` input** — it renders the OS/browser locale
  ("jj/mm/aaaa --:--", French) inside an English-only app, and is inconsistent with the custom
  calendar picker used elsewhere. Inherent to native inputs. **Cosmetic · S.**
- **Epics tab lacks the search / filter / view-toggle toolbar** that Tasks and Sprints have — a
  per-module UX inconsistency, not a failure. **Cosmetic · S.**

### Already tracked — referenced, not re-described
- `GET /work-days/current → 404` as the "not checked in" empty state (returns a business error for a
  normal state; the FE swallows it in `current-work-day-extraction.ts`). Design smell; feeds the red
  404s in the network tab. It's the same tracking-empty behavior noted in the plan. *(Also the visible
  symptom of P1-1 above during the broken window.)*
- Custom statuses render uncolored / dropped from the assignee-swimlane kanban — deferred cosmetics
  under plan item 5.2. Root cause discussed in P2-3 below.

### Checked and found clean (stated explicitly)
- **Permission boundaries:** intern gets a graceful `403 "Project not found or access denied"` on a
  CEO project and sees `0` projects in the list; deleting a system status returns `403 "System
  statuses cannot be deleted"`. No leaks, no 500s.
- **Blocked transitions:** `DONE → TODO` returns a clean `400 P8002`, not a 500.
- **Create / save:** create-task has client validation ("Title is required") *and* the POST returns
  **201** with no 400 — the multipart/coercion 400 class from the original report did not reproduce.
- **Empty states:** empty project shows "No tasks found"; empty analytics shows "No completed sprints
  yet". Intentional, not broken.
- **Referenced-entity deletes:** Task FKs to epic/sprint/milestone/assignee are `SET NULL`, so deleting
  a referenced entity cleanly nulls the task reference (no orphan, no 500).
- **Search + status-filter combos** on the projects list work correctly.
- Browser back/forward was spot-checked and showed no obvious breakage, but was **not** exercised
  exhaustively (the check-in gate on every full reload — see P1-1 — made mid-flow reload testing noisy).
- **Not exhaustively tested:** the project/sprint/epic/milestone *create* forms (only the task create
  form was driven end-to-end), the Members & Invitations tab, and file-attachment upload on
  create/update.

---

# Part 2 — Architectural / code-quality findings

### P2-1. Inconsistent error handling: list services swallow errors to `[]`/`null` — **Degrades UX / correctness · Effort M**
`modules/projects/services/api/project-tasks.ts:60-65` (and `project-sprints.ts`, `projects.ts`,
`project-creators.ts`), vs. `project.ts` / `retrieveProjectTask` which `throw`.

The list-fetch services catch, retry once on 401, then `return []` / `return null` on **any** other
error. A backend 500, a 403, or a network failure therefore renders as an *empty* list — the user sees
"No tasks found" instead of an error, React Query never enters an error state, and there's no retry or
toast. Meanwhile the detail-fetch functions in the same files `throw`, so the two halves of the module
behave differently for the same failure. **Why it matters:** silent failures are the hardest kind to
notice in prod, and the split makes error UX unpredictable. Recommend: let queries throw uniformly and
render explicit error/retry states (React Query already supports this).

### P2-2. `useCurrentUser` re-fetches `/users/me` on every navigation — **Degrades UX (perf) · Effort S**
`modules/auth/hooks/users/use-user.ts:10` — `queryKey: ["user-data", pathname]`.

Keying the current-user query by `pathname` means each route change is a fresh cache entry and a fresh
`GET /users/me`, even though the current user is not route-dependent. Observed in the network tab:
`/users/me` fires repeatedly across navigation (and 2–3× within a single load alongside a duplicated
`/work-days/current`). Drop `pathname` from the key (`["user-data"]`) so it's fetched once and shared.

### P2-3. Task status/priority/type colors are duplicated between FE and BE — **Drift source · Effort M**
`modules/projects/utils/badges/project-task-badges.ts` +
`.../project-task/task-status-stepper.tsx:71`

The backend `ProjectTaskStatus` row carries an authoritative `color` (hex), which the frontend
*already fetches* via `useTaskStatuses`. But the UI ignores it and paints statuses from a hardcoded
`projectTaskStatusClasses` map keyed to the six **system** status names. Two consequences: (a) the two
color sources can drift, and (b) any **custom** status isn't in the map and falls back to grey
`bg-muted` — this is the exact root cause of the "custom statuses render uncolored" cosmetic deferred
under 5.2. Consuming the backend `color` (inline style) instead of the hardcoded map fixes the custom
case and removes the drift in one move. Same class of FE/BE-duplication that the status-transition work
already eliminated once — it just lives in the color layer now.

### P2-4. Backend keeps a duplicated hardcoded transition map — **Drift source (acknowledged) · Effort M**
`tasks/services/tasks.service.ts:387,415,424-450` vs. seeded defaults in
`tasks/repositories/task-statuses.repository.ts:164-222`

Transition legality now has three representations in the backend: the per-project seeded
`allowedTransitions` (authoritative), and the hardcoded `freestyleTransitions` / `validTransitions`
maps inside `isValidStatusTransitionEnum` (fallback). They currently agree, but any change to the seed
defaults must be mirrored by hand or they silently diverge. Compounding it, the write-side validator
calls `loadProjectStatuses` (non-seeding) while the read paths use `loadProjectStatusesEnsured`
(seed-on-read) — so a project whose statuses were never materialized validates against the enum
fallback while its UI shows seeded statuses. Plan 5.1 deliberately kept the enum map as a
"last-resort fallback," so this is semi-acknowledged; flagging it as the remaining drift risk and
recommending the fallback derive from the same seed constant both paths share.

### P2-5. Naming & structure inconsistencies — **Cosmetic · Effort S**
- The misspelling **`retreive`** (for "retrieve") is baked into function and file names across **16
  files** (`retreiveCurrentWorkDayFromServerSide`, tracking/notifications/users/events services). It's
  consistent, so not a bug, but it's in the public surface of many modules and hurts navigability.
- Two different `use-user.ts` hooks exist (`modules/auth/hooks/users/use-user.ts` and
  `modules/users/hooks/extraction/use-user.ts`) — easy to import the wrong one.
- Branding is inconsistent across configs: repo/app is "Tawer" (`tawer-management-frontend`,
  `company_name: "Tawer MNG"`, UI "Tawer Digital Group"), backend is "TDG"
  (`tdg-management-api-backend`), and `.env COMPANY_NAME="La Porta di Roma"`. Cosmetic, but worth one
  cleanup pass before "prod-ready."

### P2-6. Schema: Task `reporterId` is `CASCADE` while `assigneeId` is `SET NULL` — **Low · Effort S**
`prisma/schema/agile.schema.prisma` (Task FKs; verified against live DB constraints)

Deleting a user **nulls** the tasks they're assigned to but **deletes** the tasks they reported —
asymmetric handling of the two user references on the same row, and a potential surprise data-loss path
if a user is ever hard-deleted. Low priority (hard user deletion is rare) but worth aligning
(`reporterId → SET NULL`) for consistency.

### Checked and found clean (stated explicitly)
- **Mock removal is complete** — no `USE_MOCK` / `MOCK_USER` / `mock-toggle` / `.mock` references
  remain in the frontend `src`. Nothing dangling.
- **No `as any` / `@ts-ignore` in backend production code** — the only hits are in `*.spec.ts` test files.
- Backend controllers use the `UploadStorage.*()`-passed-directly pattern uniformly (the Multer
  double-wrap from the original report is gone, as the plan recorded).

---

## Suggested priority order (fixes only — no new scope)

1. **P1-1** check-in dead-zone (real correctness bug in a core module) — M
2. **P1-2** stale status in the detail sheet (one-line-ish, mirrors an existing fix) — S
3. **P1-5** remove `DEBUG` console.logs (trivial, visibly unprofessional) — S
4. **P2-1** stop swallowing list errors to `[]` (masks prod failures) — M
5. **P2-2** drop `pathname` from the user query key (perf, trivial) — S
6. **P1-3** Gantt sprint name — S–M
7. **P2-3** drive status colors from the backend `color` (also fixes the 5.2 custom-status cosmetic) — M
8. **P1-4** paginate the project task list/kanban (scalability) — M
9. Cosmetics: **P1-6**, **P2-5**, **P2-6**, **P2-4** as a cleanup batch.

Nothing here was fixed — diagnosis only, same discipline as the original audit.
