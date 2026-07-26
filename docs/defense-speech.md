# Defense Speech — Simple English, Slide by Slide

**How to use this:** Every slide has its own block. `[CLICK]` means press the right arrow
(or click) to show the next thing. Words in **bold** are the words to say a little louder
and slower. Sentences are short on purpose — say them slowly, breathe between them.
Total speaking time if you follow this script: **about 20–22 minutes.**

**Golden rule:** never read the slide. The slide shows the *what*, you say the *why*.

---

## Slide 1 — Title

> Good morning, members of the jury. My name is **Aymen BenHsan**.
> Today I will present my graduation project: **Tawer Management**.
> It is a full-stack team-management platform with an **AI copilot** that answers
> questions using the company's own data.
> I built this project during my internship at **Tawer Digital Group**, under the
> supervision of Mr. Ahmed Ben Arab, Mr. Ahmed Awedi and Mr. Mohamed Awedi.

*(Then click to Agenda.)*

---

## Slide 2 — Agenda (6 clicks, one per item)

> Here is the plan for today.
> **[CLICK]** First, the context: the company and the problem.
> **[CLICK]** Second, the requirements and the design of the solution.
> **[CLICK]** Third, the implementation — five sprints of development work.
> **[CLICK]** Fourth, the AI copilot — this is sprint six, and the most special part.
> **[CLICK]** Then testing and a short demo.
> **[CLICK]** And finally, the conclusion and future work.

---

## Slide 3 — Section 01 Hero (Context & Host Organization)

> Let's start with the context.

*(Just one line. Click through — the hero slide is a divider, don't stay long.)*

---

## Slide 4 — Host Organization (1 click to content)

> **[CLICK]** I did my internship at **Tawer Digital Group**, a digital agency in **Sfax**.
> The company has two units. **Tawer Dev** builds software. **Tawer Creative** does
> marketing and branding. I worked inside Tawer Dev.
> The company is young — two years — but it already has more than **30 clients**
> and **80 projects**.

---

## Slide 5 — The Problem (4 clicks, one per card)

> So, what is the problem? The team works with many separate tools —
> a chat app, spreadsheets, a task board, email. They are not connected.
>
> **[CLICK]** First problem: **fragmentation**. The work is spread across tools that
> do not talk to each other. People lose time searching for information.
> **[CLICK]** Second: **no unified permissions**. Every tool has its own access rules.
> There is no single answer to the question: "who can see what?"
> **[CLICK]** Third: **data sovereignty**. The company's internal data goes to
> external cloud services. The company wants to keep its data at home.
> **[CLICK]** And fourth: **no grounded AI**. There is no assistant that can answer
> questions using the company's own project data.

---

## Slide 6 — Existing Solutions (5 clicks)

> Before building something new, we studied the existing tools.
> **[CLICK]** We compared them on the features the company needs.
> **[CLICK]** **GitHub Projects** is good for code, but it covers almost none of these needs.
> **[CLICK]** **Jira** is strong for agile work, but it has no attendance, no monitoring,
> and it is not self-hosted in the version the company could use.
> **[CLICK]** **ClickUp** covers some needs partially, but not the AI part, and the data
> stays on external servers.
> **[CLICK]** So no existing tool checks all the boxes. **That is the gap Tawer
> Management fills** — and this is the column we built.

*(This last click reveals the purple Tawer Management column. Pause one second — let them see it.)*

---

## Slide 7 — Proposed Solution (2 clicks)

> **[CLICK]** So here is the idea in one sentence: no tool on the market combines the
> company's **workflows**, its **access model**, and **AI on its own data** — so we
> built one platform that does.
> **[CLICK]** Tawer Management gives three things: **unified operations** — ten work
> domains in one place. **One permission model** — a single access system for both
> business units. And **grounded AI** — a copilot that searches the company's data.
> In numbers: ten domains, 55 database models, 147 API endpoints.

---

## Slide 8 — Section 02 Hero (Requirements & Design)

> Now, how did we design it?

---

## Slide 9 — Requirements (clicks reveal priority cards, then the right column)

> **[CLICK]** We ordered the functional needs by priority.
> **[CLICK]** **P0 is the foundation**: users, teams, and the access-control model.
> Everything else depends on it.
> **[CLICK]** **P1 is delivery management**: projects, the agile backlog, the Kanban board.
> **[CLICK]** **P2 is daily operations**: to-dos, attendance, calendar, reminders.
> **[CLICK]** **P3 is operations and intelligence**: notifications, server monitoring,
> and the AI copilot.
> **[CLICK]** On the right side, the non-functional priorities: **security** with
> centralized role-based access control, **data sovereignty** — self-hosted,
> **performance**, and the platform is fully **bilingual**, English and French.

---

## Slide 10 — Methodology: Why Scrum (clicks reveal 3 cards)

> **[CLICK]** For the method, we chose **Scrum**.
> **[CLICK]** Why? First, **incremental delivery** — every sprint gives a working piece
> of the platform.
> **[CLICK]** Second, **continuous feedback** — we reviewed each module with the company.
> **[CLICK]** Third, **adaptive priorities** — the AI sprint at the end could use the
> real work history created by the earlier sprints.

---

## Slide 11 — Six-Sprint Roadmap (clicks walk the 6 sprints)

> Here is the full roadmap: **252 story points**, **21 weeks**, **6 sprints**.
> **[CLICK]** Sprint one: foundations and authentication.
> **[CLICK]** Sprint two: projects and membership.
> **[CLICK]** Sprint three: the agile backlog and tasks — the biggest one, 64 points.
> **[CLICK]** Sprint four: the productivity suite.
> **[CLICK]** Sprint five: communication and operations.
> **[CLICK]** Sprint six: the AI copilot and estimation.
> The Scrum team was small: the CEO as product owner, the CTO as technical
> supervisor, and myself as the development team.

*(Don't read every sprint's numbers — the labels are on screen.)*

---

## Slide 12 — Architecture (3 clicks)

> **[CLICK]** The architecture has three layers.
> On the left, the **presentation layer**: a Next.js application in the browser.
> Everything sits under one **language segment**, with two areas — one for guests
> (login, register) and one for the dashboard. Each feature folder there
> **mirrors a module of the API**, so the two sides have the same shape.
> Server data is cached with TanStack Query, small UI state with Zustand, and
> forms are validated with Zod — in both languages.
> It talks to the API with REST and JWT tokens.
> In the middle, the **application layer**: a NestJS REST API — controller, service,
> repository. 147 endpoints.
> **[CLICK]** And here is the important choice: the **AI copilot is not a separate
> service**. It is a module **inside** the same API. And both use **one PostgreSQL
> database** — with the pgvector extension for vector search.
> On the right, the only external service: **Gemini**, for embeddings and text generation.
> **[CLICK]** We call this a **modular monolith**. It is simple to deploy, simple to
> secure, and one database holds both the business data and the vectors.

---

## Slide 13 — Why a modular monolith (2 clicks)

> A jury question I expect: **why one application, and not microservices?**
>
> On the left, what splitting would have cost us. I was **one developer for
> 21 weeks** — every service you add is one more thing to deploy and keep in
> sync. Our **permission model would break apart**: 31 roles and 120
> permissions guard ten domains, so every service would have to re-implement
> them. And our **55 tables are joined by foreign keys** — splitting them turns
> simple joins into network calls.
>
> **[CLICK]** On the right, what we get instead. The **boundaries still exist**,
> but in the code: NestJS modules, and the same controller–service–repository
> split in every feature. There is **one place to secure** — a single guard on
> every route, and the AI copilot inherits that same filter. And it is **one
> thing to self-host**, which is what the company asked for.
>
> **[CLICK]** So: modular, not monolithic by accident. The seams are already
> there, so a domain can be split out later if the load ever needs it.
> And the honest cost today: one deploy unit, one failure domain.

---

## Slide 14 — Use Cases (3 clicks, one per role)

> Quickly, the main use cases by role.
> **[CLICK]** A **manager** plans projects, manages the backlog, and follows the team.
> **[CLICK]** A **team member** works on tasks, logs time, and asks the copilot.
> **[CLICK]** **Executives and admins** manage users and roles, watch the portfolio,
> and monitor the servers.

*(Keep this slide short — 30 seconds. The diagrams speak for themselves.)*

---

## Slide 15 — Tech Stack (clicks reveal 4 cards)

> **[CLICK]** The stack, in one view.
> **Frontend**: Next.js and React, TypeScript, bilingual.
> **[CLICK]** **Backend**: NestJS — a structured framework with guards for security
> and Prisma for the database.
> **[CLICK]** **Storage**: PostgreSQL plus pgvector — one store for everything,
> running in Docker.
> **[CLICK]** **AI**: Gemini for embeddings and generation. No GPU servers needed —
> that is what made a full RAG copilot possible in one sprint.

---

## Slide 16 — Section 03 Hero (Implementation, Sprints 1–5)

> Now the implementation. Five sprints, 210 story points — the backbone of the platform.

---

## Slide 17 — Sprint 1: Foundations & Auth (3 tabs)

> **[CLICK]** Sprint one built the foundation: **31 roles**, about **120 permissions**,
> and today 138 routes protected by them.
> **[CLICK]** The architecture is layered: every request passes through guards —
> first "who are you?", then "what can you do?".
> **[CLICK]** Here is the authorization flow. A request brings a JWT token.
> We check the token, then the permission, then the **scope** — for example, a manager
> only sees his own business unit. If any check fails: 401 or 403.
> One design choice: when the short-lived token expires, a **refresh token** gets a
> new one automatically — the user does not log in again.

---

## Slide 18 — Sprint 2: Projects & Membership (3 tabs)

> **[CLICK]** Sprint two: projects. A project is the **aggregate root** — the object
> that owns everything else: members, sprints, tasks.
> **[CLICK]** A project has a **lifecycle** — from creation to completion, with rules
> about who can move it forward.
> **[CLICK]** And **invitations**: a manager invites by email. The link has a token
> that expires in seven days, and only the invited email can accept it —
> so an invite cannot be stolen by another account.

---

## Slide 19 — Sprint 3: Agile Backlog (4 tabs)

> **[CLICK]** Sprint three, the biggest: the agile backlog.
> **Epics, sprints, and milestones** — the planning objects.
> **[CLICK]** The **sprint lifecycle**: planned, active, completed — with capacity
> in story points.
> **[CLICK]** The platform computes **metrics** automatically: burndown charts,
> velocity, and a Gantt view. *(Click through the screenshots if there is time.)*
> **[CLICK]** And here is the class diagram — one project owns its epics, sprints and
> milestones. This diagram matches the real database schema exactly.

---

## Slide 20 — Sprint 3, part two: Tasks & Kanban (6 tabs — move fast, ~90 seconds total)

> **[CLICK]** Still sprint three — its second module: the task engine and the Kanban board.
> The columns are **data-driven** — they come from the database, not from the code.
> **[CLICK]** The board has **rules**: which column a task can move to…
> **[CLICK]** …and every **move is validated on the server** — the interface cannot
> cheat the workflow.
> **[CLICK]** The task detail: labels, dependencies with cycle protection, subtasks.
> **[CLICK]** The class diagram for tasks.
> **[CLICK]** And the **capability tiers**: seven levels of what each role can do —
> from "read and comment" for everyone, to "move any card" for managers.
> One special rule: the **assignee** can always move his own card.

---

## Slide 21 — Sprint 4: Productivity Suite (4 tabs)

> **[CLICK]** Sprint four added four daily-work modules: personal **to-dos**,
> **attendance**, **calendar and events**, and **reminders**.
> **[CLICK]** Reminders have a full lifecycle — created, scheduled, sent.
> **[CLICK]** They are delivered through the notification system — one shared backbone.
> **[CLICK]** Attendance has honest rules: if you forget to check out, a nightly job
> closes your session — but it never counts time after your scheduled shift.

---

## Slide 22 — Sprint 5: Communication & Operations (3 tabs)

> **[CLICK]** Sprint five: the communication layer. **Notifications** go to four channels:
> in-app, email, push, and Telegram. One shared entry point creates them —
> seven modules call the same function.
> **[CLICK]** **Infrastructure monitoring**: the platform pings the company's servers
> every minute and alerts the assigned managers when something is down.
> **[CLICK]** Under the hood, alerts use the **outbox pattern**: the alert is first
> written to the database, then a sender job delivers it. If the sender crashes,
> nothing is lost — the row is still there. This makes delivery reliable.

---

## Slide 23 — Section 04 Hero (AI Copilot)

> Now the part I am most proud of: the **AI copilot**, sprint six.

---

## Slide 24 — AI Methodology: CRISP-DM (2 clicks)

> **[CLICK]** For the AI work we did not improvise. We used **CRISP-DM** — the standard
> process for data projects — as a sub-process inside the Scrum sprint.
> Business understanding, data understanding, data preparation, modeling, evaluation.
> **[CLICK]** One honest note: there is **no deployment phase** — we do not train or
> ship a model. Gemini is behind a managed API. **Our contribution is the retrieval,
> the grounding, and the security around it.**

---

## Slide 25 — Why RAG, and which RAG (2 clicks)

> Before the architecture, one question the jury may ask: **why RAG at all?**
> We had three options.
> **Fine-tune the model?** Then every new task means retraining. The answers
> have no sources. And our data would leave the company. No.
> **Put everything in the prompt?** The company data is far too big for that,
> we pay for every call, and there is no way to apply permissions. No.
> **Retrieve, then generate** — this is RAG. The data is always fresh, every
> claim has a source, and the permission filter runs inside the search query.
>
> **[CLICK]** Then: which kind of RAG? There is a family of them.
> We chose **Hybrid RAG** — dense vectors **and** keyword search, combined.
> **[CLICK]** And here is why we did not take the others.
> **Graph RAG** builds a graph of relations — but our relations are already in
> SQL. **Agentic RAG** turns retrieval into a multi-step plan — too slow and
> too expensive per answer. **Corrective RAG** grades and retries — we prefer
> to refuse honestly. **Multimodal RAG** indexes images and tables — our
> content is text.
>
> The reason Hybrid wins for us is simple: project work is **half normal
> sentences, half codes**. A code like NDF-24 means nothing to a vector model.
> And pure keyword search misses a question asked in different words.
> So we run both and merge them with a method called **RRF**.
> And we did not just assume it: on our own test set, hybrid raised the score
> **MRR from 0.42 to 0.73**, and **Recall-at-1 from 0.22 to 0.73**, compared to
> vectors alone.

*(If a jury member asks "what is RRF?": it is a simple, standard formula that
merges two ranked lists — an item ranked high by either search moves to the top.)*

---

## Slide 26 — RAG Architecture (4 tabs)

> **[CLICK]** How does the copilot know the company's data? First, the **indexing
> pipeline**. Every time someone writes a task, a comment, a sprint — the change is
> queued and embedded into vectors, stored in the same PostgreSQL.
> If embedding fails, it retries with backoff — no write is ever silently lost.
> **[CLICK]** Then **retrieval and generation**: when you ask a question, we search
> two ways at the same time — **vector search** for meaning, **lexical search** for
> exact words like task codes. We merge the results, rerank them, and give the best
> ones to Gemini, which writes an answer **with citations**.
> **[CLICK]** The **data model**: embeddings live next to the business data — same
> database, same transactions.
> **[CLICK]** And the **client experience**: the answer streams token by token, and
> every claim has a **citation chip** — click it, and it opens the exact task or
> comment it came from. If the retrieval finds nothing good, the copilot says
> honestly: "I don't have enough information."

---

## Slide 27 — Task Estimation (1 click)

> **[CLICK]** The second AI feature: **task effort estimation**.
> The idea is called **reference-class forecasting**: to estimate a new task,
> find **similar completed tasks** and look at what actually happened.
> We use k-nearest-neighbours on the embeddings, scoped to the same project.
> The result: mean error of about **two hours**, and **67% of estimates within
> ±25%** — up from 44% for the naive baseline.
> And it is **never a bare number**: the user always sees which past tasks
> the estimate is based on.

---

## Slide 28 — AI Security (2 clicks)

> **[CLICK]** Security was the hardest question: the copilot must **never** show you
> data you are not allowed to see.
> Our answer: the permission filter is **inside the SQL query itself**.
> Rows outside your scope are never returned, never ranked, never sent to the LLM.
> It is not checked after — it is **impossible by construction**.
> **[CLICK]** Around that: endpoint RBAC, prompt-injection separation, input validation,
> and no SQL-injection surface. And one honestly disclosed limit: access control is
> at the **project level**, not per task — same as the rest of the platform today.

---

## Slide 29 — AI Evaluation (3 tabs)

> **[CLICK]** We measured everything. **Retrieval**: with a gold set of questions,
> hybrid search beats vector-only search clearly.
> **[CLICK]** **Answer quality**: an LLM judge scored faithfulness and citation
> precision, plus manual checks — and **zero cross-role leaks** in the tests:
> the CEO sees six projects, an intern sees one.
> **[CLICK]** **Estimation accuracy**: this is the leave-one-out test over completed
> tasks. Size-aware k-NN reaches **67% within ±25%** — the interesting finding is
> that text similarity alone carries **no effort signal**; normalizing by story
> points is what makes it work.

---

## Slide 30 — Capstone (1 click)

> **[CLICK]** The whole AI package touches the rest of the platform in only one place:
> a one-line, fire-and-forget call. **High cohesion inside, loose coupling outside.**
> You could remove the AI module and the platform still works.

---

## Slide 31 — Section 05 Hero (Testing & Demo)

> Before the demo — how do we know it works?

---

## Slide 32 — Testing (clicks reveal 3 cards)

> **[CLICK]** Three levels of testing.
> **Unit tests** on the services — the project lifecycle fully tested with mocks.
> **[CLICK]** **Integration and end-to-end tests** — the full permission matrix
> exercised against a real running app, not mocks.
> **[CLICK]** And **property-based tests** — hundreds of generated inputs per run
> for the Kanban rules and dependency logic, not a handful of hand-picked examples.
> The AI part has its own evaluation, which you just saw.

---

## Slide 33 — Demo

> **[CLICK]** And here is the platform in action.

*(Click the video frame — it opens full screen and starts. Click outside it, or
press Esc, to close. Runs 7 min 34 s.)*

**Do not narrate over it.** The video explains itself: each of the six sections
opens with a title card, and every feature carries an on-screen caption. Let it
play and stay quiet — talking over the captions makes both harder to follow.

*(What it covers, in order — useful if the jury interrupts and you need to say
where you are, or to jump back to a moment during questions:)*

| # | Section | Shows |
|---|---------|-------|
| 01 | Access & Projects | registration, sign-in, attendance check-in, UI customisation, filters, project creation, email invitation |
| 02 | Agile Delivery | sprints, epics, task detail, milestones & Gantt, Kanban valid move **and** rejected move, capacity/velocity/burndown |
| 03 | Daily Work | personal to-dos, attendance, calendar, reminders |
| 04 | Team & Operations | notifications and channels, users & teams, server monitoring |
| 05 | AI Copilot | cited answer, citation deep-link, partial answer, refusal on no evidence, estimation, honest empty state |
| 06 | Access Control | non-member denied in the UI, then 403 Forbidden straight from the API |

*(Two moments worth pointing at if you are asked to defend a single thing:)*

> In section two, the board refuses an illegal move — that rule lives in the
> backend, so the interface cannot bypass it.
> In section six, the same request that the interface blocks also returns
> 403 from the API — the check is in the retrieval layer, not the screen.

---

## Slide 34 — Section 06 Hero (Outcomes)

> To conclude.

---

## Slide 35 — Conclusion (2 clicks)

> **[CLICK]** What was delivered: **one integrated platform** — ten domains, bilingual,
> behind one login. **One access model** — 31 roles across two business units.
> And **one measured AI layer** — grounded, cited, permission-safe.
> **[CLICK]** In numbers: ten domains, 55 models, 147 endpoints, six sprints.
> The known gaps are documented and prioritized — that is the next slide.

---

## Slide 36 — Perspectives (clicks reveal 3 cards)

> **[CLICK]** Three honest next steps.
> **[CLICK]** **Human evaluation**: today the AI is judged by gold sets and an LLM
> judge; the next step is real user sessions.
> **[CLICK]** **Hardening**: a prioritized security and testing backlog already
> exists in the report.
> **[CLICK]** **Deployment maturity**: CI/CD and container orchestration for
> production.

---

## Slide 37 — Thank You

> Thank you for your attention. I am ready for your questions.

---

# Likely Jury Questions — Short Simple Answers

**Q: Why did you build your own tool instead of using Jira?**
> Jira covers the agile part only. The company also needs attendance, monitoring,
> calendar, and an AI grounded in its own data — no single tool has all of it,
> and the company wants its data self-hosted.

**Q: Why a monolith and not microservices?**
> One small team, one deployment, one database. Microservices add network calls,
> more servers, and more failure points — with no benefit at this scale.
> The code is still modular inside, so we can split it later if needed.

**Q: Why PostgreSQL for vectors and not a vector database?**
> pgvector keeps vectors **next to** the business data. One transaction, one backup,
> and — most important — the permission filter is one SQL WHERE clause.
> A separate vector database would need to duplicate the permission logic.

**Q: What happens if Gemini is down?**
> The copilot returns an error message, but the platform is not affected —
> the AI is an optional module. Indexing retries automatically with backoff.

**Q: How do you prevent the AI from leaking data?**
> The search query itself filters by the user's allowed projects. Data outside the
> scope never leaves the database, so the model can never see it. We tested it:
> zero cross-role leaks.

**Q: Is the estimation reliable?**
> It is honest. Mean error about two hours, 67% within ±25% — and it always shows
> its evidence, the similar past tasks. It suggests; the human decides.

**Q: What was the hardest part?**
> The permission system. 31 roles and 120 permissions across every module —
> and the AI had to respect all of it. That is why it is centralized in one place,
> with one guard per route.

**Q: Why no Redis? Most stacks this size use it for caching and locking.**
> We looked at it for exactly those two jobs and decided against both. Locking is
> a real requirement — a dozen per-minute cron jobs that must each run exactly once
> across replicas — but PostgreSQL already answers it with SELECT ... FOR UPDATE
> SKIP LOCKED, with crash-safe expiry and no second datastore to deploy, secure and
> monitor. Caching we did not need: the query volume of a seven-person agency does
> not justify the invalidation complexity a cache adds. The rule we applied was to
> add infrastructure when a measured problem demands it, not in anticipation. If
> read volume grows, Redis is the natural addition, and the lock lives behind a
> service that could adopt it without touching any caller.

---

# Delivery Tips (read once, then forget)

- Speak **slower than feels natural**. Non-native listeners follow slow speech better too.
- At each `[CLICK]`, click **first**, wait half a second, **then** speak.
- If you forget a sentence — look at the slide title and say what it means. Never apologize.
- Total ~125 clicks. Practice the click rhythm twice, especially the tab slides (19 and 24).
- The heroes (section dividers) are breathing points: one sentence, click on.
- If time runs short, compress slides 13 (use cases) and 20 (productivity) — never
  compress 24–27 (the AI part is your differentiator).
