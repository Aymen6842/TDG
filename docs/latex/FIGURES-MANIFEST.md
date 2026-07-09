# Figures Manifest — Tawer Management PFE Report

These are all the image files that must be dropped into the Overleaf `figures/` folder for the report to
compile without "FIGURE PENDING" boxes. **Diagrams** (`fig_N_M.png`/`.pdf`) are rendered from the matching
PlantUML source in `diagrams-src/fig_N_M.puml`; **screenshots** (`screenshot_PXX.png`) are the UI captures
listed in the Placeholder Register (P-07 … P-33). Every row starts `☐ pending` until the file is placed.

## Diagrams (54) — render each from `diagrams-src/`

| Filename | Type | Caption / description | Status |
|---|---|---|---|
| figures/fig_1_1.png | diagram | 1.1 System context: users, the two-application platform, and its external services — render from diagrams-src/fig_1_1.puml | ☐ pending |
| figures/fig_2_1.png | diagram | 2.1 Global use-case: the six actor archetypes against the platform's headline capabilities — render from diagrams-src/fig_2_1.puml | ☐ pending |
| figures/fig_2_2.png | diagram | 2.2 Project roadmap: six sprints as nominal timeboxes with their planned story-point load — render from diagrams-src/fig_2_2.puml | ☐ pending |
| figures/fig_2_3.png | diagram | 2.3 System component / deployment view of the two-application platform — render from diagrams-src/fig_2_3.puml | ☐ pending |
| figures/fig_2_4.png | diagram | 2.4 Backend layered architecture (controller → service → repository → Prisma) — render from diagrams-src/fig_2_4.puml | ☐ pending |
| figures/fig_2_5.png | diagram | 2.5 End-to-end request lifecycle for an authenticated read — render from diagrams-src/fig_2_5.puml | ☐ pending |
| figures/fig_2_6.png | diagram | 2.6 Client-side authentication gate — render from diagrams-src/fig_2_6.puml | ☐ pending |
| figures/fig_2_7.png | diagram | 2.7 Deployment topology as run today — render from diagrams-src/fig_2_7.puml | ☐ pending |
| figures/fig_3_1.png | diagram | 3.1 Sprint 1 use-case: identity and administration features — render from diagrams-src/fig_3_1.puml | ☐ pending |
| figures/fig_3_2.png | diagram | 3.2 Login sequence: credential check, token issuance, refresh-token persistence — render from diagrams-src/fig_3_2.puml | ☐ pending |
| figures/fig_3_3.png | diagram | 3.3 Protected-request / RBAC sequence — render from diagrams-src/fig_3_3.puml | ☐ pending |
| figures/fig_3_4.png | diagram | 3.4 Auth & RBAC class slice: the identity core — render from diagrams-src/fig_3_4.puml | ☐ pending |
| figures/fig_3_5.png | diagram | 3.5 Create-user-by-admin sequence — render from diagrams-src/fig_3_5.puml | ☐ pending |
| figures/fig_3_6.png | diagram | 3.6 Users & Teams class slice — render from diagrams-src/fig_3_6.puml | ☐ pending |
| figures/fig_3_7.png | diagram | 3.7 Cumulative class diagram after Sprint 1 — identity & access core — render from diagrams-src/fig_3_7.puml | ☐ pending |
| figures/fig_3_8.png | diagram | 3.8 Sprint 2 use-case: project lifecycle, membership, invite/accept flow — render from diagrams-src/fig_3_8.puml | ☐ pending |
| figures/fig_3_9.png | diagram | 3.9 Create-project sequence — render from diagrams-src/fig_3_9.puml | ☐ pending |
| figures/fig_3_10.png | diagram | 3.10 Smart add-member / invite sequence — render from diagrams-src/fig_3_10.puml | ☐ pending |
| figures/fig_3_11.png | diagram | 3.11 Projects & Membership class slice — render from diagrams-src/fig_3_11.puml | ☐ pending |
| figures/fig_3_12.png | diagram | 3.12 Cumulative class diagram after Sprint 2 — render from diagrams-src/fig_3_12.puml | ☐ pending |
| figures/fig_3_13.png | diagram | 3.13 Sprint 3 use-case: agile planning and the task engine — render from diagrams-src/fig_3_13.puml | ☐ pending |
| figures/fig_3_14.png | diagram | 3.14 Create-sprint sequence — render from diagrams-src/fig_3_14.puml | ☐ pending |
| figures/fig_3_15.png | diagram | 3.15 Sprint burndown sequence — render from diagrams-src/fig_3_15.puml | ☐ pending |
| figures/fig_3_16.png | diagram | 3.16 Sprint lifecycle state machine — render from diagrams-src/fig_3_16.puml | ☐ pending |
| figures/fig_3_17.png | diagram | 3.17 Agile Backlog class slice — render from diagrams-src/fig_3_17.puml | ☐ pending |
| figures/fig_3_18.png | diagram | 3.18 Create-task sequence — render from diagrams-src/fig_3_18.puml | ☐ pending |
| figures/fig_3_19.png | diagram | 3.19 Move-task-in-kanban sequence — render from diagrams-src/fig_3_19.puml | ☐ pending |
| figures/fig_3_20.png | diagram | 3.20 Task status transitions (FREESTYLE and AGILE boards) — render from diagrams-src/fig_3_20.puml | ☐ pending |
| figures/fig_3_21.png | diagram | 3.21 Tasks & Kanban class slice — render from diagrams-src/fig_3_21.puml | ☐ pending |
| figures/fig_3_22.png | diagram | 3.22 Cumulative class diagram after Sprint 3 — render from diagrams-src/fig_3_22.puml | ☐ pending |
| figures/fig_3_23.png | diagram | 3.23 Sprint 4 use-case: the four personal-productivity clusters — render from diagrams-src/fig_3_23.puml | ☐ pending |
| figures/fig_3_24.png | diagram | 3.24 Personal-task reminder cron — render from diagrams-src/fig_3_24.puml | ☐ pending |
| figures/fig_3_25.png | diagram | 3.25 Personal To-Dos class slice — render from diagrams-src/fig_3_25.puml | ☐ pending |
| figures/fig_3_26.png | diagram | 3.26 Check-in sequence with the 00:00–02:59 UTC dead-zone branch — render from diagrams-src/fig_3_26.puml | ☐ pending |
| figures/fig_3_27.png | diagram | 3.27 Time & Attendance class slice — render from diagrams-src/fig_3_27.puml | ☐ pending |
| figures/fig_3_28.png | diagram | 3.28 Event reminder cron — render from diagrams-src/fig_3_28.puml | ☐ pending |
| figures/fig_3_29.png | diagram | 3.29 Events & Calendar class slice — render from diagrams-src/fig_3_29.puml | ☐ pending |
| figures/fig_3_30.png | diagram | 3.30 Pending-reminder delivery sequence — render from diagrams-src/fig_3_30.puml | ☐ pending |
| figures/fig_3_31.png | diagram | 3.31 Reminders class slice — render from diagrams-src/fig_3_31.puml | ☐ pending |
| figures/fig_3_32.png | diagram | 3.32 Cumulative class diagram after Sprint 4 — render from diagrams-src/fig_3_32.puml | ☐ pending |
| figures/fig_3_33.png | diagram | 3.33 Sprint 5 use-case: notification substrate and monitoring loop — render from diagrams-src/fig_3_33.puml | ☐ pending |
| figures/fig_3_34.png | diagram | 3.34 Multi-channel delivery pipeline — render from diagrams-src/fig_3_34.puml | ☐ pending |
| figures/fig_3_35.png | diagram | 3.35 One system notification across channels — render from diagrams-src/fig_3_35.puml | ☐ pending |
| figures/fig_3_36.png | diagram | 3.36 Notifications class slice — render from diagrams-src/fig_3_36.puml | ☐ pending |
| figures/fig_3_37.png | diagram | 3.37 Server health-check cycle — render from diagrams-src/fig_3_37.puml | ☐ pending |
| figures/fig_3_38.png | diagram | 3.38 Alert fan-out — render from diagrams-src/fig_3_38.puml | ☐ pending |
| figures/fig_3_39.png | diagram | 3.39 Infrastructure monitoring class slice — render from diagrams-src/fig_3_39.puml | ☐ pending |
| figures/fig_3_40.png | diagram | 3.40 Cumulative class diagram after Sprint 5 — render from diagrams-src/fig_3_40.puml | ☐ pending |
| figures/fig_4_1.png | diagram | 4.1 Sprint 6 use-case: copilot, estimation, admin, and scheduler — render from diagrams-src/fig_4_1.puml | ☐ pending |
| figures/fig_4_2.png | diagram | 4.2 RAG pipeline (asynchronous write path, synchronous read path) — render from diagrams-src/fig_4_2.puml | ☐ pending |
| figures/fig_4_3.png | diagram | 4.3 Index-a-task sequence — render from diagrams-src/fig_4_3.puml | ☐ pending |
| figures/fig_4_4.png | diagram | 4.4 Copilot query sequence with the confidence gate — render from diagrams-src/fig_4_4.puml | ☐ pending |
| figures/fig_4_5.png | diagram | 4.5 AI class slice (DocumentEmbedding / IndexOutbox / CopilotQueryLog) — render from diagrams-src/fig_4_5.puml | ☐ pending |
| figures/fig_4_6.png | diagram | 4.6 Final cumulative class diagram (whole system, six sprints) — render from diagrams-src/fig_4_6.puml | ☐ pending |

## Screenshots (27) — capture from the running UI (Placeholder Register P-07 … P-33)

| Filename | Type | Caption / description | Status |
|---|---|---|---|
| figures/screenshot_P07.png | screenshot | §3.1.4 Login page (email/phone + password form) | ☐ pending |
| figures/screenshot_P08.png | screenshot | §3.1.4 Registration page (self-service sign-up landing in PendingApproval) | ☐ pending |
| figures/screenshot_P09.png | screenshot | §3.1.4 Users list with search + role filter + pagination | ☐ pending |
| figures/screenshot_P10.png | screenshot | §3.1.4 Create / edit user dialog (roles, teams, image upload) | ☐ pending |
| figures/screenshot_P11.png | screenshot | §3.1.4 Teams view (team list + member/manager management) | ☐ pending |
| figures/screenshot_P12.png | screenshot | §3.2.2 Projects list (status-tabbed grid/list with search, filter panel, drag-reorder) | ☐ pending |
| figures/screenshot_P13.png | screenshot | §3.2.2 Create-project sheet (business unit, type, dates, manager selection) | ☐ pending |
| figures/screenshot_P14.png | screenshot | §3.2.2 Members tab (member list + pending invitations with role-toggle/remove) | ☐ pending |
| figures/screenshot_P15.png | screenshot | §3.2.2 Invite-by-email dialog (add-member dialog in email mode) | ☐ pending |
| figures/screenshot_P16.png | screenshot | §3.3.3 Backlog view (groomed, reorderable list with favourite/archived filters) | ☐ pending |
| figures/screenshot_P17.png | screenshot | §3.3.3 Kanban board (data-driven columns, WIP limits, drag-drop cards) | ☐ pending |
| figures/screenshot_P18.png | screenshot | §3.3.3 Task detail sheet (fields, status stepper, comments/@mentions/likes, dependencies, labels, time entries, attachments) | ☐ pending |
| figures/screenshot_P19.png | screenshot | §3.3.3 Sprint board (sprint list with Start/Stop/Complete/Restart status-action cards) | ☐ pending |
| figures/screenshot_P20.png | screenshot | §3.3.3 Burndown chart (ideal-vs-actual remaining points for a selected sprint) | ☐ pending |
| figures/screenshot_P21.png | screenshot | §3.3.3 Velocity chart (completed story points per sprint with running average) | ☐ pending |
| figures/screenshot_P22.png | screenshot | §3.3.3 Gantt chart (milestones, epics and sprints on a project timeline) | ☐ pending |
| figures/screenshot_P23.png | screenshot | §3.4.5 To-do list (personal checklist with filters, view toggle, drag-reorder) + task-detail sheet (sub-tasks, comments, attachments) | ☐ pending |
| figures/screenshot_P24.png | screenshot | §3.4.5 Check-in gate (full-screen Remote/Onsite check-in) + header check-out button with journey-notes/mood popup | ☐ pending |
| figures/screenshot_P25.png | screenshot | §3.4.5 Calendar month view (custom month calendar with meetings/events) + create/edit event dialog | ☐ pending |
| figures/screenshot_P26.png | screenshot | §3.4.5 Reminders UI (project-detail reminders list with channel/status badges) + create/edit sheet | ☐ pending |
| figures/screenshot_P27.png | screenshot | §3.5.3 Notification bell/list (header bell dropdown with unseen count + full notifications list page) | ☐ pending |
| figures/screenshot_P28.png | screenshot | §3.5.3 Notification settings/channels (email/Telegram/ntfy toggles, Telegram chatId input, ntfy setup steps) | ☐ pending |
| figures/screenshot_P29.png | screenshot | §3.5.3 Infrastructure servers dashboard (servers list table + add/edit server dialog with capacity, managers, expiry) | ☐ pending |
| figures/screenshot_P30.png | screenshot | §3.5.3 Services view (services list table with status badges + add/edit service dialog) | ☐ pending |
| figures/screenshot_P31.png | screenshot | §4.7 Copilot panel mid-stream (partially-rendered grounded answer with blinking caret + citation chips) | ☐ pending |
| figures/screenshot_P32.png | screenshot | §4.7 Citation chip deep-link (clicking a chip opens the referenced task sheet / switches tab with the cited item highlighted) | ☐ pending |
| figures/screenshot_P33.png | screenshot | §4.7 Task estimate suggestion in the create-task form (≈ Xh (low–high) · N pts — based on TASK-… line with apply button) | ☐ pending |
