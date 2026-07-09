# PFE Report — Sprint-Structured Assembly Plan

**Goal.** Produce a jury-ready PFE report (English) organized as a **Scrum narrative**: 4 chapters, the
development work told **sprint by sprint**, with the AI sprint as its own final chapter. The report is
assembled **only** from the verified dossiers (`docs/dossiers/00–16`) and the reference synthesis
(`docs/pfe-report-reference.md`) — not by re-reading source code.

**How to use this file.**
- Each task is written in its **own fresh session**. Open a session and prompt:
  *"read the planning file `docs/pfe-report-plan.md`, you're responsible of `task_XX`"*.
- The session reads **§A (shared preamble)** + its **task block in §D** + the relevant rows of **§B/§C**,
  then produces its section and appends it to `docs/pfe-report.md`.
- Do the tasks **in order** (`task_01 → task_09`). Later tasks depend on earlier ones (the backlog from
  `task_02`, the cumulative class diagram from the previous sprint).
- After each task, update the **§E progress tracker** here and the **Placeholder Register** in the report.

**Output file.** `docs/pfe-report.md` (created by `task_01`). The old module-organized report is preserved
as `docs/pfe-report-reference.md` (source material, not a deliverable).

**Project.** Full-stack management platform "Tawer MNG". Backend `tdg-management-api-backend` (NestJS 11 /
Prisma 7 / PostgreSQL+pgvector / Redis). Frontend `tawer-management-frontend` (Next.js 16 / React 19 /
TanStack Query / Zustand / RHF+Zod). 146 endpoints, 20 controllers, 55 Prisma models, 25 enums.

---

## §A — SHARED PREAMBLE (apply at the top of EVERY task session)

```
ROLE: You are drafting ONE section of my PFE report. The report is a Scrum-structured, English-language
academic document. Write precisely and densely; no marketing fluff.

SOURCES (hard rule):
1. Build ONLY from the verified dossiers in docs/dossiers/*.md and the reference synthesis
   docs/pfe-report-reference.md. These already cite the code at file:line — do NOT re-read source code.
2. If a fact needed for the report is not in a dossier/reference, DO NOT invent it. Insert a placeholder
   (see markers below) and add it to the Placeholder Register at the top of docs/pfe-report.md.
3. Reuse the dossiers' Mermaid diagrams verbatim where a sequence/state diagram is needed.

DIAGRAM CONVENTIONS (PlantUML — authored as ```plantuml fenced blocks; rendered to SVG/PNG at assembly):
- ALL report diagrams use PlantUML for a consistent, print-quality UML look. Begin EVERY diagram with the
  shared theme header in §G (copy it verbatim after `@startuml`) so every figure looks uniform.
- The dossiers hold these diagrams as Mermaid — convert them 1:1 to PlantUML (identical semantics).
- Give every diagram a caption line immediately under it: `*Figure N.M — <title>*` (chapter.figure).
- USE-CASE: `left to right direction`, `actor "Role" as R`, a `rectangle "Tawer MNG" { usecase "..." as UC }`
  system boundary, and `R --> UC` edges. One per sprint (aggregates that sprint's features); actors are the
  RBAC roles from D03/D04. Add `<<include>>`/`<<extend>>` where a dossier shows a real dependency.
- CLASS DIAGRAM (UML): proper classes with typed attributes and `+`/`-` visibility, relations with
  multiplicities and role labels, and enums as `enum` blocks. Convert the dossier `erDiagram` slice.
  Keep it CUMULATIVE: before drafting, read the previous sprint's cumulative class diagram already in
  docs/pfe-report.md and EXTEND it — show all prior classes plus this sprint's, and highlight the newly-
  added classes with `#LightYellow` background (or a `<<new>>` stereotype). During a multi-module sprint:
  one class slice per module, then ONE cumulative class diagram at the sprint's end.
- SEQUENCE: PlantUML `participant`/`->`/`activate` — convert the dossier's Mermaid sequence.
- STATE MACHINE: PlantUML `state` diagram (sprint lifecycle, kanban transitions).
- COMPONENT/DEPLOYMENT (architecture overview in Ch.2): PlantUML `component`/`node` diagrams.
- RENDERING: leave the ```plantuml blocks in the markdown; task_09 renders them (`plantuml -tsvg` or the
  PlantUML server / VS Code PlantUML extension) and the figures embed as SVG/PNG in the Word export.

MODULE-GRANULAR SPRINTS: a sprint may span several modules. Structure a multi-module sprint as:
  sprint intro (goal + sprint backlog table + ONE sprint use-case diagram)
  → per-module conception blocks (textual description + as many sequence diagrams as scenarios need +
    that module's UML class slice)
  → sprint réalisation (screenshots) → sprint tests de validation → sprint review/conclusion
  → ONE cumulative class diagram (system so far).

PLACEHOLDER MARKERS (always add to the Register at the top of the report):
- [SCREENSHOT: <exactly what to capture>]         → a UI screenshot the user will supply
- [TO PROVIDE: <what + why>]                       → external info not in any dossier (org, existant, dates)
- [CONFIRM: <assumption>]                          → a business assumption to verify

HONESTY:
- The backlog/story-points are a reconstruction (no real sprint history) — present as a logical iterative
  decomposition, use story points not dates, keep them plausible.
- Do NOT overclaim testing. "Tests de validation" = acceptance scenarios (Given/When/Then per user story).
  Show real automated tests ONLY where a dossier confirms them: Projects unit tests (D05 §11) and the AI
  eval harness/metrics (D14 §11). Everywhere else, state coverage honestly.

VOICE & TONE (write like a real engineer explaining their work — natural, not AI-generated):
- First person plural for choices and design ("we structured…", "we chose…"); past tense for delivered work.
  The reader is a knowledgeable jury, not a customer — confident and precise, never a brochure.
- Vary sentence length and rhythm. Mix short, direct sentences with longer explanatory ones. Do NOT write
  paragraph after paragraph with the same cadence, and do NOT turn everything into bullet lists — use prose
  for reasoning and reserve bullets for genuine enumerations (endpoints, steps, acceptance criteria).
- Explain the WHY of each decision in plain language, then the WHAT. Prefer a concrete example over an
  abstract claim.
- Formal register (academic report): avoid contractions and slang, but avoid stiff robotic scaffolding too.
- BAN AI-tells and filler: no "In today's fast-paced world", "It is worth noting/important to note",
  "Furthermore/Moreover/Additionally" as paragraph glue, no "delve/leverage/seamless/robust/cutting-edge/
  game-changer/holistic", no hedging pile-ups ("could potentially perhaps"). Don't overuse em-dashes or the
  "not X, but Y" construction. Don't start consecutive sentences the same way.
- Keep transitions meaningful (because/so that/which means…), not decorative.

OUTPUT:
- Append your section to docs/pfe-report.md in the correct chapter position; do not alter other sections.
- Every non-trivial technical claim keeps a dossier trace, e.g. "(D07 §4.1)".
- When done: update §E tracker in docs/pfe-report-plan.md and the Placeholder Register in the report.
```

---

## §B — REPORT BLUEPRINT (target structure)

```
Front matter (task_09): title page, résumé/abstract (EN), TOC, list of figures/tables, acronyms.
Placeholder Register (task_01 creates; every task appends): a checklist of all [SCREENSHOT]/[TO PROVIDE]/[CONFIRM].

Chapter 1 — Context & Problem statement            (task_01)
Chapter 2 — Methodology, Backlog & Architecture    (task_02)
Chapter 3 — Development sprints (the platform)      (task_03..task_07)
    Sprint 1 — Foundations & Authentication
    Sprint 2 — Projects & Membership
    Sprint 3 — Agile Backlog & Tasks
    Sprint 4 — Productivity Suite
    Sprint 5 — Communication & Operations
Chapter 4 — Sprint 6: AI Copilot & Estimation (RAG)(task_08)
Conclusion & perspectives                          (task_09)
```

Chapter 3 holds five development sprints; Chapter 4 is the AI sprint on its own (the technical climax).

---

## §C — SPRINT → MODULE → DOSSIER MAP

| Sprint | Chapter | Modules | Primary dossiers | Reference report §§ |
|---|---|---|---|---|
| **S1 Foundations & Auth** | 3 | architecture/DB foundation, auth/JWT/RBAC, users, teams | D00, D01, D02, D03, D04 | 4, 5.0, 5.1, 6 |
| **S2 Projects & Membership** | 3 | projects, members, invitations | D05 | 5.2 |
| **S3 Agile Backlog & Tasks** | 3 | epics/sprints/milestones, tasks/kanban | D06, D07 | 5.3, 5.4 |
| **S4 Productivity Suite** | 3 | personal tasks, time & attendance, events, reminders | D08, D09, D10, D11 | 5.5, 5.6, 5.7, 5.8 |
| **S5 Communication & Ops** | 3 | notifications, infrastructure monitoring | D12, D13 | 5.9, 5.10 |
| **S6 AI Copilot & Estimation** | 4 | AI RAG copilot + estimation | D14 | 5.11, 9.2 |
| Cross-cutting (Ch.2) | 2 | global architecture, frontend arch, devops | D00, D01, D02, D15, D16 | 4, 5.0 |

---

## §D — TASK BLOCKS (one per session)

### task_01 — Chapter 1: Context & Problem statement
```
DEPENDS ON: none (creates the report file).
READ: docs/pfe-report-reference.md §Front matter + Ch.1; dossiers D00 §1–2, D02 §2, D16 §2 (env/context).
FIRST: create docs/pfe-report.md starting with (a) a "Placeholder Register" section (empty checklist),
  then (b) Chapter 1. (Front matter/TOC are added later by task_09.)
PRODUCE (Chapter 1):
  1.1 Host organization & internship context — mostly [TO PROVIDE].
  1.2 Business context (dossier-backed): Tawer digital agency, two business units TawerDev/TawerCreative,
      encoded as BusinessUnit/ProjectType enums (D02 §2).
  1.3 Problématique — fragmented tooling; one consolidated platform for ~31 roles over ~146 endpoints.
  1.4 Étude de l'existant — competitor comparison (Jira/Asana/ClickUp/Linear). [TO PROVIDE] — external.
  1.5 Solution proposée & objectives — the 4 objectives (D00 §2; reference report Ch.1 §1.3).
  1.6 Expected outcomes.
DIAGRAMS: none required (optional: a high-level context diagram from D00 §8.1 if useful).
PLACEHOLDERS: [TO PROVIDE: company presentation/org chart], [TO PROVIDE: internship framing/dates],
  [TO PROVIDE: competitor/état-de-l'art analysis].
DONE WHEN: report file exists with Register + Chapter 1; placeholders registered; tracker updated.
```

### task_02 — Chapter 2: Methodology, Backlog & Architecture
```
DEPENDS ON: task_01.
READ: reference report Ch.4 (global architecture), §5.0 (DB), §8.3 (quality); dossiers D00, D01, D02,
  D15 (frontend arch), D16 (devops).
PRODUCE (Chapter 2):
  2.1 Scrum methodology — roles, ceremonies, artifacts; justify Scrum; note CRISP-DM only as the AI
      sub-process (used inside Sprint 6). [CONFIRM: team size / role you played].
  2.2 PRODUCT BACKLOG — the master table of user stories with IDs and story points, grouped by the six
      sprints in §C. THIS IS THE ANCHOR every sprint task reuses. Format:
      | US-ID | As a <role>, I want <goal>, so that <value> | Sprint | Story pts | Priority |
      Derive stories from each module's endpoints/features in the dossiers. Keep US-IDs stable
      (e.g. US-S1-01…). Include a per-sprint SP subtotal + a burndown-of-the-project overview.
  2.3 Sprint plan overview — the 6 sprints, their goals, and the module→sprint map (from §C).
  2.4 Global software architecture — two-app model, layered backend (controller→service→repo→dto),
      request lifecycle, frontend architecture, deployment topology. Reuse diagrams:
        - system component/deployment (D00 §8.1 / ref §4.1)
        - request-lifecycle sequence (D00 §8.2 / ref §4.3)
        - layered-architecture (D01 §8.1 / ref §4.2)
        - client-side auth gate (D15 §8.3 / ref §4.4)
        - deployment topology (D16 §8 / ref §4.5)
  2.5 Tech stack & tools — the two stack tables (ref Ch.2) + why (stateless API, Prisma+Zod type-safety,
      pgvector for one-datastore RAG). Introduce RAG at a high level (details deferred to Ch.4).
  2.6 Development environment & conventions — docker-compose infra, migrations, the 4-layer convention.
DIAGRAMS (PlantUML): the 5 architecture diagrams above (converted to PlantUML component/deployment/
  sequence). PLUS two required "stunning" figures:
    - GLOBAL USE-CASE diagram — all major actors (31 roles collapsed into the ~6 archetypes: Executive,
      Project Manager, Scrum Master/PO, Member/Dev, DevOps, HR/Admin) × the platform's headline features.
      This opens the sprint chapters and shows scope at a glance.
    - PROJECT ROADMAP — a PlantUML Gantt (or a simple sprint-timeline) of the 6 sprints with their goals
      and story-point loads (a PLAN, not measured velocity — safe to show).
PLACEHOLDERS: [CONFIRM: story-point values], [CONFIRM: team/roles].
DONE WHEN: backlog table complete & self-consistent; architecture diagrams embedded; tracker updated.
```

### task_03 — Chapter 3 / Sprint 1: Foundations & Authentication
```
DEPENDS ON: task_02 (reads the S1 backlog slice).
READ: dossiers D00, D01, D02 (DB foundation + Identity/Auth ERD §8.2), D03 (security/auth/RBAC), D04
  (users & teams); reference report §5.0, §5.1, §6.
MODULES: architecture/DB foundation · authentication/JWT/RBAC · users · teams.
PRODUCE:
  - Sprint goal + Sprint 1 backlog table (from task_02).
  - Sprint use-case diagram (actors: Visitor, User, Executive/HR, Admin; use cases: register, login,
    reset password, manage users, manage teams, assign roles).
  - Module block A — Auth & RBAC: description; sequence diagrams: LOGIN (D03 §8) and PROTECTED-REQUEST/
    RBAC (D03 §8); UML class slice: User, Role, RefreshToken, ResetPasswordCode (from D02 §8.2 / D03 §3).
  - Module block B — Users & Teams: description; sequence diagram: CREATE-USER-BY-ADMIN (D04 §8.2);
    UML class slice: User(extended), Team, UserTeam, UserManager (D04 §8.1).
  - Réalisation: bullet endpoints/screens; [SCREENSHOT: login page], [SCREENSHOT: register page],
    [SCREENSHOT: users list with filters], [SCREENSHOT: create/edit user dialog], [SCREENSHOT: teams view].
  - Tests de validation: acceptance table for the S1 user stories.
  - Sprint review/conclusion.
  - CUMULATIVE class diagram #1 (all classes so far = this sprint's classes; mark them NEW).
DONE WHEN: all diagrams present; screenshots registered; tracker updated.
```

### task_04 — Chapter 3 / Sprint 2: Projects & Membership
```
DEPENDS ON: task_03 (reads Sprint 1 cumulative class diagram to extend it).
READ: dossier D05; reference report §5.2.
MODULES: projects · membership · invitations.
PRODUCE:
  - Sprint goal + Sprint 2 backlog table.
  - Sprint use-case diagram (actors: Executive CEO/CTO/CMO, Project Manager, Member; use cases: create/
    archive project, manage members, invite by email, accept invite, set kanban WIP).
  - Conception: description (business-unit scoping, single-manager invariant, email-token invites);
    sequence diagrams: CREATE-PROJECT (D05 §8.2) and SMART-ADD-MEMBER/INVITE (D05 §8.3); UML class slice:
    Project, ProjectContent, ProjectMember, ProjectInvitation (D05 §8.1).
  - Réalisation: [SCREENSHOT: projects list/board], [SCREENSHOT: create-project sheet],
    [SCREENSHOT: members tab], [SCREENSHOT: invite-by-email dialog].
  - Tests: acceptance table; NOTE the real unit tests exist here (D05 §11) — cite them as genuine coverage.
  - Sprint review (flag verified gaps: no accept-invite UI, archived not server-filtered — D05 §13).
  - CUMULATIVE class diagram #2 (Sprint 1 classes + Project family).
DONE WHEN: diagrams + screenshots registered; tracker updated.
```

### task_05 — Chapter 3 / Sprint 3: Agile Backlog & Tasks (LARGE)
```
DEPENDS ON: task_04.
READ: dossiers D06 (epics/sprints/milestones), D07 (tasks/kanban); reference report §5.3, §5.4.
MODULES: agile backlog (epics/sprints/milestones) · tasks + data-driven kanban. This is the depth sprint —
  use MULTIPLE sequence diagrams and TWO module class slices.
PRODUCE:
  - Sprint goal + Sprint 3 backlog table.
  - Sprint use-case diagram (actors: PM, Product Owner, Scrum Master, Assignee/Dev; use cases: manage
    backlog, plan sprint, run sprint lifecycle, kanban move, dependencies, log time, comment/mention).
  - Module block A — Agile: description; sequence diagram CREATE-SPRINT (D06 §8.3); state diagram SPRINT
    LIFECYCLE (D06 §8.1); UML class slice: Epic, Sprint, SprintContent, SprintAttachment, Milestone (D06 §8.2).
  - Module block B — Tasks/Kanban: description; sequence diagrams CREATE-TASK (D07 §8.2) and MOVE-TASK-IN-
    KANBAN (D07 §8.3); state diagram STATUS TRANSITIONS (D07 §8.4); UML class slice: Task, ProjectTaskStatus,
    TaskComment, TaskCommentLike/Mention, TaskLabel, TaskLabelAssignment, TaskDependency, TaskTimeEntry,
    TaskAttachment (D07 §8.1).
  - Réalisation: [SCREENSHOT: backlog view], [SCREENSHOT: kanban board], [SCREENSHOT: task detail sheet],
    [SCREENSHOT: sprint board], [SCREENSHOT: burndown chart], [SCREENSHOT: velocity chart], [SCREENSHOT: gantt].
  - Tests: acceptance table (note zero backend tests for tasks — D07 §11 — honestly; FE property tests exist).
  - Sprint review.
  - CUMULATIVE class diagram #3 (previous + agile + tasks families) — this will be the largest so far;
    keep it legible (group by package if needed).
DONE WHEN: all diagrams (2 state + ≥4 sequence + 2 slices + cumulative + use-case) present; tracker updated.
```

### task_06 — Chapter 3 / Sprint 4: Productivity Suite (LARGE)
```
DEPENDS ON: task_05.
READ: dossiers D08 (personal tasks), D09 (time & attendance), D10 (events), D11 (reminders);
  reference report §5.5, §5.6, §5.7, §5.8.
MODULES: personal to-dos · time & attendance · events/calendar · reminders (4 module blocks).
PRODUCE:
  - Sprint goal + Sprint 4 backlog table.
  - Sprint use-case diagram (actors: User, Manager; use cases: manage personal tasks, check-in/out,
    manage calendar events, schedule reminders).
  - Module block A — Personal tasks: description; sequence diagram REMINDER-CRON-FANOUT (D08 §8.3);
    UML class slice: UserTask, UserTaskContent, UserTaskComment, UserTaskAttachment (D08 §8.1).
  - Module block B — Time & Attendance: description; sequence diagram CHECK-IN (with the dead-zone branch)
    (D09 §8.2); UML class slice: WorkDay, WorkSession (D09 §8.1).
  - Module block C — Events/Calendar: description; sequence diagram REMINDER-CRON (D10 §8.3); UML class
    slice: Event, EventContent, EventParticipant (D10 §8.1).
  - Module block D — Reminders: description; sequence diagram PENDING-REMINDER-FIRES (D11 §8); UML class
    slice: Reminder, ReminderChannel (D11 §8).
  - Réalisation: [SCREENSHOT: to-do list], [SCREENSHOT: check-in gate], [SCREENSHOT: calendar month view],
    [SCREENSHOT: reminders UI].
  - Tests: acceptance table (note near-zero backend tests — honestly).
  - Sprint review (flag verified bugs: P1-1 check-in dead zone D09 §13; recurrence dead D11 §13).
  - CUMULATIVE class diagram #4.
DONE WHEN: 4 module blocks, 4 sequence diagrams, 4 class slices, use-case, cumulative diagram; tracker updated.
```

### task_07 — Chapter 3 / Sprint 5: Communication & Operations
```
DEPENDS ON: task_06.
READ: dossiers D12 (notifications), D13 (infrastructure monitoring); reference report §5.9, §5.10.
MODULES: multi-channel notifications · infrastructure monitoring (2 module blocks).
PRODUCE:
  - Sprint goal + Sprint 5 backlog table.
  - Sprint use-case diagram (actors: User, CTO, DevopsEngineer; use cases: configure channels, receive
    notifications, register servers/services, monitor health, receive alerts).
  - Module block A — Notifications: description (decentralized 4-channel fan-out, no central dispatcher);
    component diagram DELIVERY PIPELINE (D12 §8.1) + sequence ONE-NOTIFICATION-ACROSS-CHANNELS (D12 §8.2);
    UML class slice: Notification, NotificationContent, UserNotification, NotificationToken,
    UserNotificationSettings, UserTelegramBot, UserNtfyIntegration (D12 §8.3).
  - Module block B — Infra monitoring: description; sequence HEALTH-CHECK-CYCLE (D13 §8.1) + component
    ALERT FAN-OUT (D13 §8.3); UML class slice: Server, Service, ServerNotification, ServiceNotification,
    UserServerManagement (D13 §8.2).
  - Réalisation: [SCREENSHOT: notification bell/list], [SCREENSHOT: notification settings/channels],
    [SCREENSHOT: infrastructure servers dashboard], [SCREENSHOT: services view].
  - Tests: acceptance table (honest coverage note).
  - Sprint review (flag: ntfy dead D12 §13; checkHttp schemeless-domain bug D13 §13).
  - CUMULATIVE class diagram #5.
DONE WHEN: 2 module blocks, sequences + components, class slices, use-case, cumulative diagram; tracker updated.
```

### task_08 — Chapter 4 / Sprint 6: AI Copilot & Estimation (RAG)
```
DEPENDS ON: task_07 (extends the final cumulative class diagram).
READ: dossier D14 (whole); reference report §5.11, §9.2; docs/ai-hybrid-rerank-eval.md (metrics, cite only).
This is a FULL CHAPTER — go deep; it is the differentiator.
PRODUCE (Chapter 4):
  4.1 Sprint goal & why AI/RAG (the reference-class + grounded-answer rationale, honesty-over-coverage).
  4.2 Sprint 6 backlog (ask copilot, stream answer, cite sources, estimate task effort, admin reindex).
  4.3 Use-case diagram (actor: User; use cases: ask copilot, view citations, estimate task; admin: reindex,
      view telemetry).
  4.4 Methodology note — CRISP-DM-style framing for the AI sub-process (data understanding = corpus,
      modeling = embeddings/retrieval/rerank, evaluation = harness).
  4.5 RAG architecture — the pipeline (embeddings → outbox seam → sweeper → hybrid retrieval + RRF →
      reranker → grounded answer + citations + confidence gate); estimation (k-NN + size-aware band).
      Diagrams: INDEX-A-TASK sequence (D14 §8.1), COPILOT-QUERY sequence (D14 §8.2), UML class slice
      DocumentEmbedding/IndexOutbox/CopilotQueryLog (D14 §8.3).
  4.6 Security posture (retrieval scoping enforced in SQL — D14 §9).
  4.7 Réalisation — [SCREENSHOT: copilot panel streaming answer with citation chips],
      [SCREENSHOT: citation chip deep-link], [SCREENSHOT: task estimate suggestion in the create form].
  4.8 Evaluation & metrics — the harness (retrieval/QA/estimation gold sets, faithfulness judge) and the
      reported numbers: keyword MRR 0.57→1.00, R@1 0.30→1.00; semantic saturated; 0 cross-role leakage.
      Present as a metrics table with the quota caveat. [CONFIRM: re-run QA/faithfulness numbers if quota allows].
  4.9 Challenges & decisions (Matryoshka 1536, RRF k=60, cosine gate, why Gemini).
  4.10 Sprint review (verified gaps: deleted-comment freshness, cosine-only gate — D14 §13).
  - FINAL CUMULATIVE class diagram (whole system, AI package added).
DONE WHEN: full AI chapter with 2 sequences + class slice + use-case + metrics table + final cumulative diagram.
```

### task_09 — Front matter, Conclusion & Final Assembly
```
DEPENDS ON: task_01..task_08.
READ: the whole docs/pfe-report.md (for the TOC/lists/conclusion); reference report Ch.11.
PRODUCE:
  - Front matter inserted at the TOP: title page fields ([TO PROVIDE] author/institution/supervisors/year),
    Remerciements ([TO PROVIDE]), Résumé + Abstract (EN, dossier-backed), Table of contents, List of
    figures, List of tables, Acronyms/glossary.
  - Conclusion générale & perspectives — synthesis of value (breadth/depth/process) + the prioritized
    future work (reference report Ch.10.6, Ch.11).
  - Finalize the Placeholder Register: consolidate every [SCREENSHOT]/[TO PROVIDE]/[CONFIRM] into one
    checklist so the user sees exactly what remains.
  - Consistency pass: US-IDs match Chapter 2; each cumulative class diagram supersedes the previous; figure
    numbering coherent.
DONE WHEN: report opens with front matter, closes with conclusion, Register complete; tracker marked done.
```

---

## §E — PROGRESS TRACKER (update after each task)

| Task | Section | Status | Notes |
|---|---|---|---|
| task_01 | Ch.1 Context & Problem | ☑ | done — docs/pfe-report.md created with Register + Ch.1 (§1.1–1.6, Fig 1.1 context); 4 placeholders registered (P-01..P-04) |
| task_02 | Ch.2 Methodology, Backlog, Architecture | ☑ | done — Ch.2 appended (§2.1–2.6). Master backlog: 6 sprints, US-S1..S6, **252 SP** (S1 41 / S2 26 / S3 64 / S4 44 / S5 35 / S6 42) + planned burndown. 7 PlantUML figs (2.1 global use-case, 2.2 roadmap gantt, 2.3 component, 2.4 layered, 2.5 request seq, 2.6 auth gate, 2.7 deployment). Placeholders P-05 (team/roles), P-06 (story points) registered |
| task_03 | Ch.3 / Sprint 1 Foundations & Auth | ☑ | done — Ch.3 intro + §3.1 Sprint 1 appended. 7 PlantUML figs (3.1 sprint use-case; 3.2 login seq; 3.3 protected-request/RBAC seq; 3.4 auth class slice; 3.5 create-user-by-admin seq; 3.6 users/teams class slice; 3.7 cumulative class diagram #1 — all classes NEW). S1 backlog (US-S1-01..10, 41 SP) + acceptance table + honest sprint review (flags D03 §13 token TTL/type-claim/throttling/enum + D04 §13 delete-authz bug). Screenshots registered P-07..P-11 |
| task_04 | Ch.3 / Sprint 2 Projects & Membership | ☑ | done — §3.2 Sprint 2 appended. 5 PlantUML figs (3.8 sprint use-case; 3.9 create-project seq; 3.10 smart-add-member/invite seq; 3.11 project class slice; 3.12 cumulative class diagram #2 — S1 core plain + Project family new/yellow). S2 backlog (US-S2-01..07, 26 SP) + acceptance table (cites real unit tests projects.service.spec.ts, 854 lines; US-S2-05 partial = no accept-invite UI) + honest sprint review (flags D05 §13: archived not server-filtered, no accept UI, destructive member update, soft-cancel invite, circular capacity, global name-unique, high-blast-radius delete). Screenshots registered P-12..P-15 |
| task_05 | Ch.3 / Sprint 3 Agile Backlog & Tasks | ☑ | done — §3.3 Sprint 3 appended (LARGE, 2 modules). 10 PlantUML figs (3.13 sprint use-case; Module A Agile: 3.14 create-sprint seq, 3.15 burndown seq, 3.16 sprint-lifecycle state, 3.17 agile class slice; Module B Tasks: 3.18 create-task seq, 3.19 kanban-move seq, 3.20 task-status state, 3.21 tasks/kanban class slice; 3.22 cumulative class diagram #3, 4 packages). S3 backlog (US-S3-01..12, 64 SP) + 12-row acceptance table (honest: **zero backend tests** for tasks D07 §11, stale agile spec D06 §11, FE property tests only) + sprint review flagging D06 §13 (global SprintContent unique, non-atomic writes, unnamed Gantt sprints, non-idempotent complete, milestone date-skip, drifted RBAC helpers) + D07 §13 (racy TASK-key, moveToSprint→TODO, weak bulk-status auth, FE cap-100/swallow-errors). Screenshots registered P-16..P-22 |
| task_06 | Ch.3 / Sprint 4 Productivity Suite | ☑ | done — §3.4 Sprint 4 appended (LARGE, 4 modules). 10 PlantUML figs (3.23 sprint use-case w/ shared notify-channels include; Module A personal to-dos: 3.24 reminder-cron seq, 3.25 UserTask class slice; Module B time & attendance: 3.26 check-in seq w/ P1-1 dead-zone branch, 3.27 WorkDay/WorkSession slice; Module C events/calendar: 3.28 event-reminder-cron seq, 3.29 Event class slice; Module D reminders: 3.30 pending-reminder-fires seq, 3.31 Reminder/ReminderChannel slice; 3.32 cumulative class diagram #4 — 5 packages, Sprints 1–3 compacted plain + Productivity Suite new/yellow). S4 backlog (US-S4-01..09, 44 SP) + 9-row acceptance table + honest sprint review flagging D08 §13 (comment IDOR, delete-204, sub-task file leak, no-op search), D09 §13 (P1-1 check-in dead zone, worker-update unscoped, manager-list leak, dead manager-update, no cron lock), D10 §13 (all-roles perms, toAllUsers broadcast spam, ownership-hijack edit, no-op exec delete, dead FullCalendar), D11 §13 (recurrence fires-once, FAILED never set, orphaned reminders via dormant FKs, auto-reminder targets creator, G1 recipient-not-member, no FE for /reminders/me+dismiss). Near-zero backend tests (scaffolds only, one broken; reminders FE property tests only). Screenshots registered P-23..P-26 |
| task_07 | Ch.3 / Sprint 5 Communication & Ops | ☑ | done — §3.5 Sprint 5 appended (2 modules). 8 PlantUML figs (3.33 sprint use-case w/ Scheduler actor + shared notify include; Module A Notifications: 3.34 delivery-pipeline component, 3.35 one-notification-across-channels seq, 3.36 notifications class slice (7 models + DeviceType); Module B Infra monitoring: 3.37 health-check-cycle seq, 3.38 alert-fan-out component, 3.39 infra class slice (5 models + ServerServiceStatus); 3.40 cumulative class diagram #5 — Sprints 1–4 compacted plain + Communication & Ops new/yellow, seam = UserNotificationSettings feeding both reminders & infra alerts). S5 backlog (US-S5-01..08, 35 SP) + 8-row acceptance table (honest: stub/broken specs both modules, only mail.service.spec real) + sprint review flagging D12 §13 (ntfy dead, in-app coupled to push, broadcast open to all roles, inconsistent channel error contract, decentralized fan-out dup) + D13 §13 (B1 non-CTO service edit/delete→500, B2 schemeless checkHttp→every service false-down, B4 alert spam/no cooldown, fire-and-forget isSent, cron dup, broken specs, FE/BE RBAC divergence, no persisted health state). Screenshots registered P-27..P-30 |
| task_08 | Ch.4 / Sprint 6 AI Copilot & Estimation | ☑ | done — full Chapter 4 appended (§4.1–4.11). 6 PlantUML figs (4.1 sprint use-case w/ RBAC-labelled actors + Scheduler; 4.2 RAG pipeline component overview write/read paths; 4.3 index-a-task seq; 4.4 copilot-query seq w/ cosine gate branch; 4.5 AI class slice — DocumentEmbedding/IndexOutbox/CopilotQueryLog + 3 enums; 4.6 FINAL cumulative class diagram — Sprints 1–5 compacted plain + AI/RAG package yellow, soft-ref + write-path seam shown). S6 backlog (US-S6-01..07, 42 SP) reused from §2.2. CRISP-DM sub-process framing (§4.4). Metrics: keyword MRR 0.57→1.00 & R@1 0.30→1.00, semantic saturated (tie @0.958), 0 cross-role leakage — 2 tables + quota caveat. Security-in-SQL scoping (§4.6). Honest sprint review flagging D14 §13 (comment edit/delete not enqueued → deleted comment citable ~24h, cosine-only gate, cancelled SSE unlogged, plaintext telemetry, prompt-truncation/chunk mismatch, reranker-omit→0, null Gemini client, unbounded scans, zero AI unit tests). Screenshots registered P-31..P-33; QA re-run CONFIRM P-34 |
| task_09 | Front matter, Conclusion, Assembly | ☑ | done — Front Matter block inserted before Ch.1 (title page, Remerciements, Résumé FR + Abstract EN with keywords, TOC, List of Figures = all 54 figs 1.1/2.1–2.7/3.1–3.40/4.1–4.6 verified sequential no-gaps, List of Tables by section, Glossary/Acronyms ~40 terms). Conclusion & Perspectives appended at end (what was built + 4 objectives met, AI-as-climax on 3 pillars scoped/fresh/measured, verified limitations in 5 themes, 6-step prioritized future work, closing). Two new placeholders P-35 (title-page fields) + P-36 (remerciements) registered; Register now P-01..P-36. Build scaffolding (assembly note + Register) flagged as export-dropped. Consistency verified: US-ID ranges match §2.2 (S1 10/S2 7/S3 12/S4 9/S5 8/S6 7), cumulative diagrams 3.7→3.12→3.22→3.32→3.40→4.6, figure numbering coherent |

---

## §F — CONVENTIONS SUMMARY (quick reference)

- **Language:** English. **Diagrams:** PlantUML for all report figures (use-case, class, sequence, state,
  component/deployment), each opened with the §G theme header and captioned `*Figure N.M — title*`.
- **Class diagram rule:** UML, cumulative, one per sprint at its end; per-module slices during the sprint;
  new classes highlighted `#LightYellow`.
- **Use-case rule:** one per sprint + a GLOBAL one in Ch.2.
- **Traceability:** every technical claim carries a dossier trace like `(D07 §4.1)`.
- **Placeholders:** `[SCREENSHOT: …]`, `[TO PROVIDE: …]`, `[CONFIRM: …]` — always mirrored into the
  report's Placeholder Register.
- **Source of truth:** `docs/dossiers/00–16` + `docs/pfe-report-reference.md`. Never re-read source code.

---

## §G — SHARED PLANTUML THEME (paste after every `@startuml`)

```
@startuml
!theme plain
skinparam backgroundColor transparent
skinparam shadowing false
skinparam roundcorner 8
skinparam defaultFontName "Helvetica"
skinparam classAttributeIconSize 0
skinparam ArrowColor #33475b
skinparam actorStyle awesome
skinparam class {
  BackgroundColor #FBFCFE
  BorderColor #33475b
  ArrowColor #33475b
}
skinparam usecase {
  BackgroundColor #FBFCFE
  BorderColor #33475b
}
' ... diagram body ...
@enduml
```

Keep the palette consistent so every figure in the report reads as one visual family. Highlight
newly-introduced classes each sprint with `#LightYellow`.
```
