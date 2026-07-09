# PFE Documentation Plan — Module-by-Module Dossiers

**Goal:** Build a set of *verified*, evidence-cited technical dossiers (one per module / cross-cutting
area), then assemble the PFE report **only** from those dossiers. This reduces hallucination because
the report is written from checked analyses, not raw code.

**How to use this file**
- Each dossier is written in its **own fresh Claude session** (clean context = higher quality).
- Dossiers are the *state carried between sessions* — they live in `docs/dossiers/`.
- For each session: paste **§A SHARED PREAMBLE** + the **session block** from §D. Nothing else.
- Do the sessions **in order** (foundations first, then domains, then frontend/ops, then assembly).
- Never start the report until every dossier's Verification Checklist is green or its gaps are listed.

Project = full-stack management platform. Backend `tdg-management-api-backend` (NestJS 11 / Prisma 7 /
PostgreSQL+pgvector / Redis). Frontend `tawer-management-frontend` (Next.js 16 / React 19 / TanStack
Query / Zustand / react-hook-form+Zod). ~146 endpoints, 20 controllers, 55 Prisma models.

---

## §A — SHARED PREAMBLE (paste at the top of EVERY session)

```
ROLE: You are reverse-engineering my project to produce authoritative technical documentation.
This is NOT an evaluation and NOT a code review. The output is a factual dossier that will later
feed my PFE report, so accuracy matters more than praise or completeness of prose.

HARD RULES
1. Verify every claim by opening the implementation. If you did not read it, do not assert it.
2. Cite evidence for every non-trivial statement as `path/to/file.ts:line` (real lines only).
3. When you cannot verify something, write "Not verified" — never guess, never infer behaviour.
4. Prefer dense and exact over long. Do not pad. No filler, no marketing language.
5. Diagrams must be real Mermaid code blocks generated from the code you read (not prose).
6. Do NOT modify any code. Read-only. The only file you write is the dossier markdown.
7. Stay strictly inside this session's scope. If something belongs to another module, note the
   dependency and move on — do not document it here.
8. Existing audits you may cite as evidence (but must still verify): docs/diagnostic-report-v2.md,
   docs/diagnostic-report.md, docs/execution-plan.md, docs/ai-*.md.

OUTPUT: Write the dossier to the path given in the session block, using the TEMPLATE (§B) exactly,
in the section order given. End with the Verification Checklist and the Not-Verified list.
Do not produce a "score"; produce the checklist instead.
```

---

## §B — DOSSIER TEMPLATE (every dossier uses these sections, in this order)

```
# Dossier NN — <Module Name>

## 1. Identity
- One-line purpose.
- Backend source root(s): <paths>
- Frontend source root(s): <paths>
- Owned DB tables/models: <list>

## 2. Purpose & business problem
Why the module exists; which real workflow/user it serves. (cite where the behaviour lives)

## 3. Domain model & database
Tables/models, fields, relationships (1-1/1-N/N-N), enums, indexes, constraints, cascade rules.
For each design choice, explain WHY (normalization, content-table split, soft delete, etc.).
Cite prisma schema file:line.

## 4. Backend architecture
Controllers, services, repositories, DTOs, guards, pipes, validation, business rules, transactions,
error handling. For each important class: what it does and why it exists. Note the layering
(controller -> service -> repository) and any deviations. Cite file:line per claim.

## 5. API surface
A table of every endpoint in scope:
| Method | Path | Auth/Perm | Request DTO | Response DTO | Validation | Business logic (1 line) | Side effects |
Cite the controller file:line for each row.

## 6. Frontend
Pages/routes, key components, hooks, services (API calls), state (Zustand store / React Query keys),
forms + Zod schemas, and the UX flow the user actually experiences. Cite file:line.

## 7. Data flow & key scenarios
Step-by-step walkthrough of the 1-3 most important scenarios (e.g. "create X", "move X"),
from UI action -> HTTP -> service -> repository -> DB -> response -> UI update.

## 8. Diagrams (Mermaid)
- Sequence diagram(s) for the key scenario(s).
- Class/ERD slice for this module's tables.
- Component diagram (frontend<->backend) if useful.

## 9. Security
Authentication touchpoints, authorization (which guard/permission/role), input validation,
injection protection (Prisma parameterization, DTO whitelisting), access-control specifics,
ownership checks. Note strengths AND gaps, with evidence.

## 10. Cross-module dependencies
What this module imports/depends on; what depends on it. Comment on coupling & cohesion with
evidence (e.g. shared Prisma models, injected services).

## 11. Tests
What unit/e2e tests exist for this module, what they cover, and the gaps. Cite the spec files.

## 12. Code quality
Readability, SOLID, separation of concerns, error handling consistency — each point backed by a
concrete file:line example (good or bad).

## 13. Verified technical debt
Only VERIFIED issues: bugs, code smells, TODOs, duplicated logic, dead code. Cite each. If you
suspect but cannot confirm, put it under Not-Verified instead.

## 14. Strengths / Weaknesses / Improvements
Bullet lists. Each strength/weakness: WHY it is one + impact. Each improvement: concrete + feasible.

## 15. Verification Checklist
| Area | Verified? (Yes/Partial/No) | Evidence or reason if not |
(rows: domain model, backend logic, every endpoint, frontend pages, security, tests, tech debt)

## 16. Not verified / Open questions
Explicit list of everything you could not confirm and what would be needed to confirm it.
```

---

## §C — SESSION MAP (order matters)

Foundations (do first — later dossiers reference them):
- **00** Overview & architecture (whole-system) → `docs/dossiers/00-overview.md`
- **01** Backend architecture & conventions (+ common/, logs, lock-management, global filter)
- **02** Database architecture (all 55 models, migrations, pgvector) — the ERD source
- **03** Security, Authentication & RBAC (auths, guards, tokens, bcrypt, reset-password)

Domain modules (backend + frontend + DB slice + endpoints + diagrams each):
- **04** Users & Teams
- **05** Projects & Membership (+ invitations, content, project task-statuses)
- **06** Agile backlog — Epics, Sprints, Milestones
- **07** Tasks (comments, mentions, likes, labels, dependencies, time-entries, kanban, attachments)
- **08** Personal Tasks / To-do
- **09** Time & Attendance — Work Days / Work Sessions
- **10** Events & Calendar
- **11** Reminders (+ channels)
- **12** Notifications (multi-channel: firebase / ntfy / telegram / mail, tokens, settings)
- **13** Infrastructure Monitoring (servers, services, health checks)
- **14** AI Copilot & Estimation (RAG: embeddings, retrieval, reranker, outbox indexing, eval)

Cross-cutting frontend + ops:
- **15** Frontend architecture (app router, i18n, React Query, Zustand, forms, API layer, auth guard)
- **16** Deployment & DevOps (docker-compose, Dockerfiles, env, redis, mailpit, health)

Assembly:
- **17** PFE report assembly (from dossiers only)

---

## §D — SESSION BLOCKS (paste ONE of these under §A per session)

### Session 00 — Overview & architecture
```
SCOPE: Whole system, high level only. Read: both package.json, docker-compose.yml,
tdg-management-api-backend/src/app.module.ts, nest-cli.json, the prisma/schema/*.prisma file names,
tawer-management-frontend/next.config.ts and src/app + src/modules folder structure, README files.
OUTPUT: docs/dossiers/00-overview.md
FOCUS: tech stack with versions (cite package.json); the two-app architecture; how modules are
organized on both sides; the full module inventory; a whole-system component/deployment diagram
(Mermaid); the request lifecycle end-to-end (browser -> Next -> API -> Prisma -> Postgres/Redis).
Do NOT go deep into any single module here. This is the map.
```

### Session 01 — Backend architecture & conventions
```
SCOPE: tdg-management-api-backend/src/common/** , src/logs/** , src/lock-management/** ,
src/app.module.ts, main.ts, and the controller/service/repository/dto pattern as used across modules
(read 2-3 modules e.g. tasks + projects only to illustrate the pattern — do not fully document them).
OUTPUT: docs/dossiers/01-backend-architecture.md
FOCUS: the layered architecture (controller -> service -> repository -> dto), how NestJS modules/DI
wire together, the global exception filter (common/filters), logging (Winston), config, Prisma
service, Redis/cache usage, the locking mechanism (lock-management) and error logging (logs) as
cross-cutting concerns. Provide a layered-architecture diagram + a generic request sequence diagram.
Explain the conventions a new engineer must know to read any module.
```

### Session 02 — Database architecture
```
SCOPE: tdg-management-api-backend/prisma/** (all schema/*.prisma, migrations/, seed.ts, prisma.config).
OUTPUT: docs/dossiers/02-database-architecture.md
FOCUS: every one of the 55 models grouped by domain; all relationships; all 25 enums; indexes,
unique constraints, cascade behaviour; the content-table pattern (e.g. ProjectContent/TaskContent) and
why it exists (i18n/versioning?); pgvector tables (DocumentEmbedding, IndexOutbox); migration history
highlights. Produce ONE full Mermaid ERD (may split into per-domain ERDs if too large). For each
non-obvious design decision explain WHY. This dossier is the single source of truth for all schema.
```

### Session 03 — Security, Authentication & RBAC
```
SCOPE: src/auths/** , src/tokens/** , src/common/bcrypt/** , and every guard/decorator
(is-authenticated, has-permission, roles, agile-only) + how they are applied across controllers.
OUTPUT: docs/dossiers/03-security-auth-rbac.md
FOCUS: registration, login, JWT issue/refresh (RefreshToken model), logout, password reset flow;
the Role/permission model and how has-permission.guard + permissions.decorator enforce RBAC; UserType
roles; bcrypt hashing; where guards are attached (grep @UseGuards). Document the FULL auth sequence
diagrams (login, refresh, protected request). Security section must cover injection protection, DTO
whitelisting/validation, token storage, and any gaps. This is a cross-cutting dossier other modules cite.
```

### Session 04 — Users & Teams
```
SCOPE: Backend src/users/** , src/teams/** (+ models User, UserManager, Team, UserTeam, Role).
Frontend tawer-management-frontend/src/modules/users/** and the users/teams pages under
src/app/[locale]/dashboard/(auth)/users/**.
OUTPUT: docs/dossiers/04-users-teams.md
FOCUS: user CRUD/profile, manager relationships (UserManager), team membership (UserTeam),
BusinessUnit/UserType enums. Full template. Cite endpoints from users.controller & teams controller.
```

### Session 05 — Projects & Membership
```
SCOPE: Backend src/projects/** (+ models Project, ProjectContent, ProjectMember, ProjectInvitation,
ProjectTaskStatus, enums ProjectStatus/ProjectType). Frontend src/modules/projects/** (largest FE
module: components/hooks/services/store/validation) and app .../projects/** pages.
OUTPUT: docs/dossiers/05-projects.md
FOCUS: project lifecycle & status, membership + invitation flow (InvitationStatus), per-project custom
task statuses, cost/description fields (see migrations), project content pattern. This is the biggest
module — spend the effort. Sequence diagrams for create-project and invite-member.
```

### Session 06 — Agile backlog (Epics, Sprints, Milestones)
```
SCOPE: Backend src/epics/** , src/sprints/** , src/milestones/** (+ models Epic, Sprint, SprintContent,
SprintAttachment, Milestone, enum SprintStatus). Frontend: agile pieces inside src/modules/projects/**
and kanban/sprint pages.
OUTPUT: docs/dossiers/06-agile-backlog.md
FOCUS: the hierarchy (Project -> Epic -> Sprint -> Task, and Milestones), sprint lifecycle/status,
burndown/velocity if present, attachments. Class diagram of the agile hierarchy + sprint state machine.
```

### Session 07 — Tasks (core)
```
SCOPE: Backend src/tasks/** (large: tasks.controller + user-tasks.controller, many DTOs, repositories
create/update/delete/fetch/labels/statuses). Models Task, TaskContent, TaskComment, TaskCommentLike,
TaskCommentMention, TaskLabel, TaskLabelAssignment, TaskDependency, TaskTimeEntry, TaskAttachment,
ProjectTaskStatus; enums TaskPriority, TaskStatusType, TaskType. Frontend src/modules/tasks/** + kanban
components + tasks pages + task detail sheet.
OUTPUT: docs/dossiers/07-tasks.md
FOCUS: the richest module. Cover task CRUD, kanban move + reorder (display_order), status transitions
& allowedTransitions, dependencies, time logging (TaskTimeEntry), labels, comments+mentions+likes,
attachments, bulk status update. Multiple sequence diagrams (create task, move in kanban, log time).
Cite the real-usage findings in docs/diagnostic-report-v2.md where relevant (verify first).
```

### Session 08 — Personal Tasks / To-do
```
SCOPE: Backend src/personal-tasks/** (models UserTask, UserTaskContent, UserTaskComment,
UserTaskAttachment; enums UserTaskStatus, UserTaskPriority). Frontend: todo-list pages under
src/app/[locale]/dashboard/(auth)/todo-list/** and any personal-task module code.
OUTPUT: docs/dossiers/08-personal-tasks.md
FOCUS: how personal tasks differ from project tasks (separate tables), display_order, personal vs
project todo split. Full template.
```

### Session 09 — Time & Attendance (Work Sessions)
```
SCOPE: Backend src/work-days/** (work-sessions.module; models WorkDay, WorkSession; enums
WorkSessionDevice, WorkSessionLocation, DeviceType) + src/common/time/**. Frontend src/modules/tracking/**
and the check-in UI on the dashboard home.
OUTPUT: docs/dossiers/09-time-attendance.md
FOCUS: check-in/check-out, work day vs session, device/location tracking, timezone handling
(common/time). IMPORTANT: verify the timezone/midnight check-in bug reported in
docs/diagnostic-report-v2.md (P1-1) by reading the code before repeating it. Sequence diagram for check-in.
```

### Session 10 — Events & Calendar
```
SCOPE: Backend src/events/** (models Event, EventContent, EventParticipant; enums EventType,
EventColor). Frontend src/modules/events/** + calendar pages (events/meetings/personal) using FullCalendar.
OUTPUT: docs/dossiers/10-events-calendar.md
FOCUS: event types, participants, calendar rendering, recurrence if any. Full template.
```

### Session 11 — Reminders
```
SCOPE: Backend src/reminders/** (models Reminder, ReminderChannel; enums ReminderEntityType,
ReminderStatus). Frontend src/modules/reminders/**.
OUTPUT: docs/dossiers/11-reminders.md
FOCUS: reminder scheduling (@nestjs/schedule cron?), polymorphic entity targeting (ReminderEntityType),
delivery channels, status lifecycle. Sequence diagram for "reminder fires -> notification".
```

### Session 12 — Notifications (multi-channel)
```
SCOPE: Backend src/notifications/** + src/common/{firebase,ntfy,telegram,mail}/** (models Notification,
NotificationContent, NotificationToken, UserNotification, UserNotificationSettings, UserNtfyIntegration,
UserTelegramBot; enum ChannelType). Frontend src/modules/notifications/** + navbar notifications +
notifications settings/view pages + public/firebase-messaging-sw.js.
OUTPUT: docs/dossiers/12-notifications.md
FOCUS: the multi-channel delivery architecture (in-app, push/firebase, ntfy, telegram, email), token
registration, per-user settings, fan-out. Component diagram of the delivery pipeline + a sequence
diagram for one notification across channels.
```

### Session 13 — Infrastructure Monitoring
```
SCOPE: Backend src/servers/** (models Server, Service, ServerNotification, ServiceNotification,
UserServerManagement; enum ServerServiceStatus) + ping usage + src/health/**. Frontend
src/modules/infrastructure/** + infrastructure/servers + infrastructure/services pages.
OUTPUT: docs/dossiers/13-infrastructure-monitoring.md
FOCUS: server/service registration, health-check polling (ping, lastHealthCheck), status transitions,
per-server manager assignment, alerting. Sequence diagram for a health-check cycle.
```

### Session 14 — AI Copilot & Estimation
```
SCOPE: Backend src/ai/** (controllers, services: copilot, retrieval, reranker, embedding, indexing,
index-outbox, estimation, ai-access, telemetry; repositories embedding/outbox; jobs/index-sweeper;
eval/**) + src/common/gemini/** + models DocumentEmbedding, IndexOutbox, CopilotQueryLog + pgvector
migration. Frontend src/modules/ai/** + ai-chat-v2 pages/components. Also read docs/ai-*.md (verify).
OUTPUT: docs/dossiers/14-ai-copilot.md
FOCUS: the RAG pipeline end-to-end — outbox-based indexing, embedding generation (Gemini), hybrid
lexical+vector retrieval with RRF, LLM reranker, copilot answering, streaming, story-point/size-aware
estimation, the eval harness (gold sets, metrics, faithfulness judge), telemetry, and AI access control
(ai-access.service). This is the project's differentiator — go deep. Sequence diagrams for
"index a task" (outbox->embedding) and "copilot query" (retrieve->rerank->answer). Full template.
```

### Session 15 — Frontend architecture (app-wide)
```
SCOPE: tawer-management-frontend/src/app/** (routing, [locale], (guest)/(auth) groups, layouts,
error/loading/not-found), src/i18n/**, messages/{en,fr}.json, src/lib/** (http-methods, firebase,
parse-backend-date, localstorage), src/hooks/**, src/utils/providers, proxy.ts, the React Query +
Zustand setup, and one module's services/hooks/validation as the canonical pattern.
OUTPUT: docs/dossiers/15-frontend-architecture.md
FOCUS: Next.js app-router structure, route groups & auth gating, i18n (next-intl), data fetching
(TanStack Query keys/mutations), global state (Zustand), the API/axios layer + auth token handling,
form pattern (react-hook-form + Zod), theming, error boundaries. Component/data-flow diagrams.
Do NOT re-document per-module UI (that's in each domain dossier) — document the shared architecture.
```

### Session 16 — Deployment & DevOps
```
SCOPE: docker-compose.yml, tdg-management-api-backend/Dockerfile, tawer-management-frontend/dockerfile,
.env usage (ConfigModule), .claude/launch.json, prisma migrate workflow, ServeStatic/static uploads,
health endpoint, any CI config.
OUTPUT: docs/dossiers/16-deployment-devops.md
FOCUS: how the system is built and run (dev + prod), services (postgres pgvector, redis, mailpit),
environment configuration, migration/seed workflow, file uploads/static serving, health checks.
Deployment diagram (Mermaid). Note what is NOT set up (e.g. CI/CD) as Not-verified/gaps honestly.
```

### Session 17 — PFE report assembly
```
INPUT: ALL files in docs/dossiers/*.md. Do NOT re-read source code except to resolve a specific
contradiction between dossiers.
RULE: If a fact is not in a dossier, it does not go in the report. Every technical claim must trace
to a dossier (and through it to file:line).
TASK: Produce the PFE report structure and content: Introduction/context & problématique, objectives,
state of the art, methodology, global architecture, detailed conception per module (reuse the dossiers'
diagrams), réalisation, security, tests, results, limitations & future work, conclusion. Output a
chapter plan first for approval, then draft chapter by chapter. Keep all Mermaid/UML diagrams.
```

---

## §E — Progress tracker (update after each session)

| # | Dossier | Status | Checklist green? | Notes |
|---|---------|--------|------------------|-------|
| 00 | Overview | ☑ | Yes (tests coverage = No) | Verified: 146 endpoints/20 controllers, 55 models/25 enums/15 schema files. Dev API port=3001. Debt: stale `laporta-di-roma` README/pkg name, dead `proxy.ts` middleware, hard-coded Firebase config. |
| 01 | Backend architecture | ☑ | Yes (tests = Partial) | Verified: 4-layer pattern (controller→service→repo→dto) via projects/tasks; global ValidationPipe + AllExceptionsFilter (dedup 500s→ErrorLog→Gemini/Telegram); 3 Winston loggers; Postgres `Locking` (FOR UPDATE SKIP LOCKED) as distributed lock for crons. Debt: LoggerMiddleware unwired, RedisModule/CommonModule dead, TransformLanguagePipe always returns English, no ValidationPipe whitelist, open CORS, cookie-parser never registered, env-key typos, stale `laporta-di-roma-api` pkg name. |
| 02 | Database architecture | ☑ | Yes (DB-layer tests = No; live DB/query-plans = No) | Verified: 55 models / 25 enums across 13 schema files; full per-domain ERDs. pgvector `vector(1536)` + hand-built HNSW, generated `tsvector`+GIN hybrid search, IndexOutbox w/ backoff. Debt: `Language` enum single-value (i18n split dormant → root of TransformLanguagePipe issue), unused `TaskStatusType` enum, global name-unique on Project/SprintContent (latent bug), Reminder SPRINT/CUSTOM has no FK/cascade (orphans), redundant `Server @@index([id])` & `RefreshToken` unique, migration-history drift reconciled by `20260621000000_add_missing_schema_fields`, `Task` hours are Float. |
| 03 | Security/Auth/RBAC | ☑ | Yes (unit tests = Partial; runtime/pentest = No) | Verified: password login (email/phone)+bcrypt(cost 10), stateless JWT access + DB-stored refresh, 3-step reset. RBAC = static `PERMISSIONS_FOR_ROLE` map (31 UserType roles, ~120 perms) enforced by `HasPermissionGuard` on 139 routes/18 controllers; `*.own`/`*.any` resolved in services; `AgileOnlyGuard` gates AGILE routes. Gaps: access+refresh TTL both **1200d** & access non-revocable; `type` claim never checked → refresh usable as access; no throttling/lockout; 5-digit `Math.random` reset code; user enumeration; no ValidationPipe whitelist; open CORS; weak `SECRET_KEY` (.env gitignored, not committed); FE tokens in localStorage + SSR guard disabled. Dead code: `RolesGuard`/`@Roles`. OAuth/2FA = config/FE stubs only. |
| 04 | Users & Teams | ☑ | Yes (unit/e2e tests = No; live DB & injection fuzz = No) | Verified: 4-layer users+teams, 14 endpoints, two-tier authz (HasPermissionGuard + service-level `canRolesManageRoles`/`canUserManage{Users,Teams}`). Roles-as-rows (`@@unique[type,userId]`), `unaccentedName` search denorm, soft-delete (isActive=false). **Security bug: `deleteUserByAdmin` authorizes caller-vs-caller not the target (privilege escalation, e.g. HRManager can disable CEO)**. Debt: `$queryRawUnsafe` interpolated list query (mitigated only by DTO quote-escape+regex, not parameterized), no ValidationPipe whitelist → `image` mass-assignment, `SUM/AVG(DISTINCT)` aggregation bug, role filter `OR type IS NULL` leaks role-less users, `UserManager` model + `DeleteUserRepository.deleteUserById` dead (managers = `UserTeam.isManager`), team `@ValidateNested` w/o `@Type` (weak), FE CSV export commented out, FE/BE pw min mismatch (8 vs 7). No `BusinessUnit` enum exists. |
| 05 | Projects | ☑ | Yes (unit tests = Partial; e2e & live DB = No) | Verified: 17 endpoints, 4-layer w/ authz pushed into Prisma `where` (no raw SQL). Business-unit RBAC (CEO=global, CTO=TawerDev, CMO=TawerCreative, ProjectManagers scoped by membership+isManager; read perms in DEFAULT → all roles, data-scoped). Single-manager invariant + last-manager guards; email-bound single-use invite tokens (upsert re-invite). Real service unit tests (854 lines). **Bugs: list query never filters `isArchived` (archive only hidden client-side); per-member capacity is circular (utilization% identical for all members); invitation acceptance links to nonexistent `/projects/join` — no accept UI/service; member-update PATCH is destructive deleteMany+createMany (drops hourlyRate).** Debt: dup `getUpdate/DeletePermissionBusinessUnit`, `'user.name'` placeholder guard, global project-name unique via `@@unique([language,name])`, dormant `estimatedBudget`/`hourlyRate` fields, soft-cancel "delete" invitation. Correction: BusinessUnit enum DOES exist (dossier 04 wrong). |
| 06 | Agile backlog | ☑ | Yes (business-logic tests = No; upload internals & live DB = No) | Verified: 3 sub-modules (epics/sprints/milestones), 19 endpoints, 4-layer pattern each. Sprint FSM (Pending→Running→Stopped/Completed, single-running rule) shared BE validator↔FE card actions; server-side burndown/velocity/Gantt from Task.storyPoints. Epics/Sprints gated by AgileOnlyGuard; Milestones deliberately not (serve FREESTYLE too). Debt: **`SprintContent @@unique([language,name])` GLOBAL not project-scoped** (multi-tenant name collision, same class as Project 05), Gantt sprint rows lack name (P1-3), non-atomic sprint-create → orphaned attachment rows/files on partial failure, triplicated executive-RBAC helpers (manage-fallback role drifts: ScrumMaster vs ProductOwner), 4 dead sprint-repo methods, stale/failing burndown controller spec, milestone create skips project-window date check, `completeMilestone` non-idempotent, AgileOnlyGuard up to 6 sequential lookups/route. FE sprint-attachment upload path missing despite BE multipart support. |
| 07 | Tasks | ☑ | Yes (backend tests = No; live DB/races = No) | Verified: 35 endpoints (2 controllers), 11 models. Two-tier authz (HasPermissionGuard + project-scoped `can*` helpers) with executive BusinessUnit scoping (CEO=all, CTO=TawerDev, CMO=TawerCreative). Data-driven Kanban: `ProjectTaskStatus` + `allowedTransitions` + WIP limits + dependency-blocking + circular-dep DFS; lazy status seeding on read paths. All Prisma builder (no raw SQL); field-mapped repos neutralize the missing ValidationPipe whitelist. AI outbox producer (task/comment upsert+delete). Debt: `generateTaskKey`=`TASK-count+1` (racy + collides after deletes), dormant `TaskContent`/`Task.statusType`/`TaskStatusType` enum, `completedAt` only tracks literal 'DONE' & never cleared, orphaned attachment files on delete, `bulkUpdateStatus` skips WIP/blocked + weaker auth, `moveToSprint` force-resets status→TODO, transitions triplicated (seed/fallback/FE), FE hard-cap limit=100 + errors→[] + ignores custom status colors, dead `apps/tasks`+`kanban` template routes. Consistent w/ 05/06: BusinessUnit enum DOES exist (dossier 04 wrong). Zero backend tests; 11 FE property tests. |
| 08 | Personal Tasks | ☑ | Yes (unit/e2e tests = No; live DB/cron runtime = No) | Verified: 4-layer personal-tasks (UserTask/Content/Comment/Attachment), 7 `*.own` endpoints, per-user data scoping in repos, self-relation sub-tasks (Cascade), content-table i18n split (English-only, dormant), EVERY_MINUTE reminder cron w/ Postgres lock fanning out to push/mail/telegram/ntfy. FE lives in `src/modules/tasks/**` (no personal-tasks module), dnd reorder = N unbatched PATCH. **Security: comment-create has NO task-ownership check → cross-user comment IDOR (write)**. Debt: delete uses `deleteMany` so P2025→404 branch dead (returns 204 for missing/not-owned), sub-task attachment FILES orphaned on cascade delete, FE `search` param silently ignored (no DTO field), optimistic reorder never reverts on non-401 error, controller.spec references stale `TeamsController`, `parentTaskId` not ownership/loop-checked, unused Pagination types + unused service export. |
| 09 | Time & Attendance | ☑ | Yes (unit/e2e tests = No; live repro & injection fuzz = No) | Verified: WorkDay 1-N WorkSession (Cascade), business day anchored at 03:00 UTC via `createdAt`; 4-layer, 9 endpoints, `@Cron(3AM)` auto-close + 4-channel (mail/telegram/ntfy/push) late/forgotten nudges. **P1-1 CONFIRMED** (00:00–02:59 UTC check-in dead zone: `getStartOfBusinessDayUTC`=today 03:00 anchors the "today" window in the future → row created before it → `/current` 404-loops). More verified bugs: `PATCH :id/manager` passes `req.user.id` as workDayId → always 404 (dead endpoint); `PATCH :id/worker` never sets `userId` → any worker patches ANY WorkDay's mood/notes by id (IDOR write); `statistics/details/manager` overrides usersIds w/ caller's own id → returns own stats; `GET /work-days/manager` uses `read.own` perm + no mgmt scoping → leaks ALL users' workdays; cron has no distributed lock (double-run); `$queryRawUnsafe` interpolated stats query (mitigated by DTO validators only); email says 13:30 but code enforces 12:30 UTC; FE swallows all `/current` errors→null; mood `0` dropped as falsy; non-transactional get-or-create + no open-session unique constraint. Tests = skeleton `toBeDefined()` only. No `DeviceType` enum (only `WorkSessionDevice`). |
| 10 | Events & Calendar | ☑ | Yes (tests = No — stub specs only; runtime/DB-index = No) | Verified: 3 models (Event/EventContent/EventParticipant), 2 enums, 4 endpoints, custom calendar (@dnd-kit + date-fns — **FullCalendar deps in package.json are dead, imported nowhere**). Auth: all 4 event perms sit in DEFAULT_PERMISSIONS_FOR_ALL_ROLES → guard only asserts "authenticated"; real control is service-level owner/executive(CEO/CTO/CMO) check on update+delete only. **Bugs: (1) update overwrites `createdById` with editor (ownership hijack); (2) executive delete of non-owned event = silent 204 no-op (deleteMany filters createdById); (3) createEvent has NO gate on `toAllUsers` → any user can broadcast company-wide reminders (spam vector); FE role matrix (role-permissions.tsx) not enforced server-side.** Read is correctly scoped (own ∪ participant ∪ toAllUsers). Debt: Swagger `type` vs DTO `eventType`, dead `updateEventNotificationStatus`, dormant i18n content split (always English), hard-coded Africa/Tunis reminder tz, USER_NOT_FOUND msg on missing event, create-toast mislabel, empty catch in dnd, Zod doesn't require participants when !allUsers. Per-minute reminder cron w/ Postgres distributed lock + escalating thresholds (24h/2.5h/30m/15m). No recurrence.
| 11 | Reminders | ☑ | Yes (backend tests = No — zero specs; runtime/live recurrence = No) | Verified: Reminder/ReminderChannel (+3 enums), 7 endpoints (2 controllers: project-scoped CRUD + `/reminders/me` & dismiss), 4-layer, all Prisma builder (no raw SQL), field-mapped repos. Two-tier authz (HasPermissionGuard + service BU-scoped executive/membership `canAccess/canManageProject`); dismiss ownership-enforced. 4 locked crons (pending EVERY_MINUTE, recurring EVERY_HOUR, overdue EVERY_HOUR, stuck /6h) → 4-channel fan-out (mail/push/telegram/ntfy) respecting user settings. **Bugs: (1) recurrence effectively DEAD — every-minute pending cron marks recurring reminders SENT before the hourly recurring cron can re-fire them, never reset to PENDING; (2) `FAILED` status never written (channel failures logged, reminder still SENT); (3) `taskId`/`milestoneId` FKs (onDelete Cascade) NEVER populated → deleting a task/milestone orphans its PENDING reminders (only sprints manually CANCEL theirs); (4) auto-reminders target the CREATOR not the assignee; (5) `IN_APP` switch branch not in ChannelType enum (dead); (6) API allows channel-less reminder that "sends" nothing.** Security gaps: create doesn't validate `dto.userId` is a project member (spam vector) nor `entityId` project ownership; `ProductOwner` manage is un-scoped (any project). FE UI lives in projects module (`project-detail/reminders/**`); no FE client for `/reminders/me` or dismiss. FE tests = 2 fast-check schema suites; zero backend specs. `recurrenceRule` = brittle 3-prefix string match, not a real cron parser. |
| 12 | Notifications | ☑ | Yes (backend/channel unit tests = No — skeleton `toBeDefined` only, service.spec fails DI; live delivery = No) | Verified: 7 models + `DeviceType`/`ChannelType` enums; NotificationsModule owns only **in-app + FCM push** (imports Firebase only, NOT telegram/ntfy/mail). 6 endpoints, 4-layer, all Prisma builder (no raw SQL), ownership-scoped read/update/delete. `createNotificationFromSystem` is the shared in-app/push sink for 7 modules; the 4-channel fan-out (push/email/telegram/ntfy) is **decentralized & duplicated in every consumer** (no central dispatcher), gating each channel on `UserNotificationSettings` booleans. **Bugs: (1) ntfy effectively DEAD — UI tells user to use `user.id` as topic but nothing ever writes the topic (only `data.ntfyTopic`, never sent by settings upload) → `sendNtfyMessage` early-returns on null topic; (2) in-app inbox coupled to `pushNotificationsEnabled` (disable push → lose notification history); (3) `notification.create` in DEFAULT_PERMISSIONS_FOR_ALL_ROLES → ANY role can `sendToAllUsers` (company-wide spam); (4) `updateNotificationForUser` P2025→404 branch dead (wraps `updateMany`, silently 204s foreign ids).** Debt: MailService re-throws while telegram/ntfy/firebase swallow (inconsistent contract), hard-coded FCM config in `firebase-messaging-sw.js` (dup of env-driven `lib/firebase.ts`), dormant `NotificationContent` i18n (English-only), shared `TELEGRAM_BOT_TOKEN`+per-user chatId, pagination limit not floored at 1, filename typo `update-notification.repositoty.ts`, empty `notifications/page.tsx` (bell "view all" links to a blank route; real list at `/notifications/view`). |
| 13 | Infrastructure Monitoring | ☑ | Yes (backend/FE tests = No — stubs only; live DB/cron/ping+http runtime = No) | Verified: 5 models (Server/Service/ServerNotification/ServiceNotification/UserServerManagement) + `ServerServiceStatus` enum; 10 infra endpoints + public `GET /health`; 4-layer w/ verb-split repos, all Prisma builder. Two-tier authz (HasPermissionGuard + service `isCTO`/`getCTOOrCEO`): CTO=global write, DevopsEngineer=manager-scoped (no SERVICE_CREATE), CEO=read-only, others none. 6 lock-guarded EVERY_MINUTE crons: ICMP-ping servers + HTTP-probe services → outbox `*Notification{isSent}` → 4-channel fan-out (telegram/ntfy/mail/push) reusing user NotificationSettings; expiry escalation bands seed `nextNotificationAt`. **Bugs: (B1) non-CTO service update/delete builds `managers.some` on Service (no such relation) → 500 for DevopsEngineer; (B2) `checkHttp` axios.get on schemeless `domain` (seed=`api.tawer.tn`) throws → every service reported down; (B3) non-CTO createService branch dead (only CTO holds SERVICE_CREATE); (B4) alert spam, no ack/cooldown; FE role-permissions grants CEO/customerSupport infra access the API denies (403).** Debt: status is a manual label not live health, NO `lastHealthCheck`/uptime persisted, ~120 duplicated cron lines (server vs service band already drifted), `getRunning*Expiration` mis-named (no status filter), fan-out not awaited + `isSent` flipped even on channel failure, hard deletes cascade, redundant `Server @@index([id])`, dead `UpdateServiceDto.managers`, broken controller spec imports non-existent `UsersController`. `HealthController` is API liveness only (not infra monitoring). |
| 14 | AI Copilot | ☑ | Yes (unit/e2e tests = No — zero specs; live Gemini/DB & QA-eval numbers = No) | Verified: RAG subsystem — 3 tables (DocumentEmbedding pgvector(1536)+HNSW, generated tsvector+GIN; IndexOutbox; CopilotQueryLog), 5 endpoints, 9 services + 2 raw-SQL repos + 1min/3AM sweeper cron (Postgres lock). Gemini embed (Matryoshka 1536, L2-norm, sha256 hash-skip) → outbox write-path seam (fire-and-forget) → hybrid vector+lexical retrieval fused by RRF (k=60) + optional flash-lite reranker → grounded gemini-2.5-flash answer (system/user split for injection safety) w/ `[n]` citations, cosine confidence gate (0.5) → honest refusal; SSE streaming variant. Estimation = k-NN over DONE tasks (actualHours), similarity-weighted median + size-aware hours-per-point (10–90 band). Permission scoping enforced IN SQL (`projectId=ANY(allowed)`, CEO/CTO/CMO/member rules) — structurally leak-proof at project boundary. Substantial offline eval harness (retrieval/qa/estimation gold sets 12/10/10 + LLM faithfulness judge + ablations). **Bugs/debt: comment edit/delete NOT enqueued on write path → deleted comments stay retrievable+citable up to 24h until nightly reconcile (breaks "never cite what doesn't exist"); confidence gate is cosine-only so bare-keyword queries get refused despite the lexical arm nailing them (copilot answer path doesn't inherit hybrid's keyword win); cancelled SSE streams unlogged (telemetry skew); prompt truncates sources 1200<2000 chunk; reranker scores omitted candidates as 0; GEMINI_CLIENT may be null on missing key (runtime NPE not fail-fast); reindexAll/reconcile load whole tables in memory; CopilotQueryLog stores plaintext question+answer, no retention; askCopilot FE client dead vs stream; ZERO AI tests.** Reported M5 eval (cited from docs/ai-hybrid-rerank-eval.md, not re-run): keyword MRR 0.57→1.00 R@1 0.30→1.00 hybrid; semantic saturated/tie. Access is project-level not per-entity. |
| 15 | Frontend architecture | ☑ | Yes (shared-layer unit tests = No; runtime = No) | Verified: Next 16 App Router, `[locale]` + `(guest)`/`dashboard/(auth)` route groups (34 pages/5 layouts); provider tree ThemeProvider→NextIntl→ReactQuery→ActiveTheme; single QueryClient w/ global refetchInterval 600s + focus-refetch; server-state=React Query, UI-state=Zustand; API layer = thin axios wrappers (`lib/http-methods`, **no interceptor**) so Bearer header + 401→`/tokens/refresh` retry is duplicated across ~60 services; JWTs in localStorage; **auth gate is client-only** (`(auth)` layout `useUser`→`/users/me`→push `/login`); client RBAC (`hasPermissions`) is cosmetic nav-gating; canonical module pattern = components/hooks/services/store/types/validation w/ Zod schema factories `getXSchema({t})`. **Correction to 00: `proxy.ts` is NOT dead** — Next 16 renamed middleware→proxy (`PROXY_FILENAME='proxy'`), it runs next-intl; only its auth branch is commented out. Debt: no interceptor (60× dup), localStorage tokens + no SSR gate, `getBackendLocale` handles en/ar not the app's `fr` (→defaults en), `lib/localstorage.getItem` missing `return`, next.config hard-codes env + missing `NEXT_PUBLIC_FIREBASE_VAPID_KEY`/`GA_KEY` (push+GA silently off), `<html lang="en">` hardcoded, `error.tsx` export mis-named `NotFoundPage`, e2e auth spec asserts vacuously (`if(isVisible)`), zero shared-layer unit tests. |
| 16 | Deployment & DevOps | ☑ | Yes (real image build/run = No; prod target = None) | Verified: no CI/CD (no .github/.gitlab/Jenkins). `docker-compose.yml` provisions INFRA ONLY (postgres pgvector:pg15 + redis:alpine + mailpit) reusing an **external pgdata volume w/ hard-coded hash name** (non-portable); app Dockerfiles exist but are **not orchestrated** — apps run on host via `.claude/launch.json` (BE 3001, FE 3000). Schema self-provisions via `migrate deploy` on BE container start (28 migrations); seed is manual. Static uploads → `./static/{images,attachments}` local FS (no volume → lost on redeploy), served at `/static` (ServeStatic root resolves via `dist/src`, correct). `/health` shallow+unauth, not wired to any healthcheck (only postgres has one). **Debt: no `.dockerignore` (both) → `.env`+secrets(SECRET_KEY/GEMINI/OPENROUTER) baked into BE image; FE `next.config.ts` (committed) hard-codes `BACKEND_ADDRESS=localhost:3001` + Firebase keys → not deployable off-localhost; FE Dockerfile `node:latest`+`npm install --force` no lockfile, no multistage; BE runs `nest start` not `start:prod`; PORT=3001 vs EXPOSE 3000 mismatch; `.env` API/FRONTEND_ADDRESS both :3000 (wrong) + malformed GOOGLE_* stubs; dead `IMAGES_STORAGE_PATH`; self-dep `laporta-di-roma-api:file:` + stray `install`/`i` deps; stale `La Porta di Roma` branding; redis provisioned but wiring dead (dossier 01).** |
| 17 | Report assembly | ☑ | N/A (assembly-only) | Assembled `docs/pfe-report.md` (English, Markdown, embedded Mermaid) from dossiers 00–16 only. 11 chapters: intro/problématique, tech study, methodology, global architecture, detailed conception (DB + 11 modules, diagrams reused), security (login/RBAC seqs + S1–S13 gap table), réalisation, tests & quality, results (AI eval numbers), limitations & future work, conclusion. Gaps left as `[TO PROVIDE]` placeholders per user decision: state-of-the-art/competitor analysis, UI screenshots, host-org context & dev methodology. |
