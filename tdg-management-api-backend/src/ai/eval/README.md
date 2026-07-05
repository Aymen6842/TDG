# AI evaluation harness (`src/ai/eval`)

Offline, reproducible evaluation of the three AI capabilities — **retrieval**,
**grounded Q&A (copilot)**, and **retrieval-based estimation** — plus the live
**telemetry** rollup. This is milestone **M4** (§6 of
[`docs/ai-copilot-implementation-plan.md`](../../../../docs/ai-copilot-implementation-plan.md)):
it turns the feature into a *measured system*. Every script boots the real Nest
DI container (like `npm run ai:backfill`), runs the real services, and writes
metrics to `out/*.{json,csv}`.

## Prerequisites

The scripts hit the real database and the Gemini API, so before running:

1. Postgres + pgvector up (`docker compose up -d`), migrations applied.
2. `npm run prisma:seed` — the gold sets are grounded in this seed's content.
3. `npm run ai:backfill` — populates `DocumentEmbedding` (retrieval/estimation
   read the vector index).
4. `GEMINI_API_KEY` set in `.env`.

> **Free-tier note.** The scripts respect the Gemini free-tier limits (100
> embed req/min, ~10 generation req/min) by batching, backing off on `429`, and
> pacing the QA eval. Runs are therefore *slower* than the raw work implies — the
> retrieval `dims-*` ablation re-embeds the whole corpus and the QA eval spaces
> its questions out. This is expected.

## Scripts

| Command | What it measures | Output |
|---|---|---|
| `npm run ai:eval:retrieval` | Retrieval quality + ablations | `out/retrieval-eval.{json,csv}` |
| `npm run ai:eval:qa` | Copilot answer quality | `out/qa-eval.{json,csv}` |
| `npm run ai:eval:estimation` | Estimation accuracy vs baselines | `out/estimation-eval.{json,csv}` |
| `npm run ai:eval:faithfulness` | Back-fills `CopilotQueryLog.faithfulnessScore` for live calls | (updates DB) |
| `npm run ai:telemetry` | Live telemetry dashboard rollup | `out/telemetry-summary.{json,csv}` |

All eval scripts impersonate a user for permission scoping (§4.3), defaulting to
the CEO (`mohamed@tawer.tn`, global scope). Override with `--actor=<email>`.

## Gold sets (`gold/`)

Hand-labeled, committed, and grounded in the seeded decision-bearing tasks and
comments so the labels are real. Labels use **stable canonical refs** — not the
`gen_random_uuid()` ids, which change every re-seed — resolved back by
[`lib/refs.ts`](lib/refs.ts):

- `TASK:NDF-3`, `COMMENT:NDF-3` (a comment on task NDF-3), `EPIC:<name>`,
  `MILESTONE:<name>`, `SPRINT:<name>`.

Files:

- `retrieval.jsonl` — `{ question, relevantEntityIds[] }`.
- `qa.jsonl` — `{ question, answer, mustCite[], answerable }`. The three
  `answerable:false` items are deliberately unanswerable — the copilot **should**
  refuse them.

## Metrics glossary

### Retrieval (`run-retrieval-eval.ts`)

Ranked-list metrics over the deduplicated canonical refs, averaged over the gold
questions, reported at k ∈ {1,3,5,10}:

- **Recall@k** — fraction of the relevant refs found in the top-k.
- **Precision@k** — fraction of the top-k that is relevant.
- **MRR** — mean reciprocal rank of the *first* relevant hit (rank sensitivity).
- **nDCG@k** — rank-discounted gain vs the ideal ordering (1.0 = perfect order).

**Ablations** (`--configs=`, comma-separated). Runnable this sprint:

- `baseline` — production path: pgvector ANN, correct `RETRIEVAL_QUERY` task
  type, 1536 dims.
- `wrong-task-type` — query embedded with the wrong task type
  (`RETRIEVAL_DOCUMENT`); quantifies what the correct task type buys.
- `dims-1536` / `dims-3072` — in-memory brute-force retriever that re-embeds the
  corpus at the chosen dimensionality (Matryoshka 1536 vs full 3072). `dims-1536`
  reproduces `baseline` and validates the in-memory backend.

Reserved for **M5** (not implemented — flags recognized so they can be measured
next sprint): `hybrid` (BM25 + vector RRF), `rerank` (cross-encoder rerank).

```bash
npm run ai:eval:retrieval                                   # baseline + wrong-task-type
npm run ai:eval:retrieval -- --configs=baseline,dims-3072   # dimensionality ablation
```

### Copilot answer quality (`run-qa-eval.ts`)

- **Faithfulness / groundedness** — LLM-as-judge (`lib/faithfulness-judge.ts`):
  the fraction (0..1) of the answer's claims that follow from the exact sources
  it cited. Averaged over answered questions.
- **Citation precision / recall** — of the cited refs against `mustCite`.
  Precision = right citations / all citations; recall = required citations hit /
  required.
- **Refusal accuracy** — did the copilot answer the answerable questions and
  refuse the unanswerable ones? Reported with the false-refusal rate (answerable
  wrongly refused) and correct-refusal rate (unanswerable correctly refused).

### Estimation (`run-estimation-eval.ts`)

**Leave-one-out** over every completed task: predict each task's hours from its
neighbors *excluding itself*, exactly as `EstimationService` would.

- **MAE / RMSE** — absolute / squared error of predicted vs real `actualHours`.
- **% within ±25%** — share of predictions within 25% relative error.
- **IQR-band calibration** — how often the true value lands inside the predicted
  25th–75th percentile band (ideal ≈ 0.50; this is the honesty of the uncertainty
  band).
- **Baselines** — `project-mean` and a `storypoints→hours` OLS fit (both
  leave-one-out) that the k-NN predictor is compared against.

**The k-NN finding (and the fix that shipped).** The harness surfaced that on
this corpus **text similarity carries no effort signal** (corr(k-NN, actual) ≈ 0;
plain text-only k-NN collapses to the project mean — MAE 3.83 ≈ project-mean
3.82). The fix, now in `EstimationService`, is **size-aware prediction**: when the
draft's story points are supplied (`EstimateTaskDto.storyPoints`), the estimate
scales the neighbors' *local hours-per-point rate* by those points
(reference-class forecasting) instead of taking a bare median of neighbor hours.

The eval therefore measures the real `EstimationService.predictFromNeighbors` in
both modes:

- `k-NN (text only)` — no draft points (size-agnostic median): MAE **3.83**.
- `k-NN + points` — draft points supplied (hours-per-point): MAE **2.12**,
  ±25% hit-rate **0.67** — matching/beating the `storypoints→hours` baseline
  while keeping neighbor evidence and a band.

Uncertainty band: normalizing hours by points strips out the size variance, so a
25–75 IQR band on the size-aware path came out too tight — it under-covered the
truth (calibration **0.40** vs the **0.50** an IQR nominally targets). The
size-aware path therefore uses a wider **10–90 band** (nominal ~0.80 coverage),
which restores an honest band: calibration **0.744** on the eval, close to the
0.80 a 10–90 band should cover, up from 0.40 — without moving MAE (2.12) or the
±25% hit-rate (0.674), since only the band percentiles changed, not the median.
The size-agnostic (text-only) path keeps its 25–75 IQR (calibration 0.488,
nominal 0.50). When points are *not* supplied the service is unchanged.

### Telemetry (`telemetry-summary.ts` / `GET /ai/telemetry`)

Rollup over `CopilotQueryLog`: total queries, refusal rate, latency **p50/p95**,
mean **faithfulness**, mean retrieval **top-score**, avg citations and prompt
tokens. The same `TelemetryService` backs the admin endpoint `GET /ai/telemetry`
(executive-only) for a dashboard screenshot. Run `ai:eval:faithfulness` first to
populate `faithfulnessScore` for real calls.

## Notes for the defense

- Retrieval, QA and estimation are scored against **committed gold sets**, so the
  numbers are reproducible and auditable — not vibes.
- The retrieval ablation shows the *correct query task type* materially improves
  ranking (MRR/nDCG@1), a concrete, defensible embedding decision.
- Estimation is measured against two baselines under leave-one-out; where a
  baseline wins the harness says so — that transparency is the point of an eval.
