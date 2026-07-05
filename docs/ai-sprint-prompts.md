# AI Copilot — Sprint Prompts

Copy-paste one block per session. Each is self-contained for a **fresh, cold session** (no memory of the
planning conversation). Do them **in order**, one branch at a time, merging each into `master` before
starting the next — later sprints assume earlier ones are merged.

**Source of truth:** every prompt tells the agent to read `docs/ai-copilot-implementation-plan.md` first.
Keep that file in the repo; it is the spec each sprint builds against.

Sequence:
1. Enriched seed data
2. M0 — Vector foundations (pgvector + embedding pipeline)
3. M1 — Feature E: retrieval-based estimation
4. M2 — Feature A: RAG copilot core (grounded Q&A + citations)
5. M3 — Streaming + incremental indexing
6. M4 — Evaluation harness
7. M5 — Stretch: hybrid search + reranker

> The common preamble (stack, provider, conventions) is embedded in **every** block, so you don't need to
> add anything — just paste and go.

---

## Sprint 1 — Enriched seed data ✅ DONE (superseded)

> **Status: complete.** `prisma/seed.ts` was fully rewritten into a demo-ready Tunisian dataset (Tawer
> digital agency) that already exceeds this sprint's original targets: 16 users across all roles, 6
> projects, a richly-populated flagship AGILE project ("Nadhif"), 5 sprints, 4 epics, 3 milestones, **53
> tasks incl. 43 completed with realistic varied `actualHours`**, 8 decision-bearing comments, dependencies,
> labels, task time entries, work sessions, personal tasks, events, notifications, servers, and 10 reminders
> across every entity type/channel/status. The seed **wipes the DB first**, so `npm run prisma:seed` is
> repeatable. **Skip this sprint — start at Sprint 2.** (Original prompt kept below for reference only.)

~~~text
You are working on a final-year engineering PFE: a project-management web app.
Backend: NestJS + Prisma 7 (Postgres via @prisma/adapter-pg) in `tdg-management-api-backend/`.
Frontend: Next.js + React Query in `tawer-management-frontend/`.

There is a complete build spec at `docs/ai-copilot-implementation-plan.md` — READ IT FIRST, especially
"§9 Data seeding". It is the source of truth for this whole initiative. This is SPRINT 1 of that plan.
Match existing code conventions exactly. Explore before you write. Stay strictly within this sprint's scope.

GOAL
Enrich the database seed so later AI sprints (retrieval-based estimation, RAG, and the evaluation harness)
have realistic data to work with. Today's seed is too thin (≈18 tasks, 2 sprints), which would make
estimation k-NN and evaluation metrics meaningless.

BRANCH
Create and switch to a new branch off up-to-date `master`: `feat/ai-seed-data`.

EXPLORE FIRST
- `tdg-management-api-backend/prisma/seed.ts` (and anything it imports) — understand the existing seed
  structure, how users/projects/sprints/tasks/comments are created, and the `prisma:seed` npm script.
- `tdg-management-api-backend/prisma/schema/agile.schema.prisma` — Task fields you must populate:
  `storyPoints`, `estimatedHours`, `actualHours`, `status`, `completedAt`, `type`, `priority`,
  `description`, plus `TaskComment`.

BUILD
Extend the seed (do NOT rewrite unrelated parts; add to it) so that, across at least 2 projects:
- There are **40–60 completed tasks** (`status = 'DONE'`, `completedAt` set) with **realistic, VARIED**
  `estimatedHours` vs `actualHours` (some over-, some under-estimated — not a constant ratio) and sensible
  `storyPoints`. This variety is what makes k-NN estimation and its evaluation meaningful.
- Tasks have **substantive multi-sentence `description`s** in the same professional/software domain as the
  existing data (so semantic retrieval looks real, not random filler).
- Several tasks have **comment threads** (`TaskComment`) where a genuine "decision" is stated in prose
  (e.g. "We decided to cap retries at 3 because…"). These are what the RAG copilot will later retrieve and
  cite — make ~5–8 of them clearly decision-bearing.
- At least **2 completed sprints** with their tasks, so velocity/burndown context exists.
Keep everything plausible and consistent with existing roles/business units/project types. Seed must be
idempotent-friendly in the same way the current seed is (follow its existing reset/create pattern).

OUT OF SCOPE
No schema changes. No AI code, no pgvector, no new modules. Only `prisma/seed.ts` (and small seed helpers).

ACCEPTANCE / VERIFY
- `npm run prisma:seed` completes with no errors.
- Query the DB (or add a temporary count log) to confirm: ≥40 tasks with `status='DONE'` AND non-null
  `actualHours` AND non-null `estimatedHours`; ≥5 decision-bearing comments; ≥2 completed sprints.
- Report the final counts. Then commit on `feat/ai-seed-data` with a clear message.
~~~

---

## Sprint 2 — M0: Vector foundations (pgvector + embedding pipeline)

~~~text
You are working on a final-year engineering PFE: a project-management web app.
Backend: NestJS + Prisma 7 (Postgres via @prisma/adapter-pg) in `tdg-management-api-backend/`.
The AI provider is Google Gemini via the ALREADY-WIRED `@google/genai` SDK: see the `GEMINI_CLIENT`
provider and `GeminiService` in `src/common/gemini/`, with `GEMINI_API_KEY` already in `.env`. Do NOT
introduce Anthropic or OpenAI.

There is a complete build spec at `docs/ai-copilot-implementation-plan.md` — READ IT FIRST, especially
"§3 Data model additions" and "§4.1 EmbeddingService" and "§4.2 IndexingService". It is the source of
truth. This is SPRINT 2 (milestone M0). Sprint 1 (enriched seed data) is already merged. Match existing
conventions exactly. Explore before writing. Stay within scope.

GOAL
Stand up the vector-search foundation: pgvector, the embedding tables, a Gemini embedding service, a raw
ANN query path, and a one-shot backfill that embeds all existing project content. Everything later builds
on this.

BRANCH
Create and switch to a new branch off up-to-date `master`: `feat/ai-vector-foundations`.

EXPLORE FIRST
- `prisma/schema/` (all files), `common/prisma/service/prisma.service.ts` (Prisma on the pg adapter),
  the `prisma:migrate` / `prisma:generate` npm scripts.
- `common/gemini/gemini.module.ts` + `services/gemini.service.ts` — reuse the `GEMINI_CLIENT` DI provider
  and the logging pattern (`BackgroundActivitiesLoggerService`).
- A representative NestJS module (e.g. `src/tasks/`) for the controller/service/repository/module layout,
  and `src/app.module.ts` for how modules are registered.

BUILD
1. Add pgvector: a migration that runs `CREATE EXTENSION IF NOT EXISTS vector;` and, after the embedding
   table is created, an HNSW index (`USING hnsw (embedding vector_cosine_ops)`), written as raw SQL in the
   migration (Prisma won't emit it).
2. New Prisma models in a new `prisma/schema/ai.schema.prisma` exactly as specified in §3.2:
   `DocumentEmbedding` (with `embedding Unsupported("vector(1536)")`, `contentHash`, metadata),
   `IndexOutbox`, `CopilotQueryLog`, and the enums `EmbeddingEntityType`, `IndexOp`, `OutboxStatus`.
   (This sprint only needs `DocumentEmbedding` + `IndexOutbox` to function; create all three models +
   enums now so later sprints don't re-migrate.)
3. New `src/ai/` module (`AiModule`, registered in `app.module.ts`, importing `GeminiModule`,
   `PrismaModule`, `LoggerModule`) with:
   - `services/embedding.service.ts`: `embed(text, taskType)` and `embedBatch(...)` using
     `googleGenAI.models.embedContent` with model `gemini-embedding-001`, `outputDimensionality: 1536`,
     correct `taskType` (`RETRIEVAL_DOCUMENT` for docs, `RETRIEVAL_QUERY` for queries), **L2-normalize the
     returned vector** (required for reduced dims), exponential-backoff retry on 429/5xx, and content
     hashing (sha256) so unchanged content is skipped.
   - `services/indexing.service.ts`: chunking per the strategy in §4.2 (Task, TaskComment, Epic, Milestone,
     Sprint), and `upsertEmbedding` / `deleteEmbedding` writing to `DocumentEmbedding`.
   - `repositories/embedding.repository.ts`: raw-SQL upsert/delete of the vector column, plus a
     `searchVector(queryVec, projectIds, filters, k)` using `$queryRaw` with the pgvector `<=>` cosine
     operator (this is exercised in verification; full retrieval service comes in a later sprint).
   - `jobs/`-free for now (the cron sweeper is a later sprint) — but do provide a **backfill script**
     (an npm script mirroring `prisma:seed`, e.g. `ai:backfill`) that embeds all existing tasks, comments,
     epics, milestones, sprints into `DocumentEmbedding`.
4. A tiny temporary/admin verification path (a guarded `POST /ai/admin/reindex` OR a script) is fine for
   proving it works; keep it minimal.

OUT OF SCOPE
No estimation endpoint, no copilot/RAG, no streaming, no incremental outbox-enqueue hooks in task/comment
services, no frontend. Just the foundation + backfill + a way to prove ANN works.

ACCEPTANCE / VERIFY
- `prisma:generate` + `prisma:migrate` succeed; pgvector extension and HNSW index exist in the DB.
- Running the backfill embeds all content; `SELECT count(*) FROM "DocumentEmbedding"` is > 0 and matches the
  content volume.
- A `searchVector` call for a query embedding returns **semantically sensible** nearest neighbors (verify:
  embed a query like "authentication login bug", confirm the top results are actually about that). Report
  the top-3 for one query as proof.
- App builds and boots. Commit on `feat/ai-vector-foundations`.
~~~

---

## Sprint 3 — M1: Feature E, retrieval-based estimation

~~~text
You are working on a final-year engineering PFE: a project-management web app.
Backend: NestJS + Prisma 7 (Postgres via @prisma/adapter-pg) in `tdg-management-api-backend/`.
Frontend: Next.js + React Query in `tawer-management-frontend/`.
AI provider is Google Gemini via the already-wired `@google/genai` SDK (`GEMINI_CLIENT` provider +
`GeminiService` in `src/common/gemini/`). Do NOT introduce Anthropic or OpenAI.

Read `docs/ai-copilot-implementation-plan.md` FIRST — especially "§4.3 AiAccessService",
"§4.6 EstimationService", and "§5 Frontend". Source of truth. This is SPRINT 3 (milestone M1). Sprints 1–2
(seed data; vector foundations = pgvector, `DocumentEmbedding`, `EmbeddingService`, backfill) are already
merged and available. Match conventions. Explore before writing. Stay in scope.

GOAL
Ship the retrieval-based estimation assistant: when a user drafts a task, suggest an effort estimate and
story points grounded in the ACTUAL outcomes (`actualHours`) of the most similar COMPLETED tasks, shown
with the neighbor tasks as evidence. Permission-scoped.

BRANCH
Off up-to-date `master`: `feat/ai-estimation`.

EXPLORE FIRST
- `src/ai/` (from Sprint 2): `EmbeddingService`, `EmbeddingRepository.searchVector`, `DocumentEmbedding`.
- `src/tasks/services/tasks.service.ts` around line 452 — `canAccessProject`, `isExecutive`,
  `hasExecutiveProjectAccess`, `findMembership`. Extract/reuse this to compute the set of project IDs a user
  may retrieve from.
- The task create/edit form on the frontend (`tawer-management-frontend/src/modules/projects/...` task
  form components) and an existing `services/api/*.ts` (e.g. `project-tasks.ts`) for the JWT +
  `refreshToken` + `GET/POST` (`@/lib/http-methods`) + React Query patterns.

BUILD
Backend:
- `services/ai-access.service.ts`: `allowedProjectIds(userId, roles): Promise<string[]>` — executives get
  business-unit-scoped project ids; others get their `ProjectMember` project ids. Reuse existing logic;
  don't duplicate business rules divergently.
- `services/estimation.service.ts`: embed the draft (`RETRIEVAL_QUERY`); retrieve k nearest neighbors that
  are `entityType=TASK` joined to `Task.status='DONE'` and `actualHours IS NOT NULL`, filtered to the
  user's allowed projects (prefer the current project; **fall back to same businessUnit** when the project
  is too sparse — this matters given data volume). Compute a **similarity-weighted median** predicted-hours
  and an **IQR range**, plus a weighted-mode story-point suggestion. Return the **neighbor tasks as
  evidence** (key, title, actualHours, similarity).
- `controller/ai.controller.ts` + DTOs: `POST /ai/estimate` `{ projectId, title, description }` →
  `{ predictedHours, rangeLow, rangeHigh, suggestedPoints, neighbors[] }`. Guard it exactly like existing
  task routes (`@UseGuards(HasPermissionGuard)` + appropriate `@Permissions`). If a supplied `projectId`
  isn't in the allowed set → 403 (reuse `ForbiddenCustomException`).

Frontend:
- `modules/ai/services/api/estimation.ts` (JWT + refreshToken retry pattern) and
  `modules/ai/hooks/use-task-estimate.ts` (React Query, debounced input).
- `modules/ai/components/estimate-suggestion.tsx`: in the create/edit task form, as the user types
  title/description (debounced), show "≈ Xh (low–high) · N pts — based on TASK-a, TASK-b, TASK-c" with a
  one-click "apply" that fills `estimatedHours` and `storyPoints`. Handle empty/insufficient-neighbors
  state honestly.

OUT OF SCOPE
No copilot/Q&A, no streaming, no incremental indexing hooks, no evaluation scripts, no hybrid search.

ACCEPTANCE / VERIFY
- With both servers running against the real backend, drafting a task returns a data-backed estimate with
  real neighbor tasks; "apply" fills the fields.
- Permission scope holds: a user cannot get an estimate drawing on a project they can't access (verify by
  reasoning about `allowedProjectIds`, and ideally a second-account check).
- App builds; no console errors. Commit on `feat/ai-estimation`.
~~~

---

## Sprint 4 — M2: Feature A, RAG copilot core

~~~text
You are working on a final-year engineering PFE: a project-management web app.
Backend: NestJS + Prisma 7 (Postgres via @prisma/adapter-pg) in `tdg-management-api-backend/`.
Frontend: Next.js + React Query in `tawer-management-frontend/`.
AI provider is Google Gemini via the already-wired `@google/genai` SDK (`GEMINI_CLIENT` +
`GeminiService` in `src/common/gemini/`); embeddings model `gemini-embedding-001`, generation model
`gemini-2.5-flash`. Do NOT introduce Anthropic or OpenAI.

Read `docs/ai-copilot-implementation-plan.md` FIRST — "§4.4 RetrievalService", "§4.5 CopilotService",
"§4.7 Controller", "§5 Frontend", "§7 Security". Source of truth. This is SPRINT 4 (milestone M2).
Sprints 1–3 (seed; vector foundations; `AiAccessService` + estimation) are merged and available. Match
conventions. Explore first. Stay in scope.

GOAL
Ship the permission-scoped RAG copilot: ask a natural-language question about a project and get an answer
GROUNDED ONLY in retrieved app content, WITH clickable citations to the exact task/comment used. Start
NON-streaming (JSON) so it's testable; streaming is the next sprint.

BRANCH
Off up-to-date `master`: `feat/ai-copilot-core`.

EXPLORE FIRST
- `src/ai/`: `EmbeddingService`, `EmbeddingRepository.searchVector`, `AiAccessService.allowedProjectIds`,
  `DocumentEmbedding`, `CopilotQueryLog`.
- `common/gemini/services/gemini.service.ts` — reuse/extend for a grounded generation call.
- The project-detail page/tabs on the frontend (where analytics/tasks tabs live) for where the copilot
  panel should mount; an existing `services/api/*.ts` for the fetch/JWT/refresh pattern.

BUILD
Backend:
- `services/retrieval.service.ts`: given a question + user, resolve `allowedProjectIds`, embed the question
  (`RETRIEVAL_QUERY`), run permission-scoped `searchVector` (filter `projectId = ANY(allowedIds)` and, if a
  `projectId` is provided and allowed, to that project), return top-k candidates with scores. If the top
  score is below a confidence threshold, return "insufficient context" so the caller can refuse.
- `services/copilot.service.ts`: build a grounded prompt that numbers the retrieved chunks `[1..n]`,
  instructs the model to answer ONLY from them, cite as `[n]`, and refuse ("I don't have information on
  that in this project") when context is weak. Call `gemini-2.5-flash`. Parse `[n]` markers back to real
  `entityId`s → structured `citations[]`. Persist a `CopilotQueryLog` row (question, retrievedIds, topScore,
  answer, citationsCount, tokens, latency).
- `controller/ai.controller.ts`: `POST /ai/copilot/query` `{ projectId?, question }` →
  `{ answer, citations[] }`. Guard like existing routes; 403 on out-of-scope `projectId`.

Frontend:
- `modules/ai/services/api/copilot.ts`, `modules/ai/hooks/use-copilot.ts` (React Query).
- `modules/ai/components/copilot-panel.tsx` mounted on the project-detail page: question box → answer →
  `citation-chip.tsx` chips that deep-link to the referenced task/comment. Render the honest
  low-confidence/refusal state.

OUT OF SCOPE
No SSE streaming (next sprint), no incremental outbox hooks / cron (next sprint), no hybrid/reranker
(later), no faithfulness-judge scoring yet (leave the `faithfulnessScore` column null for now), no eval
scripts.

ACCEPTANCE / VERIFY
- Asking a question about a seeded project returns a grounded answer with citation chips that resolve to
  real tasks/comments (use one of the decision-bearing comments from the seed as a test question).
- Permission scope: verify (by reasoning + ideally a second account) that a user cannot get answers drawing
  on projects they can't access, and that an out-of-scope `projectId` 403s.
- A weak/irrelevant question triggers the refusal path rather than a hallucinated answer.
- App builds; no console errors. Commit on `feat/ai-copilot-core`.
~~~

---

## Sprint 5 — M3: Streaming + incremental indexing

~~~text
You are working on a final-year engineering PFE: a project-management web app.
Backend: NestJS + Prisma 7 (Postgres via @prisma/adapter-pg) in `tdg-management-api-backend/`.
Frontend: Next.js + React Query in `tawer-management-frontend/`.
AI provider is Google Gemini via `@google/genai` (`GEMINI_CLIENT` + `GeminiService` in
`src/common/gemini/`). Do NOT introduce Anthropic or OpenAI. `@nestjs/schedule` is already enabled
(`ScheduleModule.forRoot()` in `app.module.ts`).

Read `docs/ai-copilot-implementation-plan.md` FIRST — "§4.2 IndexingService (freshness)",
"§4.5 (streaming)", "§3.2 IndexOutbox". Source of truth. This is SPRINT 5 (milestone M3). Sprints 1–4
(seed; foundations; estimation; copilot core with `IndexOutbox` model already migrated) are merged. Match
conventions. Explore first. Stay in scope.

GOAL
Two polish upgrades that make the copilot feel real: (1) STREAM answers token-by-token over SSE; (2) keep
the vector index FRESH automatically as tasks/comments change, via an outbox + cron sweeper (no inline
latency on task save).

BRANCH
Off up-to-date `master`: `feat/ai-copilot-streaming`.

EXPLORE FIRST
- `src/ai/`: `CopilotService`, `RetrievalService`, `IndexingService`, `IndexOutbox` model.
- The task/comment write paths: `src/tasks/services/tasks.service.ts` create/update task + create comment
  (note how it already calls `AutoReminderService`/`NotificationsService` — enqueue alongside those), and
  the epic/milestone/sprint create/update/delete services.
- `common/gemini/services/gemini.service.ts` for a streaming generation call
  (`googleGenAI.models.generateContentStream`).
- The frontend `copilot-panel.tsx` / `use-copilot.ts` from Sprint 4.

BUILD
Streaming:
- Backend `GET /ai/copilot/stream` as an SSE endpoint (`@Sse()` or manual response streaming) that runs the
  same retrieve→ground pipeline as `POST /ai/copilot/query` but streams answer tokens via
  `generateContentStream`, then emits a final event carrying the structured `citations[]`. Still writes the
  `CopilotQueryLog` row at the end.
- Frontend: update `use-copilot.ts` / `copilot-panel.tsx` to consume the stream (EventSource or fetch
  reader) and render tokens progressively, attaching citation chips when the final event arrives.

Incremental indexing:
- In task create/update, comment create, and epic/milestone/sprint create/update/delete, enqueue an
  `IndexOutbox` row (UPSERT on write, DELETE on delete) — collapse repeated edits via the unique
  `(entityType, entityId)` constraint. Keep it a thin call; do not block the request on embedding.
- `jobs/index-sweeper.job.ts`: an `@Cron('*/1 * * * *')` that drains PENDING outbox rows in batches through
  `EmbeddingService` + `IndexingService.upsertEmbedding`/`deleteEmbedding`, marks DONE/FAILED with attempt
  counts and backoff. Add a nightly `@Cron` reconciliation that re-embeds anything whose source `updatedAt`
  is newer than its embedding's `updatedAt`.

OUT OF SCOPE
No hybrid/reranker, no evaluation scripts, no faithfulness scoring. Only streaming + freshness.

ACCEPTANCE / VERIFY
- The copilot panel streams the answer progressively, then shows citations.
- Edit a task's description (or add a decision-bearing comment), wait ≤1–2 minutes, then ask a question
  whose answer depends on that edit — the copilot reflects it (proving the outbox+cron re-indexed it).
  Report this end-to-end check.
- Deleting an entity removes it from retrieval. App builds; no console errors. Commit on the branch.
~~~

---

## Sprint 6 — M4: Evaluation harness

~~~text
You are working on a final-year engineering PFE: a project-management web app.
Backend: NestJS + Prisma 7 (Postgres via @prisma/adapter-pg) in `tdg-management-api-backend/`.
AI provider is Google Gemini via `@google/genai` (`GEMINI_CLIENT` + `GeminiService` in
`src/common/gemini/`); generation model `gemini-2.5-flash`. Do NOT introduce Anthropic or OpenAI.

Read `docs/ai-copilot-implementation-plan.md` FIRST — "§6 Evaluation harness" (and §4.5, §4.6 for what's
being measured). Source of truth. This is SPRINT 6 (milestone M4). Sprints 1–5 are merged: seed data,
vector foundations, estimation (`EstimationService`), copilot (`RetrievalService`/`CopilotService`,
`CopilotQueryLog`), streaming + incremental indexing. Match conventions. Explore first. Stay in scope.

GOAL
Build the offline evaluation harness that turns this from "a feature" into "a measured system" — the spine
of the written report and the defense. Reproducible npm scripts that output metrics (CSV/JSON).

BRANCH
Off up-to-date `master`: `feat/ai-eval`.

EXPLORE FIRST
- `src/ai/`: `RetrievalService`, `CopilotService`, `EstimationService`, `EmbeddingService`,
  `DocumentEmbedding`, `Task` (for `actualHours`).
- How existing scripts are run (`prisma:seed` via ts-node) to add `ai:eval:*` npm scripts the same way.

BUILD (`src/ai/eval/`)
- Small hand-labeled gold sets (JSONL) committed to the repo:
  `gold/retrieval.jsonl` = `{question, relevantEntityIds[]}`; `gold/qa.jsonl` = `{question, answer,
  mustCite[]}` (base them on the seeded decision-bearing comments/tasks so labels are grounded).
- `run-retrieval-eval.ts`: runs retrieval for each gold question, computes **Recall@k, Precision@k, MRR,
  nDCG@k**. Support ablation flags so you can compare configurations (e.g. dims 1536 vs 3072, correct vs
  wrong embedding task-type) and print a comparison table.
- `run-qa-eval.ts`: runs the copilot for each gold question; computes **groundedness/faithfulness** via an
  LLM-as-judge pass (does each answer claim follow from its cited source? 0..1), **citation accuracy**
  (P/R vs `mustCite`), and **refusal correctness** on deliberately-unanswerable questions.
- `run-estimation-eval.ts`: **leave-one-out** over all completed tasks — predict each task's hours from its
  neighbors (excluding itself), compute **MAE, RMSE, % within ±25%**, and the **calibration** of the IQR
  band (how often the true value falls inside). Compare against two baselines: project-mean and a
  storypoints→hours linear fit; show the k-NN wins.
- Also implement the deferred **faithfulness-judge scoring** for live queries (fill `CopilotQueryLog.
  faithfulnessScore`) and a simple read endpoint/script summarizing telemetry (latency p50/p95, avg
  faithfulness, avg top score) for a dashboard screenshot.
- Each script writes results to `src/ai/eval/out/*.{json,csv}`.

OUT OF SCOPE
No hybrid/reranker implementation (that's the next sprint — but DO leave the ablation flags in the retrieval
eval so they can be measured then). No new product UI beyond the telemetry summary.

ACCEPTANCE / VERIFY
- `npm run ai:eval:retrieval`, `ai:eval:qa`, `ai:eval:estimation` all run and write metrics files.
- Report the headline numbers: Recall@k + MRR; mean faithfulness + citation P/R; estimation MAE vs the two
  baselines + calibration. Sanity-check they're plausible (not all zeros/NaN).
- Commit on `feat/ai-eval`, including the gold sets and a short `src/ai/eval/README.md` explaining how to
  run each and what each metric means.
~~~

---

## Sprint 7 — M5 (stretch): Hybrid search + reranker

~~~text
You are working on a final-year engineering PFE: a project-management web app.
Backend: NestJS + Prisma 7 (Postgres via @prisma/adapter-pg) in `tdg-management-api-backend/`.
AI provider is Google Gemini via `@google/genai` (`GEMINI_CLIENT` + `GeminiService` in
`src/common/gemini/`). Do NOT introduce Anthropic or OpenAI.

Read `docs/ai-copilot-implementation-plan.md` FIRST — "§4.4 (hybrid + RRF)", "§4.5 (reranker)". Source of
truth. This is SPRINT 7 (milestone M5, stretch). Sprints 1–6 are merged, INCLUDING the evaluation harness
(`src/ai/eval/`) with ablation flags. Match conventions. Explore first. Stay in scope.

GOAL
Push retrieval quality to the top tier and PROVE it with the existing eval harness: add lexical (BM25-style)
search fused with vector search via Reciprocal Rank Fusion, plus a reranking stage — then run ablations
showing measurable gains over vector-only.

BRANCH
Off up-to-date `master`: `feat/ai-hybrid-rerank`.

EXPLORE FIRST
- `src/ai/`: `RetrievalService`, `EmbeddingRepository`, and `src/ai/eval/run-retrieval-eval.ts` (its
  ablation flags).
- Postgres full-text search options (`tsvector`, `ts_rank`) usable via `$queryRaw`.

BUILD
- Add a lexical search over `DocumentEmbedding.content` (Postgres FTS `tsvector`/`ts_rank`) with the SAME
  permission filter (`projectId = ANY(allowedIds)`). Consider a generated `tsvector` column + GIN index.
- Fuse the vector-ranked and lexical-ranked lists with **Reciprocal Rank Fusion (RRF)** in
  `RetrievalService`; expose it behind a config/flag so vector-only remains runnable for ablation.
- Add a **reranker** stage (`services/reranker.service.ts`): re-order the fused top-N down to top-k using a
  cross-encoder-style or LLM-based relevance scoring pass. Flag-gated.
- (Optional, only if time) HyDE or query decomposition for hard questions, behind a flag.
- Wire all of these as ablation options in `run-retrieval-eval.ts` (and `run-qa-eval.ts`) so each can be
  toggled and compared.

OUT OF SCOPE
No unrelated refactors. Don't regress the existing vector-only path — it must remain available for
comparison.

ACCEPTANCE / VERIFY
- Run the retrieval eval across configurations: vector-only vs hybrid+RRF vs hybrid+RRF+reranker. Produce a
  comparison table (Recall@k, MRR, nDCG) showing the hybrid/rerank path is **at least as good, ideally
  better**, and report the numbers.
- The copilot still answers correctly with the new default retrieval path; permission scoping still holds.
- App builds; no console errors. Commit on `feat/ai-hybrid-rerank`.
~~~

---

## Notes for you (not part of any prompt)

- **Do them in order and merge each before the next** — Sprints 3+ assume earlier modules exist.
- If a sprint reveals the plan needs adjusting, update `docs/ai-copilot-implementation-plan.md` so the next
  sprint's session reads the corrected spec.
- **Before Sprint 3's demo**, make sure Sprint 1 (seed) actually produced enough completed tasks — the
  estimation quality and the Sprint 6 evaluation both depend on it.
- Each prompt tells the agent to commit on its branch; you handle the merge to `master` between sprints.
