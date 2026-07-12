# Chapter 2: Project Management and Design

## Intro

Chapter 1 fasser *chnou* hiya la plateforme w *3lech* mawjouda. Chapter 2 yfasser **kifech** planiniha 9bal ma nebdew nimplementiw. Ycouvri: development methodology, product backlog, sprint plan, software architecture, database design, technology choices, w risks/challenges.

Les 5 development sprints mawjoudin f Chapter 3, w l'AI sprint f Chapter 4.

---

## Development Methodology

### 3lech Scrum?

Khdhina **Scrum** kima methodology. El choix jé mel nature mta3 el khedma nfisha:

- La plateforme tcouvri 10 operational domains
- Les requirements mta3 el domains li jaw ba3d (notifications, monitoring, w surtout l'AI copilot) ma ye9drouch yetwadhhou illa ba3d ma el domains el owlin yetbniw w yetsta3mliw
- Waterfall (specification wa7da mel awwel) ken yet7at decisions trop tôt — 9bal ma na3rfou assez bech na3mlouhoum

**Scrum khalletna** ndelivriw la plateforme f working increments:
1. Auth core l'awwel
2. Projects fog-ou
3. Agile backlog fog les projects
4. AI copilot fog les données li tgenerat mel sprints précédents

Kol increment ye9der yet-démonstri, w el sprint li ba3dou yet-planifié 3la base système li yekhdhem.

### Scrum Roles (3 personnes)

| Person | Role |
|--------|------|
| **Aymen BenHsan** (ena) | Development Team + main developer — full-stack design w implementation |
| **Ahmed Awedi** (CEO) | Product Owner + frontend supervisor — priorities w product backlog |
| **Mohamed Awedi** (CTO) | Backend supervisor — technical guidance w unblocking |

**Important**: equipe sghira (3 membres) ama Scrum ye5dem quand même parce que la valeur mta3ou hiya el structure (ceremonies, artifacts, increments) mech el taille mta3 l'equipe.

### Sprint Organization — Ceremonies

Kol sprint yemshi bel standard Scrum ceremonies:

1. **Sprint planning**: nekhtirou user stories mel product backlog, n7ottouhoum f sprint backlog, w netf9ou 3la sprint goal.
2. **Daily stand-ups**: synchronization meetings 9sar — chnou 3melt, chnou bech na3mel, chnou y39allik.
3. **Sprint review**: démo el increment li tdelivra.
4. **Retrospective**: chnou n7assnouw lel sprint el jey.
5. **Backlog refinement**: continuously, ki el domains li jaw ba3d yetwadhhou.

Kol sprint yproduit **3 artifacts**:
- **Sprint backlog** (drawn mel product backlog)
- **Sprint goal** (el target)
- **Potentially shippable increment** (increment li ye9der yenzel production)

### Sprint Duration — Variable

Sprint durations **mech fixes**. Met3adlin 7asseb scope w complexity:

| Sprint | Duration | Story Points | Note |
|--------|----------|:---:|------|
| Sprint 1 | 3 weeks | 41 | Foundations (lourde setup) |
| Sprint 2 | 2 weeks | 26 | Lightest sprint |
| Sprint 3 | 5 weeks | 64 | Heaviest sprint (agile + kanban engine) |
| Sprint 4 | 4 weeks | 44 | Productivity suite |
| Sprint 5 | 3 weeks | 35 | Communication & ops |
| Sprint 6 | 4 weeks | 42 | AI (main contribution) |
| **Total** | **21 weeks** | **252** | 5 months internship |

### Methodological Note — Dependency Order

El sprint decomposition jé mel **module dependency order** mta3 el système li tdelivra:

- Auth lazem AWWEL (ma tnajem tebni chay 9blha)
- Projects lazem 9bal agile backlog (projects hiya el container)
- Content lazem 9bal AI copilot (parce que el copilot yindexer w yjaweb 3al content li tproduit f les sprints li 9bélou)

**Donc**: el plan y3abber 3la real build order, mech invented tracker history.

### CRISP-DM inside Sprint 6

Inside Sprint 6 (AI copilot), nesta3mliw methodology thania ka sub-process: **CRISP-DM** (Cross-Industry Standard Process for Data Mining). 3lech? Parce que ML component y7taj steps li CRUD features ma y7tajouhomch:
- Data understanding
- Modeling
- Evaluation

Hedha mfassar f Chapter 4 en détail.

---

## Product Backlog

### Structure mta3 el backlog

- **Format**: user stories f canonical form: *"As a <role>, I want <goal>, so that <value>"*
- **Identifiers**: `US-S<sprint>-<n>` (stable w sprint-scoped)
- **Priority**: MoSCoW — **Must** / **Should** / **Could**
- **Story points**: Fibonacci scale (1, 2, 3, 5, 8) — relative size w complexity estimate
- **Duration estimates**: derived mel sprint timeline w story-point proportions

### Sprint 1 — Foundations & Authentication (41 SP, 3w)

| ID | Story (résumé) | SP | Priority |
|----|----------------|:--:|----------|
| US-S1-01 | Layered NestJS backend + Prisma multi-file schema + migrations | 8 | Must |
| US-S1-02 | Login email+password → JWT | 3 | Must |
| US-S1-03 | Automatic token refresh | 3 | Must |
| US-S1-04 | Password reset via emailed code | 3 | Should |
| US-S1-05 | Every endpoint gated by role-permission guard | 8 | Must |
| US-S1-06 | Admin provisions users directly (skip self-registration) | 5 | Must |
| US-S1-07 | List, search (accent-insensitive), filter users | 3 | Should |
| US-S1-08 | Edit + soft-delete (deactivate) user | 3 | Must |
| US-S1-09 | User updates own profile + changes password | 2 | Should |
| US-S1-10 | Create teams, assign members + manager | 3 | Should |

**Key points Sprint 1**: hedha el foundation — ma yetbnéch chay min ghayr ma ykoun famma auth + RBAC + layered structure.

### Sprint 2 — Projects & Membership (26 SP, 2w)

| ID | Story (résumé) | SP | Priority |
|----|----------------|:--:|----------|
| US-S2-01 | Create project under business unit (AGILE/FREESTYLE type) | 5 | Must |
| US-S2-02 | Edit, archive, delete project | 3 | Must |
| US-S2-03 | Add existing users as members + mark manager | 3 | Must |
| US-S2-04 | Invite by email with single-use token | 5 | Should |
| US-S2-05 | Invitee accepts invitation → becomes member | 3 | Should |
| US-S2-06 | Configure kanban settings (WIP limits) | 2 | Could |
| US-S2-07 | User sees only projects they belong to (exec scoped to their BU) | 5 | Must |

**Key point Sprint 2**: **Project** hiya el container li kol chay ba3dha y depends 3liha. Note el distinction AGILE vs FREESTYLE — important.

### Sprint 3 — Agile Backlog & Tasks (64 SP, 5w)

| ID | Story (résumé) | SP | Priority |
|----|----------------|:--:|----------|
| US-S3-01 | Create epics to group features | 3 | Should |
| US-S3-02 | Create sprints with dates + capacity | 5 | Must |
| US-S3-03 | Sprint lifecycle (start/stop/complete, one running max) | 8 | Must |
| US-S3-04 | Milestones with target dates (aussi FREESTYLE) | 3 | Should |
| US-S3-05 | Burndown, velocity, Gantt analytics | 8 | Should |
| US-S3-06 | Create tasks (type, priority, assignee, estimates) | 5 | Must |
| US-S3-07 | Data-driven kanban: custom columns + WIP limits | 8 | Must |
| US-S3-08 | Move task across columns (transition + dependency + WIP validation) | 8 | Must |
| US-S3-09 | Task dependencies (blocking / blocked-by) | 5 | Should |
| US-S3-10 | Log time against task | 3 | Should |
| US-S3-11 | Threaded comments + @mentions + likes | 5 | Should |
| US-S3-12 | Labels + assign task to sprint/epic/milestone | 3 | Should |

**Key point Sprint 3**: hedha el heaviest sprint (64 SP). Fih el agile engine lkol + kanban data-driven. El key feature hiya li el board **configurable per project** (mech hard-coded columns).

### Sprint 4 — Productivity Suite (44 SP, 4w)

| ID | Story (résumé) | SP | Priority |
|----|----------------|:--:|----------|
| US-S4-01 | Private to-do list (sub-tasks, priorities, statuses) | 5 | Should |
| US-S4-02 | Due/reminder dates on to-dos → notify | 5 | Should |
| US-S4-03 | Check-in / check-out (remote/onsite) | 8 | Must |
| US-S4-04 | Worked time computed per business day | 3 | Should |
| US-S4-05 | Per-user + per-team attendance statistics | 5 | Should |
| US-S4-06 | Create calendar events + meetings with participants | 8 | Should |
| US-S4-07 | Multi-channel reminders before events | 3 | Should |
| US-S4-08 | Schedule project/personal reminders on channels | 5 | Should |
| US-S4-09 | See + dismiss pending reminders | 2 | Could |

### Sprint 5 — Communication & Operations (35 SP, 3w)

| ID | Story (résumé) | SP | Priority |
|----|----------------|:--:|----------|
| US-S5-01 | In-app notification inbox (bell + list) | 5 | Must |
| US-S5-02 | FCM push notifications | 5 | Should |
| US-S5-03 | Configure delivery channels (email, push, Telegram, ntfy) | 3 | Should |
| US-S5-04 | Link Telegram account | 3 | Could |
| US-S5-05 | Register servers + services | 5 | Should |
| US-S5-06 | Health-check servers (ICMP) + services (HTTP) every minute | 8 | Must |
| US-S5-07 | Multi-channel alerts on outage | 5 | Must |
| US-S5-08 | Public `/health` endpoint | 1 | Could |

### Sprint 6 — AI Copilot & Estimation (42 SP, 4w)

| ID | Story (résumé) | SP | Priority |
|----|----------------|:--:|----------|
| US-S6-01 | Ask copilot natural-language question about project content | 5 | Must |
| US-S6-02 | Answer streamed with clickable citations | 8 | Must |
| US-S6-03 | Copilot refuses when corpus can't support answer | 5 | Must |
| US-S6-04 | Estimate draft task effort from similar completed tasks | 8 | Should |
| US-S6-05 | Auto-index content via write-path outbox (async) | 8 | Must |
| US-S6-06 | Admin triggers reindex + views copilot telemetry | 3 | Should |
| US-S6-07 | Retrieval scoped by permissions in SQL | 5 | Must |

### Backlog Totals

**252 story points** total, distributed across 21 weeks (6 sprints).

Planned burndown:

| After Sprint | Points Retired | Remaining (of 252) |
|:---:|:---:|:---:|
| Start | — | 252 |
| Sprint 1 | 41 | 211 |
| Sprint 2 | 26 | 185 |
| Sprint 3 | 64 | 121 |
| Sprint 4 | 44 | 77 |
| Sprint 5 | 35 | 42 |
| Sprint 6 | 42 | 0 |

---

## Sprint Planning — Dependency Chain

El plan yorti el backlog f 6 sprints yemchiw f **strict dependency chain**:

```
Auth/RBAC → Projects → Agile Backlog → Tasks
                                      → Productivity Suite → Calendar/Reminders
                                      → Notifications → Monitoring
                                      → AI Copilot (indexes all content above)
```

Ma tnajem tebni **chay** 9bal Auth. Projects hiya el container li kol el features li jaw ba3d. AI copilot yji akher parce que yindexer el content li tproduit mel sprints el owlin.

> Figure 2.1 — Global use-case diagram: 6 actor archetypes mapped onto main capabilities
> Figure 2.2 — Project roadmap: 6 sprints as timeboxes with planned SP loads

---

## Software Architecture

### Two-Application System

Tawer Management hiya **2 applications mfar9in**:

| Component | Technology | Role |
|-----------|-----------|------|
| **Backend** | NestJS REST API (stateless) | Business logic, data access, auth |
| **Frontend** | Next.js web client | UI, calls API directly from browser |

Communication: **HTTP/JSON** + **Bearer JWT**.

Mafamech **backend-for-frontend proxy** — les 2 apps ma y partagiwch code, ycommuniquiw ghir via HTTP. Hedha ya3ni el API ye9der yservi any other client (mobile, CLI, autre web app) sans changement.

### Scale mta3 el architecture (verified numbers)

- **147 endpoints** across **20 controllers**
- **55 Prisma models** + **25 enums** across **13 schema files**
- Counted directly from source code

> Figure 2.3 — System component and deployment view

### Layered Backend Architecture (4 layers per feature)

Kol domain module yemshi bel nafs **4-layer split**:

```
Controller → Service → Repository → DTO
```

| Layer | Responsibility |
|-------|---------------|
| **Controller** | HTTP routing, guards, Swagger docs |
| **Service** | Business rules, authorization logic |
| **Repository** | ONLY layer li ymess Prisma (database access) |
| **DTO** | Request/response shapes + validation decorators |

**3lech hedha important?** Parce que kol el ~20 backend modules yemchiw bel nafs el structure. Ki tet3alem el pattern MARRA, kol module te9raah w tefhmou bel nafs el tari9a. Hedha el key li khallé 10 domains maintainable b developer wa7ed.

> Figure 2.4 — Backend layered architecture diagram

### Frontend Architecture

**Next.js 16 App Router** structured kima hekka:

```
[locale]/
├── (guest)/          → login, registration, password reset
└── dashboard/(auth)/ → every authenticated feature under one shell
```

State management:
- **TanStack Query** → server state (data fetching + caching)
- **Zustand** → short-lived UI state (lightweight stores)
- **Zod** → form validation schema factories (take the next-intl translator → validation messages localized)

Kol feature folder mirrors backend structure:
```
feature/
├── components/
├── hooks/
├── services/
├── store/
├── types/
└── validation/
```

### Deployment Topology

Self-provisioning local stack via **docker-compose**:

| Service | Purpose |
|---------|---------|
| PostgreSQL + pgvector | Main DB + vector store |
| Redis | Reserved for future cache/locking (not yet wired) |
| Mailpit | Development SMTP (email testing) |

- On container start: backend runs `prisma migrate deploy` (idempotent, production-safe)
- Development: backend on `:3001`, frontend on `:3000`
- Each app has its own `Dockerfile`

---

## Database Design

### Overview

- Single **PostgreSQL** instance + **pgvector** extension (vector similarity search)
- Schema managed by **Prisma 7** (multi-file: 13 files under `prisma/schema/`)
- **28 migrations** via `prisma migrate deploy`
- **55 models** + **25 enums**

### 8 Entity Families

| Package | Entities | Domain |
|---------|----------|--------|
| P1 — Identity & Access | User, Role, Team, UserTeam, RefreshToken | Auth core |
| P2 — Projects & Membership | Project, ProjectContent (i18n), ProjectMember, ProjectInvitation | Project lifecycle |
| P3 — Agile Planning | Epic, Sprint (+ SprintContent, SprintAttachment), Milestone | Planning layer |
| P4 — Tasks & Kanban | Task, ProjectTaskStatus, TaskComment, TaskDependency, TaskTimeEntry, TaskLabel, TaskLabelAssignment | Work units |
| P5 — Productivity Suite | UserTask, WorkDay, WorkSession, Event, EventParticipant, Reminder | Personal features |
| P6 — Notifications & Channels | Notification, UserNotification, UserNotificationSettings, UserTelegramBot, UserNtfyIntegration | Delivery substrate |
| P7 — Infrastructure Monitoring | Server, Service, UserServerManagement + outbox notification tables | Ops |
| P8 — AI / RAG | DocumentEmbedding (vector + tsvector), IndexOutbox, CopilotQueryLog | Intelligence layer |

### Database Organization — Key Points

- Main transactional tables: default `public` schema
- AI tables (3): created by **raw migration** (outside Prisma generator) parce que Prisma ma ye9derch y-emit `vector(1536)` or generated `tsvector` columns natively
- **2 indexing strategies**:
  1. Standard **B-tree** indexes 3al PKs/FKs (transactional schema)
  2. **HNSW** index 3al `embedding` column (approximate nearest-neighbor cosine search) + **GIN** index 3al generated `tsvector` column (full-text search)
- El dual-index design y-enable el **hybrid retrieval pipeline** (Chapter 4)

### Key Relationships

- **User** = central entity. Y connects l: roles, teams, projects, tasks, work days, events, reminders, notifications, copilot queries.
- **Project** = aggregate root mta3 el operational domain. Epics, sprints, milestones, tasks, document embeddings — kolhom 3andhom FK back to Project.
- **AI tables** (DocumentEmbedding, IndexOutbox): yreference source entities via **polymorphic pair** (`entityType + entityId`) au lieu de typed FKs — parce que nafs el table yindexer 5 entity types mkhtalfin.

> Figure 2.8 — High-level domain-relationship diagram (8 packages + cross-domain relationships)

---

## Technologies and Development Tools

### Backend Stack

| Technology | Version | Why chosen |
|-----------|---------|-----------|
| **NestJS** | 11 | Modular architecture enforced at framework level. Decorators for routing, DI, guards, Swagger → fits perfectly mel 4-layer convention. Lazem haja li structuri 10-domain monolith. |
| **Prisma** | 7 | Typed client generated from declarative schema → compile-time safety. Multi-file schema (13 files) organized by domain. `prisma migrate deploy` = idempotent production-safe migrations. |
| **Google Gemini** | — | Embedding model + generation model lel AI copilot. Managed API → mafamech self-hosted inference stack required. `flash-lite` variant = cheap fast reranker. |

### Frontend Stack

| Technology | Version | Why chosen |
|-----------|---------|-----------|
| **Next.js** | 16 (App Router) | File-based routing, built-in i18n support (next-intl), React Server Components → bilingual authenticated SPA. |
| **React** | 19 | UI runtime. M3a TanStack Query (server state) + Zustand (client state) → clean separation. |
| **Tailwind CSS** | 4 | Utility-first, styles co-located with components. + Radix UI primitives (shadcn pattern) → accessible, customizable. |

### Database & Infrastructure

| Technology | Why |
|-----------|-----|
| **PostgreSQL 15 + pgvector** | Single datastore: transactional + vector store. Embeddings f nafs el DB = permission-scoped retrieval f plain SQL. Ma3andekch separate vector DB to operate/sync/secure. |
| **Redis** | F el compose stack ama not yet wired. Reserved for caching. Currently: distributed locking via `SELECT ... FOR UPDATE SKIP LOCKED` f Postgres. |
| **Docker** (docker-compose) | Provisions: PG+pgvector, Redis, Mailpit. Each app has Dockerfile. |

### AI & Retrieval Pipeline (summary — detailed in Ch4)

- **RAG** (Retrieval-Augmented Generation): retrieve relevant content FIRST → give to model as sources → model generates grounded answer
- **Hybrid search**: vector search (cosine/HNSW) + lexical search (full-text/GIN tsvector)
- **Reciprocal Rank Fusion** (RRF): fuses results mel 2 search types
- **LLM reranker** (optional): re-orders fused results

### Development Tools

- **Git**: version control, single repo (monorepo holding both apps)
- **Swagger**: auto-generated API docs at `/api`
- **Zod**: form validation schema factories → inferred TypeScript types, bind form values + react-hook-form resolver + request shape to ONE definition
- **Firebase Cloud Messaging (FCM)**: push notifications delivery

---

## Risks and Technical Challenges

5 risks identified at design stage:

### 1. AI Hallucinations
- **Risk**: LLM asked about company projects without grounding → invents plausible answers
- **Mitigation**: RAG (model sees ONLY retrieved, permission-scoped content) + confidence gate (refuses when nothing relevant retrieved)
- **Principle**: *honesty over coverage* — refuse rather than guess

### 2. Breadth vs Consistency
- **Risk**: 10 domains f codebase wa7da → système large, inconsistent, hard to maintain
- **Mitigation**: strict 4-layer per-feature architecture enforced 3la EVERY module. Nafs el structure across all domains.

### 3. No Self-Hosted ML Infrastructure
- **Risk**: GPU-backed inference stack mech feasible f timeline mta3 internship
- **Mitigation**: Google Gemini as managed API. Trade-off: external dependency + rate limits

### 4. Security Across Rich Role Model
- **Risk**: ~31 role types sharing one API → authorization gaps likely
- **Mitigation**: centralized RBAC catalogue (~120 permissions mapped f constant wa7da) applied by single guard 3la every route + ownership checks f services (where data is available)

### 5. Integration Complexity
- **Risk**: multi-channel notifications, health checks, AI indexing pipeline → asynchronous cross-module orchestration complex
- **Mitigation**: distributed Postgres-based locking (`SELECT ... FOR UPDATE SKIP LOCKED`) → cron jobs run exactly once f multi-instance deployment

---

## Chapter Conclusion

Chapter 2 7adher el ground lel implementation chapters:
- Scrum process with variable-length sprints
- 252-point product backlog across 6 sprints
- Strict dependency-driven plan
- 2-app architecture (NestJS + Next.js) backed by PostgreSQL+pgvector
- Uniform 4-layer convention → 10 domains maintainable
- 55 models f 8 entity families
- Technology choices driven by: type safety, maintainability, w keeping AI inside same datastore as domain

Chapters 3 w 4 yemchiw sprint by sprint.

---

---

# Chnou lazem tetfaker mel Chapter 2

1. **3lech Scrum**: requirements el later domains ma yetwadhhouch 9bal ma el earlier ones yetbniw. Waterfall kenet t-fix decisions too early. Scrum = working increments + feedback loop.

2. **Scrum roles**: enta Development Team (full-stack), Ahmed = PO + frontend supervisor, Mohamed = backend supervisor. 3 personnes.

3. **Variable sprint duration**: mech fixed length! Ranged from 2w (Sprint 2) to 5w (Sprint 3). Total = 21 weeks, 252 SP.

4. **Dependency order**: Auth → Projects → Agile → Tasks/Productivity → Notifications/Monitoring → AI. La haja lazem tetbnéch f hedha el order. El AI yji akher parce que yindexer kol chay li 9blou.

5. **4-layer architecture**: Controller → Service → Repository → DTO. Applied uniformly 3la every module. Hedhi el key phrase: "once you learn the pattern, every module reads the same way."

6. **Key numbers**: 147 endpoints, 20 controllers, 55 models, 25 enums, 13 schema files, 28 migrations, ~31 roles, ~120 permissions.

7. **Database**: single PostgreSQL + pgvector. AI tables f raw migration (Prisma limitations). Dual indexes: HNSW (vector) + GIN (full-text). Polymorphic references f AI tables.

8. **No BFF proxy**: frontend calls API directly (Bearer JWT over HTTP). Clean separation → API reusable by any client.

9. **MoSCoW priority**: Must = essential, Should = important but not blocking, Could = nice to have. Story points = Fibonacci (1-8).

10. **CRISP-DM**: used inside Sprint 6 only (for ML-specific steps). Sub-methodology inside Scrum.

---

# Questions li ynajem el jury ysalek — w kif tjaweb

### Q1: "3lech variable sprint duration? F Scrum classique les sprints fixes."
**Jaweb**: F Scrum pure, sprints fixes (2-4 weeks). Ama f contexte mta3 PFE — equipe de 1 developer, timeline fixed (5 mois), w domains mkhtalfin drastiquement f complexity — variable duration ta3ti better planning precision. Sprint 3 (agile engine, 64 SP) impossible t7ottou f 2 weeks. El alternative kenet artificial splitting li ma y7acccmch dependency-wise. El value mta3 Scrum hiya el iterative delivery w ceremonies, mech specifically el fixed box.

### Q2: "3lech NestJS w mech Express.js wa7dou?"
**Jaweb**: Express léger w flexible ama ma yenforcich structure. M3a 10 domains, express project ywalli spaghetti ki yekber unless tedisiplini manually el architecture. NestJS y-enforce modular structure at framework level (modules, DI, decorators). Kol module automatically ystanda nafsou. W Swagger auto-generation, guards, interceptors — built-in. Pour monolith structuré, NestJS > Express.

### Q3: "3lech Prisma w mech TypeORM?"
**Jaweb**: Prisma ya3ti **typed client generated from schema** — compile-time safety 3la every query. TypeORM uses decorators w classes (Active Record / Data Mapper) ama type safety mteghir inconsistent. Plus, Prisma multi-file schema support khalletna norganisiw 55 models f 13 files by domain. W `prisma migrate deploy` idempotent w production-safe. El trade-off: Prisma less flexible for complex raw queries — ama 7allinaaha bel `$queryRaw` lel AI tables.

### Q4: "3lech PostgreSQL wa7dou w mech separate vector database (Pinecone, Weaviate)?"
**Jaweb**: Design decision clé. Ki el embeddings f nafs el DB mel domain data, retrieval ye9der ykoun **permission-scoped f plain SQL** (JOIN m3a project membership tables). M3a separate vector DB, lazem tsync permissions separately — complexity w security risk. Plus, operational simplicity: datastore wa7da barka to operate, backup, w secure. pgvector m3a HNSW indexes ya3ti performance kefya lel scale mte3na.

### Q5: "252 story points — kif 9ssthoum? Achkoun validated el estimates?"
**Jaweb**: Story points relative, mech absolute. L'estimation sar bel Fibonacci scale basé 3al complexity relative between stories (US m3a 8 SP = x4 complexity mel US m3a 2 SP). El validation saret iteratively: ba3d Sprint 1, velocity ta3ti feedback — ki Sprint 1 (41 SP f 3 weeks), hedha ya3ti velocity ~14 SP/week, li nesta3mlouha bech nvalidiw les estimates mta3 les sprints li jaw ba3d. El PO (Ahmed) validated priorities, ena 9dert complexity.

### Q6: "3lech monorepo (backend + frontend f même repo)?"
**Jaweb**: Pour PFE m3a developer wa7ed, monorepo ysahhal: git history wa7da, shared types potential, deployment coordonné. El separation logique (2 apps, 2 Dockerfiles, no shared code at runtime) ta3ti el benefits mta3 separation sans el overhead mta3 2 repos. Ki l'equipe tekber, ye9der yen9sm ama currently la simplicité te5dem.

### Q7: "El RBAC mte3ek — 120 permissions, 31 roles — est-ce que tested all combinations?"
**Jaweb**: El RBAC implemented as a **centralized catalogue** (constant wa7da f el code). El guard applied uniformly 3la every route — ya3ni ma tnajemch tzid endpoint jdid w tensa el authorization. Testing sar f 2 niveaux: (1) unit tests 3al guard logic, (2) manual testing b different roles during sprint reviews. El design y-minimize surface area: permission check centralized mech scattered.

### Q8: "Soft-delete lel users — 3lech mech hard delete?"
**Jaweb**: Soft-delete (deactivate) ya7fadh el data integrity. User li 3andou tasks, comments, time entries — hard delete ye9der ykassar foreign key constraints wella ykhalli orphaned records. Plus, HR ye9der reactivate account. Ama el user deactivated ma ye9derch ylogin, ma ya3melch actions — effectively "deleted" mel user perspective ama el data preserved.

### Q9: "Next.js 16 — kif gérit internationalization?"
**Jaweb**: Nesta3mliw **next-intl** library. El App Router structured ta7t `[locale]` dynamic segment. Kol translation f JSON files (en.json, fr.json). Zod schema factories take el translator function → validation messages localized aussi. El choix mta3 locale ykoun f URL (`/en/dashboard`, `/fr/dashboard`) = SEO-friendly w shareable.

### Q10: "Redis mawjoud f docker-compose ama not wired — 3lech dhrabtou?"
**Jaweb**: Included as placeholder lel future cache layer (session cache, query cache, rate limiting). Currently ma t7ajech: el scale mta3 TDG (~7 users) mech assez bech y-justify caching overhead. Distributed locking resolved bel `SELECT ... FOR UPDATE SKIP LOCKED` f Postgres — works fine f single-instance w even multi-instance. Ki l'app tetscale, Redis ywalli relevant. Better to have it f compose stack ready than to add it later.

### Q11: "Kif t-guarantee consistency bin el 2 apps (frontend w backend)? Mafamech shared types?"
**Jaweb**: Mafamech shared types at runtime (no monorepo packages). Ama consistency enforced b: (1) Swagger auto-generated mel backend → serves as contract. (2) Frontend DTOs manually aligned mel Swagger output. (3) Zod schemas f frontend validate response shapes. El trade-off: potential drift, ama f one-developer project hedha manageable. F team setup, ye9der yzid OpenAPI codegen bech y-automate el types.

### Q12: "El polymorphic pair (entityType + entityId) f AI tables — mech anti-pattern hedha? No FK constraint."
**Jaweb**: Yes, technically polymorphic associations sacrifient referential integrity at DB level. Ama f hedha el cas, el alternative hiya 5 separate embedding tables (one per entity type) — li tzid duplication w complexity f el retrieval queries. El mitigation: application-level validation + el write-path outbox (Chapter 4) y-guarantee li el references valid ki yetktbou. Plus, embeddings homa derived data (regenerable) — mech critical transactional data.

### Q13: "El confidence gate f el AI — kif y decide refuses? Chnou el threshold?"
**Jaweb**: Detailed f Chapter 4 ama el concept: ba3d retrieval, n9isou el **cosine similarity** bin el query embedding w el best retrieved chunk. Ki el score < threshold (calibrated experimentally), el copilot yrefuse — ma y-call el generation model 7atta. Hedha y-prevent hallucination at the source: if nothing relevant found, better to say "I don't know" than to generate from thin air.

### Q14: "Scrum m3a 1 developer — el daily stand-ups m3a man?"
**Jaweb**: Stand-ups kenouw m3a el supervisors (Ahmed w Mohamed) — mech daily literally ama frequent sync (2-3 times/week). El purpose mta3 stand-ups howa synchronization w unblocking. Sprint reviews w retrospectives sariw end of each sprint. El ceremonies adapted lel context ama el spirit preserved: iterative delivery, feedback, continuous improvement.

### Q15: "Kif gérit el trade-off bin feature completeness w internship deadline?"
**Jaweb**: MoSCoW priority + sprint scoping. "Must" features = non-negotiable per sprint. "Should" = important ama ye9drou yet-scoped out ki l time tight. "Could" = only ki famma slack. El sprint plan built from dependencies — el order ma yetbaddelch. W sprint reviews every sprint ta3ti early warning ki haja mech bech tousel f time.
