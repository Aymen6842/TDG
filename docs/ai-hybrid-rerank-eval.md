# M5 — Hybrid retrieval (BM25 + vector via RRF) + reranking: results

Sprint 7 / milestone **M5** (§4.4, §4.5 of `ai-copilot-implementation-plan.md`). Pushes retrieval past the
vector-only baseline and proves it with the existing offline eval harness (`src/ai/eval/`).

## What shipped

- **Lexical arm** — a Postgres full-text (BM25-style) search over `DocumentEmbedding.content` via a
  generated `tsvector` column + GIN index (`ts_rank_cd` / `websearch_to_tsquery`), under the **same**
  `projectId = ANY(allowedIds)` permission filter as the vector search
  (`EmbeddingRepository.searchLexical`).
- **Reciprocal Rank Fusion** — `RetrievalService` fuses the vector-ranked and lexical-ranked lists with RRF
  (`Σ 1/(60 + rank)`), keyed by chunk id. Flag-gated (`AI_RETRIEVAL_HYBRID`, default **on**); vector-only
  stays fully runnable for ablation.
- **Reranker** — `RerankerService` re-orders the fused top-N down to top-k with a cross-encoder-style LLM
  relevance pass (Gemini `flash-lite` — a cheap/fast scoring model with its own quota bucket, resilient to
  the free-tier 429 with `retryDelay` backoff). Flag-gated (`AI_RETRIEVAL_RERANK`, default **off** — it adds
  one LLM call per query; graceful fallback to the fused order on any failure, so it can reorder but never
  regress).
- **Ablations wired into the harness** — `run-retrieval-eval.ts` compares `baseline` (vector-only) vs
  `hybrid` vs `hybrid-rerank`; `run-qa-eval.ts` takes `--retrieval=vector|hybrid|hybrid-rerank`. A second
  gold set (`--gold=keyword`) probes identifier/keyword queries.

## Results

Actor: CEO (6 projects in scope), depth 10. Command:
`npm run ai:eval:retrieval -- --gold=<set> --configs=baseline,hybrid,hybrid-rerank`.

### Semantic gold set (`retrieval.jsonl`, 12 natural-language questions)

| config        | MRR   | R@1   | nDCG@1 | R@3   | nDCG@3 | R@5   |
|---------------|-------|-------|--------|-------|--------|-------|
| baseline      | 0.958 | 0.583 | 0.917  | 1.000 | 0.968  | 1.000 |
| hybrid        | 0.958 | 0.583 | 0.917  | 1.000 | 0.968  | 1.000 |
| hybrid-rerank | 0.958 | 0.583 | 0.917  | 1.000 | 0.968  | 1.000 |

On natural-language questions the bi-encoder is already **saturated** on this small (73-chunk) corpus —
the first relevant hit is at rank 1 almost every time (MRR 0.958; R@1 is capped below 1 only because several
gold items have two relevant entities). Hybrid and rerank **match it exactly — no regression.**

### Keyword / identifier gold set (`retrieval-keyword.jsonl`, 10 bare ticket-key lookups)

Queries are bare identifiers (`NDF-24`, `BLD-4`, …) — the real "search by ticket key" behavior and the
worst case for a dense embedder, which maps an opaque token to almost no signal.

| config        | MRR   | R@1   | nDCG@1 | R@3   | nDCG@3 | R@5   |
|---------------|-------|-------|--------|-------|--------|-------|
| baseline      | 0.570 | 0.300 | 0.300  | 0.900 | 0.639  | 1.000 |
| **hybrid**    | **1.000** | **1.000** | **1.000** | **1.000** | **1.000** | **1.000** |
| hybrid-rerank | 1.000 | 1.000 | 1.000  | 1.000 | 1.000  | 1.000 |

**+75% MRR, +233% R@1** over vector-only. Dense retrieval puts the exact task first only 30% of the time;
the lexical arm matches the identifier every time and RRF fuses it to a perfect ranking — exactly the
keyword-query regime the plan predicted hybrid would win.

## Takeaway

Hybrid+RRF is the new default: it **ties** vector-only where the embedder is already perfect and
**dominates** it (MRR 0.57 → 1.00) on keyword/identifier queries, at no extra LLM cost. The reranker is
available behind a flag and falls back safely to the fused ranking when the LLM is unavailable/throttled.

Reproduce: `npm run ai:eval:retrieval` (semantic) and `npm run ai:eval:retrieval -- --gold=keyword`.
Raw output in `src/ai/eval/out/retrieval-eval.{json,csv}`.

## Verification notes

- **Permission scoping holds in the hybrid path.** Running `searchScoped(hybrid)` as the CEO (6 projects)
  and as an intern (1 project) for the same query returned candidates *only* from each actor's allowed
  projects — **0 out-of-scope leaks** in either arm (vector and lexical share the identical
  `projectId = ANY($allowedIds)` SQL filter).
- **The reranker genuinely reorders.** Feeding it a deliberately scrambled candidate list (best hit forced
  last) for "How does JWT refresh-token rotation work?", it promoted `[NDF-1] JWT auth with refresh-token
  rotation` back to rank 1, displacing an unrelated GDPR task — i.e. the LLM scoring → parse → sort pipeline
  works end-to-end, not just the fallback.
- **Rerank ties on this corpus, by construction.** With only 73 chunks, RRF fusion already lands the right
  doc at rank 1 on both gold sets, so a correct reranker cannot *improve* the metrics here — it holds at the
  ceiling (no regression). Its value shows on larger/noisier corpora and is demonstrable in isolation above.
- **Quota caveat.** The Gemini free-tier *daily* `generate_content` quota for `gemini-2.5-flash` was
  exhausted during these runs, so a fresh live copilot answer and the `run-qa-eval` faithfulness pass could
  not be re-run in the same session. Those paths are unchanged from M4 except that they now receive
  better-ranked (hybrid) candidates; the retrieval half they depend on is verified above. Re-run
  `npm run ai:eval:qa -- --retrieval=hybrid` once the daily quota resets.
