# AI Project Copilot + Retrieval-Based Estimation — Implementation Plan

**Feature A** — permission-scoped RAG copilot (grounded Q&A + semantic search over real project content)
**Feature E** — retrieval-based estimation assistant (k-NN over completed tasks' real `actualHours`)

Status: **planning / ideation — no code written yet.** This document is the build spec, mapped to the
actual repo (`tdg-management-api-backend`, `tawer-management-frontend`).

---

## 0. Why this is a standout PFE (the thesis)

Most "AI features" judges see are a single `generateContent()` call with some text stuffed into the
prompt. This plan is deliberately the opposite. Its defensibility rests on **five pillars that are hard to
fake** and demonstrate real engineering:

1. **Genuine retrieval infrastructure** — a real vector store (pgvector) with HNSW ANN indexing,
   Matryoshka-truncated embeddings, hybrid lexical+vector search, and an incremental re-indexing pipeline
   (outbox + cron). Not "context stuffing."
2. **Permission-scoped retrieval** — the retriever *cannot* return content from a project the user can't
   access, enforced at the SQL level by reusing the app's existing membership/executive-scope logic. This
   is a real security property, and it demos beautifully (same question, two users, different answers).
3. **Grounded generation with citations** — every answer cites the exact `TASK-n` / comment it used; a
   faithfulness check rejects ungrounded claims. This is the difference between "RAG" and "a chatbot."
4. **A real evaluation harness** — gold sets + metrics (Recall@k, MRR, nDCG, groundedness/faithfulness,
   estimation MAE with leave-one-out and a calibration curve). **This is what a top student has and others
   don't.** You can put numbers on a slide.
5. **Unique data grounding** — Feature E predicts effort from *your org's own historical `actualHours`*, a
   signal most tools never capture. It's novel, not a wrapper.

Everything below is designed so you can **stop at any milestone with a working, demoable system** and still
have something impressive — and push to the stretch goals if time allows.

---

## 1. What already exists (integration seams)

Confirmed by reading the code — these are the exact hooks the plan plugs into.

| Concern | Where it lives | How the plan uses it |
|---|---|---|
| Gemini SDK | `common/gemini/gemini.module.ts` provides `GEMINI_CLIENT` (`GoogleGenAI`), `GeminiService` (only used to prettify errors today) | Extend with `embedContent` + streaming generation; reuse the DI provider |
| API key | `GEMINI_API_KEY` already read from `.env` | Zero new provider setup |
| DB access | `common/prisma/service/prisma.service.ts` — `PrismaClient` on `@prisma/adapter-pg` (raw Postgres) | Add pgvector; run ANN via `$queryRaw` |
| Permission gate | `tasks.service.ts:452 canAccessProject()` → executive scope or `findMembership()` | Extract the "which projectIds can this user see" logic into a shared `AiAccessService` |
| Auth on routes | `@UseGuards(HasPermissionGuard)` + `@Permissions([...])` + `req.user` (`CustomRequest`) | Same guards on the new AI controller |
| Scheduling | `ScheduleModule.forRoot()` in `app.module.ts` | `@Cron` sweeper for incremental re-indexing |
| Structured task signals | `Task.storyPoints / estimatedHours / actualHours / completedAt / status / type` | Feature E's k-NN regression targets |
| Frontend data layer | `services/api/*.ts` (JWT via `extractJWTokens`, `GET/POST` from `@/lib/http-methods`, `refreshToken` retry), React Query hooks | Mirror for `copilot.ts` / `estimation.ts` services + hooks |

**Seeded data reality:** 13 projects, 18 tasks, 2 sprints, 4 epics, 8 milestones, 22 reminders, comments.
Enough for a RAG demo; **Feature E and any velocity-flavored eval need richer seeded history** — see §9.

---

## 2. Target architecture

```
                        ┌─────────────────────────── Frontend (Next.js) ───────────────────────────┐
                        │  modules/ai/                                                              │
                        │   components/ copilot-panel.tsx · citation-chip.tsx · estimate-suggestion │
                        │   hooks/ use-copilot.ts (SSE stream) · use-task-estimate.ts               │
                        │   services/api/ copilot.ts · estimation.ts   (JWT + refreshToken retry)   │
                        └───────────────▲───────────────────────────────────▲──────────────────────┘
                                        │ SSE /ai/copilot/stream            │ POST /ai/estimate
        ┌───────────────────────────────┴───────────────────────────────────┴───────────────────────┐
        │  Backend NestJS — src/ai/  (new AiModule, imports GeminiModule, PrismaModule)               │
        │                                                                                             │
        │  AiController ──► CopilotService ──► RetrievalService ──► EmbeddingService (Gemini embed)   │
        │       │                 │                  │  ▲               ▲                             │
        │       │                 │                  │  │ permission     │ RETRIEVAL_QUERY vec        │
        │       │                 ▼                  ▼  │ scope           │                            │
        │       │            GeminiService     AiAccessService     EmbeddingRepository (pgvector,     │
        │       │         (stream generate,   (allowed projectIds)      $queryRaw ANN + BM25)         │
        │       │          faithfulness judge)                                                        │
        │       └──► EstimationService ──► RetrievalService (filter status=DONE) ──► kNN regressor    │
        │                                                                                             │
        │  IndexingService ◄── IndexOutbox (dirty rows) ◄── task/comment create·update events         │
        │        ▲                                                                                     │
        │        └── IndexSweeperJob  (@Cron every 1 min: embed dirty rows in batches, backfill)      │
        │                                                                                             │
        │  Eval harness (offline):  src/ai/eval/  gold sets + metrics scripts + telemetry table       │
        └─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                              Postgres + pgvector  (DocumentEmbedding, IndexOutbox, CopilotQueryLog)
```

---

## 3. Data model additions (Prisma + pgvector)

### 3.1 Enable pgvector

New migration `.../migrations/XXXX_add_pgvector/migration.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Because Prisma 7 has no first-class `vector` type, model the column as `Unsupported`, and create the ANN
index by hand in the same migration (Prisma won't emit it):

```sql
-- after the DocumentEmbedding table is created by Prisma
CREATE INDEX document_embedding_hnsw
  ON "DocumentEmbedding"
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### 3.2 New models (add e.g. `prisma/schema/ai.schema.prisma`)

```prisma
/// One embedded chunk of app content (task, comment, epic, milestone, sprint).
model DocumentEmbedding {
  id           String                        @id @default(dbgenerated("gen_random_uuid()"))
  projectId    String                        // hard permission-scope key
  entityType   EmbeddingEntityType
  entityId     String                        // source row id
  chunkIndex   Int        @default(0)
  content      String                        // the exact text that was embedded (for citations)
  tokenCount   Int        @default(0)
  // 1536-dim Matryoshka-truncated Gemini embedding (see §4.1)
  embedding    Unsupported("vector(1536)")
  contentHash  String                        // sha256(content) — skip re-embed if unchanged
  model        String     @default("gemini-embedding-001")
  createdAt    DateTime   @default(now())    @db.Timestamp(6)
  updatedAt    DateTime   @default(now())    @updatedAt @db.Timestamp(6)

  @@unique([entityType, entityId, chunkIndex])
  @@index([projectId, entityType])
}

/// Work queue: a row here means "(re)embed this entity". Written by app events, drained by the cron.
model IndexOutbox {
  id         String              @id @default(dbgenerated("gen_random_uuid()"))
  projectId  String
  entityType EmbeddingEntityType
  entityId   String
  op         IndexOp             @default(UPSERT)
  status     OutboxStatus        @default(PENDING)
  attempts   Int                 @default(0)
  createdAt  DateTime            @default(now()) @db.Timestamp(6)

  @@unique([entityType, entityId])   // collapse repeated edits into one pending job
  @@index([status, createdAt])
}

/// Telemetry for every copilot call — powers the eval dashboard and demo "receipts".
model CopilotQueryLog {
  id                String   @id @default(dbgenerated("gen_random_uuid()"))
  userId            String
  projectId         String?
  question          String
  retrievedIds      String[]                 // DocumentEmbedding ids used
  topScore          Float?
  answer            String
  citationsCount    Int      @default(0)
  faithfulnessScore Float?                    // 0..1 from the judge
  promptTokens      Int      @default(0)
  latencyMs         Int      @default(0)
  createdAt         DateTime @default(now()) @db.Timestamp(6)

  @@index([userId, createdAt])
}

enum EmbeddingEntityType { TASK  TASK_COMMENT  EPIC  MILESTONE  SPRINT }
enum IndexOp            { UPSERT  DELETE }
enum OutboxStatus       { PENDING  DONE  FAILED }
```

> **Why an outbox + cron instead of embedding inline on save?** Embedding is a network call to Gemini;
> doing it inside the task-save request would add latency and couple task creation to an external service's
> uptime. The outbox pattern makes indexing **asynchronous, retryable, and idempotent** (`contentHash`
> skips no-op re-embeds). This is a deliberate, defensible architecture choice — say exactly that in your
> defense.

---

## 4. Backend — the new `AiModule`

Directory `tdg-management-api-backend/src/ai/`:

```
ai.module.ts
controller/ai.controller.ts
services/
  ai-access.service.ts      # "which projectIds can this user retrieve from"
  embedding.service.ts      # Gemini embed: batching, task-type, MRL truncation, retry
  indexing.service.ts       # chunking + outbox drain + upsert/delete
  retrieval.service.ts      # permission-scoped hybrid (vector + BM25) search, RRF fusion
  reranker.service.ts       # (stretch) cross-encoder / LLM rerank of top candidates
  copilot.service.ts        # RAG orchestration: retrieve → prompt → stream → cite → judge
  estimation.service.ts     # Feature E: kNN regression over DONE tasks
repositories/
  embedding.repository.ts   # all raw-SQL vector/BM25 queries ($queryRaw)
  outbox.repository.ts
jobs/
  index-sweeper.job.ts      # @Cron drain outbox; nightly full-consistency backfill
dto/
  request/  copilot-query.dto.ts · estimate-task.dto.ts
  response/ copilot-answer.dto.ts · retrieved-source.dto.ts · estimate-result.dto.ts
eval/
  gold/ retrieval.jsonl · qa.jsonl        # hand-labeled
  run-retrieval-eval.ts · run-qa-eval.ts · run-estimation-eval.ts
```

`ai.module.ts` imports `GeminiModule`, `PrismaModule`, `LoggerModule`; registers the services, the
controller, and the cron job; is added to `app.module.ts`'s `imports`.

### 4.1 `EmbeddingService` — the embedding strategy (concrete)

- **Model:** `gemini-embedding-001` via `googleGenAI.models.embedContent`.
- **Matryoshka (MRL) truncation:** request `outputDimensionality: 1536` (not the full 3072) to halve
  storage and speed ANN with negligible quality loss — then **L2-normalize** the vector yourself (required
  when using a reduced dimension; the 3072 default is pre-normalized, reduced ones are not). Store as
  `vector(1536)`.
- **Task types matter:** embed **documents** with `taskType: 'RETRIEVAL_DOCUMENT'` and **queries** with
  `taskType: 'RETRIEVAL_QUERY'`. For Feature E, the draft task is embedded as a query. Using the right task
  type is a measurable quality lever — mention it.
- **Batching + resilience:** batch up to N chunks per `embedContent` call; exponential-backoff retry on
  429/5xx; every failure logged via `BackgroundActivitiesLoggerService` (same pattern as `GeminiService`).
- **Idempotency:** compute `contentHash = sha256(content)`; if the stored hash matches, skip the API call.

### 4.2 `IndexingService` — chunking + freshness

**Chunking strategy (per entity type):**
- **Task** → one primary chunk = `"[TASK-{key}] {title}\n{description}"` plus metadata line
  (`status, priority, type, assignee, epic, milestone, storyPoints`). Long descriptions split at ~512
  tokens with ~15% overlap.
- **TaskComment** → one chunk each = `"[Comment on TASK-{key} by {author}] {content}"` (comments are where
  decisions hide — index them separately so they're independently retrievable and citable).
- **Epic / Milestone / Sprint** → `name + description/details`.

**Freshness (incremental):** in the existing write paths — `create-task`, `update-task`,
`create-task-comment`, and their epic/milestone/sprint equivalents — enqueue an `IndexOutbox` UPSERT (and
DELETE on delete). This is a 1-line call added to services that already run in those flows (e.g. alongside
the `AutoReminderService`/`NotificationsService` calls in `tasks.service`). The **`IndexSweeperJob`**
(`@Cron('*/1 * * * *')`) drains PENDING outbox rows in batches, calls `EmbeddingService`, upserts
`DocumentEmbedding`, marks DONE/FAILED. A nightly `@Cron` does a full reconciliation (embed anything whose
`updatedAt > embedding.updatedAt`) so the index can't silently drift.

**Backfill command:** a one-shot script (npm script mirroring `prisma:seed`) to embed all existing content
on first deploy.

### 4.3 `AiAccessService` — permission scoping (the security core)

Extract the projectId-visibility logic (today implicit in `canAccessProject`) into one reusable method:

```ts
// returns the set of projectIds this user is allowed to retrieve from
async allowedProjectIds(userId: string, roles: UserType[]): Promise<string[]>
// executives → business-unit-scoped project ids; others → their ProjectMember project ids
```

**Every** retrieval query is filtered by `projectId = ANY($allowedIds)` *in SQL*, before ranking. There is
no code path that can return a chunk from a project outside this set. If a `projectId` is supplied in the
request, it must be ∈ the allowed set or the request 403s (reusing `ForbiddenCustomException`).

### 4.4 `RetrievalService` + `EmbeddingRepository` — hybrid, permission-scoped search

Vector search via raw SQL (pgvector cosine distance operator `<=>`):

```ts
// EmbeddingRepository.searchVector(queryVec, allowedIds, filters, k)
const rows = await this.prisma.$queryRaw`
  SELECT id, "projectId", "entityType", "entityId", content,
         1 - (embedding <=> ${queryVec}::vector) AS score
  FROM "DocumentEmbedding"
  WHERE "projectId" = ANY(${allowedIds})
    ${filters.entityType ? Prisma.sql`AND "entityType" = ${filters.entityType}` : Prisma.empty}
  ORDER BY embedding <=> ${queryVec}::vector
  LIMIT ${k};`;
```

**Hybrid search (stretch but high-value):** also run a Postgres full-text (`tsvector`/BM25-style
`ts_rank`) query over `content` with the same permission filter, then fuse the two ranked lists with
**Reciprocal Rank Fusion (RRF)**. Hybrid consistently beats pure-vector on keyword-heavy queries ("TASK-3",
error codes, proper nouns) — a concrete, citable quality win.

Set pgvector's `SET LOCAL hnsw.ef_search` per query to trade recall/latency.

### 4.5 `CopilotService` — grounded generation with citations + faithfulness

Pipeline per question:
1. `AiAccessService.allowedProjectIds()` → scope.
2. `EmbeddingService.embed(question, 'RETRIEVAL_QUERY')`.
3. `RetrievalService.hybridSearch()` → top-k (e.g. 8) candidates; optional `RerankerService` → top-4.
4. Build a **grounded prompt**: number the retrieved chunks `[1]..[n]`, instruct the model to answer
   *only* from them and to cite sources as `[n]`, and to say "I don't have information on that in this
   project" when retrieval is weak (top score below a threshold → short-circuit, don't even call the LLM).
5. **Stream** the answer with `googleGenAI.models.generateContentStream` (`gemini-2.5-flash`) over **SSE**.
6. Post-process: map `[n]` markers back to real `entityId`s → structured `citations[]` the UI renders as
   clickable chips.
7. **Faithfulness judge (async, non-blocking):** a second cheap LLM pass (or an entailment check) scores
   whether each answer sentence is supported by its cited chunk; store `faithfulnessScore` in
   `CopilotQueryLog`. Powers the eval dashboard and lets you *show* groundedness, not just claim it.

Guardrails: hard token budget on the stuffed context; strip PII-ish fields you don't want in prompts;
per-user rate limit (Redis) to bound cost.

### 4.6 `EstimationService` — Feature E (k-NN regression on real outcomes)

Endpoint `POST /ai/estimate` with `{ projectId, title, description }`:
1. Embed the draft as `RETRIEVAL_QUERY`.
2. Retrieve k nearest **completed** tasks (`entityType=TASK` joined to `Task.status='DONE'`,
   `actualHours IS NOT NULL`) within the allowed projects — **prefer same project, fall back to same
   `businessUnit`/org** when the project is too sparse (important given your data volume).
3. **Similarity-weighted aggregation:** predicted hours = weighted median of neighbors' `actualHours`
   (weights = cosine similarity); also return an **IQR range** (e.g. "5–8h") as the honest uncertainty
   band, and suggested story points = weighted mode of neighbors' `storyPoints`.
4. Return the **neighbor tasks as evidence** (`TASK-n`, its actualHours, similarity %) so the suggestion is
   transparent and grounded — never a bare number.

This is genuinely useful (fights the estimation-bias problem the analytics only *measures*) and is pure
retrieval + statistics on data unique to this app.

### 4.7 Controller + DTOs

`AiController` (guarded exactly like `TasksController`):
- `POST /ai/copilot/query` — non-streaming JSON (answer + citations); easy to test/eval.
- `GET  /ai/copilot/stream` (`@Sse`) — streaming tokens for the live UI.
- `POST /ai/estimate` — estimation.
- `POST /ai/admin/reindex` — trigger backfill (manager/executive only).

DTOs validated with `class-validator` (same conventions); responses via response DTOs so Swagger documents
them (`@ApiTags('AI')`).

---

## 5. Frontend — `modules/ai/`

Mirror the existing service/hook/component conventions (`extractJWTokens`, `GET/POST`, `refreshToken`
retry, React Query).

- **Copilot panel** (`components/copilot-panel.tsx`): a dockable panel on the **project detail** page
  (next to the existing analytics/tasks tabs). Question box → streamed answer via
  `use-copilot.ts` (consumes the SSE endpoint with `EventSource`/`fetch` reader) → **citation chips**
  (`citation-chip.tsx`) that deep-link to the task/comment. Empty/low-confidence state renders "not found
  in this project" honestly.
- **Estimate suggestion** (`components/estimate-suggestion.tsx`): lives in the **create/edit task form**.
  As the user types title/description (debounced), `use-task-estimate.ts` calls `/ai/estimate` and shows
  "≈ 6h (5–8h) · 5 pts — based on TASK-8, TASK-12, TASK-19" with a one-click "apply" that fills
  `estimatedHours`/`storyPoints`.
- **Global search upgrade (optional):** wire the existing project/task search box to the semantic
  retrieval endpoint for "search by meaning."

---

## 6. Evaluation harness — the differentiator (`src/ai/eval/`)

This is what elevates the project from "built a feature" to "engineered and *measured* a system." All
offline, reproducible, runnable as npm scripts, results dumped to CSV/JSON for your report.

**Retrieval quality** (`run-retrieval-eval.ts`) — gold file of `{question, relevantEntityIds[]}`:
- **Recall@k, Precision@k, MRR, nDCG@k.**
- Ablations to put on a slide: *vector-only vs hybrid+RRF*, *with/without reranker*, *1536 vs 3072 dims*,
  *right vs wrong task-type*. Each ablation is a bar on a chart proving a real decision.

**Answer quality** (`run-qa-eval.ts`) — gold `{question, answer, mustCite[]}`:
- **Groundedness/faithfulness** (LLM-as-judge, 0–1) — % of claims supported by cited sources.
- **Citation accuracy** — did it cite the entities it should have (P/R against `mustCite`).
- **Answer relevance** (LLM-as-judge) + refusal correctness on unanswerable questions.

**Estimation quality** (`run-estimation-eval.ts`) — **leave-one-out** over all completed tasks:
- **MAE / RMSE** of predicted vs real `actualHours`; **% within ±25%**.
- **Baselines to beat:** project mean, and a story-point→hours linear fit. Show your k-NN beats both.
- **Calibration:** does the predicted IQR actually contain the true value ~50% of the time? Plot it.

**Live telemetry:** `CopilotQueryLog` gives a real dashboard (latency p50/p95, avg faithfulness, retrieval
top-scores) — screenshot it for the report.

---

## 7. Security, cost, performance

- **Permission scoping** enforced in SQL on every retrieval (§4.3) — the headline security property.
- **Prompt-injection awareness:** retrieved content is untrusted user text; keep instructions and data
  clearly separated, never let retrieved text change the system directive (mention this — judges love it).
- **Cost/latency:** embeddings are one-time (hashed); generation uses cheap `flash`; Redis per-user rate
  limit; context token cap. Note Gemini free-tier RPM limits for the demo.
- **Idempotent, retryable indexing** (outbox) — no external-service coupling on the task-save hot path.

---

## 8. Phased roadmap — stop anywhere with a working demo

Each milestone is independently demoable. Effort is relative (you're unsure on total time), ordered so
value lands early.

- **M0 — Foundations.** pgvector migration + `DocumentEmbedding`/`IndexOutbox` models; `EmbeddingService`
  (embed + MRL + task-type); backfill script; verify vectors land and `<=>` ANN returns sane neighbors.
  *Demo: raw semantic search in Swagger.*
- **M1 — Feature E (estimation).** `EstimationService` k-NN + endpoint + create-task UI suggestion.
  *Demo: type a task, watch a data-backed estimate with real neighbor evidence.* **Fastest "wow" per
  effort — ship this early.**
- **M2 — Feature A core (RAG).** `AiAccessService` scoping + `RetrievalService` (vector) + `CopilotService`
  with citations + copilot panel (non-streaming first). *Demo: grounded Q&A with clickable citations; the
  two-user permission-scope reveal.*
- **M3 — Polish that impresses.** SSE streaming answers; incremental indexing (outbox + cron) so edits show
  up live; low-confidence refusal.
- **M4 — Evaluation harness.** Gold sets + the three eval scripts + telemetry dashboard. *This is your
  report's spine.*
- **M5 — Stretch / "extraordinary."** Hybrid BM25+vector with RRF; reranker; HyDE or query decomposition
  for hard questions; ablation charts from the eval harness.

**Minimum impressive slice:** M0 + M1 + M2 + M4 (skip streaming/hybrid) already beats "a chatbot wrapper"
decisively, because of scoping + citations + measured retrieval/estimation quality.

---

## 9. Data seeding (do this early — demos live or die here)

Your seed is too thin for Feature E and for velocity-flavored eval. Before M1, extend `prisma/seed.ts`:
- **≥ 40–60 completed tasks** across a couple of projects with **realistic, varied `actualHours` vs
  `estimatedHours`** (so k-NN has neighbors and leave-one-out MAE is meaningful).
- **Richer descriptions + comment threads** with a few genuine "decisions" buried in them (so the copilot
  has something worth retrieving and citing).
- A couple of **completed sprints** if you want any velocity context in answers.
Keep it plausible (same domains/roles) so retrieval looks real, not random.

---

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Prisma 7 can't express `vector` type / ANN | Use `Unsupported("vector(1536)")` + `$queryRaw`; create HNSW index in raw migration SQL |
| Sparse data → weak retrieval/estimation | §9 seeding; Feature E falls back project → business-unit scope |
| Gemini free-tier rate limits mid-demo | Cache embeddings (hash), rate-limit, pre-warm the index before demo |
| Ungrounded / hallucinated answers | Grounded prompt + low-confidence refusal + faithfulness judge in the loop |
| Permission leak via retrieval | SQL-level `projectId = ANY(allowedIds)` on every query; 403 on out-of-scope `projectId` |
| Indexing latency on task save | Async outbox + cron, never inline |

---

## 11. Defense talking points (say these to the jury)

- *"Retrieval is permission-scoped at the SQL layer — I'll show the same question returning different
  answers for a CEO and an intern."*
- *"I use Matryoshka embeddings truncated to 1536 dims and the correct `RETRIEVAL_DOCUMENT`/`RETRIEVAL_QUERY`
  task types — here's the ablation showing what each choice buys."*
- *"Every answer is grounded with citations and scored by a faithfulness judge; here's the distribution."*
- *"Estimation is k-NN regression over our own completed tasks' actual hours — it beats the project-mean and
  story-point baselines by X% MAE under leave-one-out, and the uncertainty band is calibrated."*
- *"Indexing is an outbox + cron pipeline: asynchronous, idempotent, retryable — task creation never blocks
  on an external API."*

---

## 12. Open decisions (yours to make before build)

1. **Embedding dimension:** 1536 (recommended, half storage) vs 3072 (max quality). Cheap to A/B in eval.
2. **Cross-project retrieval for executives:** should a CEO's copilot answer span *all* their projects, or
   one project at a time? (Affects `AiAccessService` default scope.)
3. **Hybrid search + reranker:** in the core, or kept as the M5 stretch? (Core is fine without them.)
4. **Estimation fallback scope:** project-only, or business-unit-wide when sparse? (Recommend business-unit
   fallback given data volume.)
5. **Where the copilot panel lives:** project-detail tab vs a global assistant. (Recommend project-detail
   first — cleaner permission story and demo.)
```
