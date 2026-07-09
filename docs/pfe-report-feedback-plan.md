# PFE Report — Feedback Triage & Improvement Plan

**Scope.** Triage of the six external AI reviews in `docs/feedbacks.txt` (ChatGPT, Claude Sonnet,
Gemini 3.1 Pro, DeepSeek, Grok, GLM 5.2) against `docs/pfe-report.md`, producing an execution plan.
**Orientation:** rebalance the report toward its genuine strengths for a jury — lead with capability,
move the enumerated defect lists out of the main narrative into a measured "Limitations & Perspectives"
frame — while keeping the hard line: **no factual claim is invented**. Everything planned below is
either already in the dossiers/code, a relocation/rewording of existing content, or explicitly marked
`[TO PROVIDE]`/`[CONFIRM]` for the author.

**Ground rules honored throughout:**
- Facts come only from `docs/dossiers/00–16` + `docs/pfe-report-reference.md` (per plan §A). Where a
  fix wants a fact from elsewhere (e.g. `docs/diagnostic-report-v2.md`), the item says so and gates it.
- No code changes (see §F). No renumbering of US-IDs, SP subtotals (252 total), or figures 1.1–4.6
  unless an item explicitly flags it.
- Acceptance-table verdicts (✅/⚠) are factual and stay accurate; what changes is *placement and tone*
  of the defect discussion, not the truth of it.

---

## A. Feedback triage

Verdicts: **ACCEPT** (strengthens presentation without fabricating) · **REJECT** (piles on criticism,
demands over-disclosure, or asks for work/facts that don't exist) · **NEEDS-USER-INPUT** (only the
author can decide). Effort: S / M / L (per fresh-session execution).

| # | Source(s) | Feedback (deduplicated) | Verdict | Rationale | Effort |
|---|---|---|---|---|---|
| T-01 | ChatGPT, DeepSeek, Grok, GLM | The biggest strength is **breadth with architectural consistency** (20+ modules, one uniform pattern) — lead with it and let the reader feel it, not just read it. | **ACCEPT** | Already claimed (obj. 4) but under-amplified: it's stated once in §1.5/§2.6 and then undercut by the debt sentence that closes §2.6. Reframe §2.6 close; strengthen Conclusion's synthesis. | S |
| T-02 | All six | The **RAG chapter is the centerpiece** — permission-scoping in SQL, outbox freshness, measured eval. Keep it front and center. | **ACCEPT** | Chapter 4 is already strong; the fix is to let the Abstract/Résumé and Conclusion end on it instead of ending on debt confession (see T-04). | S |
| T-03 | ChatGPT, DeepSeek | The **evaluation rigor is underrated** — "you measured instead of asserting" is what a jury remembers. Surface it earlier and harder. | **ACCEPT** | Real: gold sets, ablations (D14 §11 — the report says "plus ablations" once and never shows them), MRR/Recall/leakage tables. Amplify in §4.8 and the Conclusion; add the ablation mention explicitly. | S |
| T-04 | GLM ("your extreme honesty might be used against you"), Grok ("own it confidently"), DeepSeek (consolidate the defect registry), user's framing goal | The **per-sprint enumerated bug lists dominate the narrative**; sprint reviews and the Abstract end on confession. Reframe: reviews end on capability; defects consolidate into one measured Limitations/Future-Work location. | **ACCEPT** | The single highest-value change. All facts are preserved — they move from six bullet-list confessionals into one consolidated, prioritized annex table, with each sprint review keeping a short, confident "hardening notes carried forward" paragraph (1–3 items max, framed as prioritization decisions). See B-02…B-08. | L |
| T-05 | Claude Sonnet | **Authorship framing**: Sonnet claimed much of the pre-AI platform predates the internship and the narrative mis-attributes it. | **RESOLVED — REJECT (author clarified)** | Author confirms Sonnet misread earlier context: the platform was built during the internship, with a shadcn/Radix UI kit (already disclosed in §2.5) and colleagues (TDG members) contributing on a few modules — ordinary team collaboration, not an inherited system. The report's Scrum frame (a Development Team, "we" voice per plan §A) already matches this reality; the only action is to fill **P-05** honestly with team composition + the author's role, and pick defense depth targets among the modules that are fully the author's (see D-1, §E Q-04). No narrative rewrite needed. | S |
| T-06 | Claude Sonnet | Add the **audit / diagnostic / test-recovery work as its own chapter** ("some of the strongest material you have"). | **NEEDS-USER-INPUT** | Partially real: `docs/diagnostic-report-v2.md` documents a genuine live-usage audit (both roles exercised, permission boundaries probed, root-caused bugs like P1-1). With D-1 resolved, a full chapter is oversized — but a short "exploratory validation" passage would strengthen the testing story if the author confirms the audit was their work and it gets dossier-ized to keep the citation rule intact. The "0→512 e2e tests" figure Sonnet cites appears in **no dossier** and must not be claimed without author confirmation. See D-2. | M |
| T-07 | ChatGPT, Gemini, DeepSeek | **No CI/CD / deployment story** — the biggest engineering gap; consider adding a pipeline before the defense. | **REJECT** (as report/code work) → **§F** for the pipeline; **ACCEPT** the *reframing* half as B-09 | Building CI/CD now is a code change that desyncs code → dossier (D16 says "no CI/CD") → report (§2.4, Fig 2.7, Conclusion). The framing fix is free: a "deployment readiness" paragraph that *leads* with what already works (idempotent `prisma migrate deploy`, compose-provisioned infra with healthchecks, `/health` endpoint, Dockerfiles as build recipes) and casts CI/CD as roadmap item #1 — all dossier-backed (D16 §2–8). | S |
| T-08 | DeepSeek, Grok | The **frontend is under-examined** relative to the backend — show one frontend module at backend-level depth. | **ACCEPT** | Real, dossier-backed material exists and is under-sold: the manual SSE stream client with auth header + silent refresh retry (D14 §6), Zod schema factories with i18n (D15 §14), the React Query/Zustand bridge (D15 §4.3–4.5), the custom month calendar (D10), drag-drop kanban. Expand prose in §2.4 + §4.7; no new figures. See B-10. | M |
| T-09 | DeepSeek | The **AGILE/FREESTYLE two-business-unit model is asserted but not examined** — add a "project type → features enabled" table. | **ACCEPT** | Constructible from dossier facts (D05 §2–3: type selects workflow; D06/D07: agile backlog vs. free-form + milestones-for-FREESTYLE). One small table in §1.2 or §3.2.1; update List of Tables. | S |
| T-10 | DeepSeek | Add **failure analysis** for the copilot — what does it get wrong and why. | **ACCEPT (partial)** | The vector-only identifier failures are real and quantified (R@1 0.30 → 7 of 10 keyword queries missed at rank 1); `docs/ai-hybrid-rerank-eval.md` is already cited by §4.8. A 3–4 sentence qualitative note ("what a miss looks like and why the lexical arm fixes it") is free and strengthens §4.8. Anything needing *new runs* (per-question logs not in the eval doc) → REJECT. | S |
| T-11 | ChatGPT, DeepSeek | **Bigger evaluation**: more queries, human evaluation, latency measurements. | **REJECT** | No such data exists; producing it means new experiment runs (code-adjacent, desync risk) and cannot be claimed otherwise. Grok's counterpoint — small corpus already disclosed — is the honest ceiling. One clause in future work is enough (already present in §Perspectives 5). | — |
| T-12 | DeepSeek, Grok, Gemini (implicit) | **Re-run the QA/faithfulness eval (P-34)** and refresh the answer-quality numbers. | **NEEDS-USER-INPUT** | Already registered as P-34. It's a command run, not a code edit, and it closes the one evidence gap in Chapter 4. Author's call on timing/quota. See D-3. | — |
| T-13 | All six | **Fill the placeholders**: screenshots (P-07…P-33), company context (P-01/P-02), competitor analysis (P-03), title page (P-35/P-36). | **NEEDS-USER-INPUT** | Only the author has these. The Register already tracks them; no plan work needed beyond D-4. | — |
| T-14 | Gemini, GLM | **Competitor analysis positioning**: use P-03 to argue "Jira does agile; none do integrated agile + attendance + monitoring + AI-grounded answers over *your own* data, bilingual, in one RBAC surface." | **ACCEPT (as frame for P-03)** | The report already sketches this thesis in §1.4's closing paragraph — the plan pins it as the required angle for when the author writes P-03, so the section lands as an argument, not a table dump. See D-5. | S (once P-03 data exists) |
| T-15 | Grok | The **Scrum reconstruction** disclaimer may be probed — frame it as "reverse-engineered from delivered artifacts for narrative clarity," said once, confidently. | **ACCEPT** | §2.1's "Honesty note" + §2.2's repeat + P-06 say the same thing three times, apologetically. Keep the disclosure (it protects the author) but state it once, in confident methodological language. | S |
| T-16 | GLM, Grok, DeepSeek | **Own the prototype status**: "functional prototype under a strict 6-sprint timeline; breadth was the priority; the hardening path is precise and short." | **ACCEPT** | Pure reframing of existing facts. Applies to the Conclusion's "strong prototype, not yet a production system" paragraph and the Closing. See B-08. | S |
| T-17 | Gemini | Ensure the **assembly scaffolding** (assembly note + Placeholder Register) is stripped from the exported PDF/Word. | **ACCEPT** | Already flagged in the front matter; add it as an explicit final-assembly checklist item so it can't be missed. See B-13. | S |
| T-18 | Gemini | Backend capabilities the frontend doesn't consume (e.g. multi-member create) — prepare a defense answer ("API future-proofed for other clients"). | **ACCEPT (as §E prep, not report change)** | The two-app section (§2.4) already makes the any-client argument; the rest is oral-defense preparation. See §E Q-08. | — |
| T-19 | ChatGPT | **Monitoring could go deeper** (Prometheus, Grafana, tracing, anomaly detection). | **REJECT** | New feature scope; cannot be claimed. The future-work section may gain one clause at most; the module's real strengths (self-observing loop, alert fan-out through the shared backbone, outbox + locking) are already told in §3.5.5 ¶1 and get amplified by B-06. | — |
| T-20 | ChatGPT | **AI is "still mostly RAG"** — agentic workflows / adaptive retrieval would be publication-level. | **REJECT** | Explicitly conceded by the reviewer as beyond PFE scope. Optionally one line in Perspectives §5 ("adaptive/agentic retrieval") as forward direction — nothing more. | — |
| T-21 | DeepSeek | The report is **long / over-documented in places**; cumulative diagrams repeat information. | **REJECT (wholesale)** / partially satisfied by T-04 | Multiple reviewers independently praise the structure and cumulative-diagram device; cutting it removes a distinctive strength. The only "length" fix worth doing is the defect consolidation (B-07), which T-04 already covers. | — |
| T-22 | ChatGPT, Sonnet, GLM, Grok | **Defense preparation**: 10–15 min architecture-first demo, pick depth targets, rehearse answers on the documented bugs and the AI pipeline. | **ACCEPT (→ §E only)** | Not report content. Consolidated into the author-only section below. | — |
| T-23 | (Own observation, aligned with T-04) | The **Résumé/Abstract end on debt** ("assessed honestly … alongside the verified technical debt") — first and last impressions should end on measured capability. | **ACCEPT** | Word-choice change only; the zero-leakage + MRR results are the natural closing beat and are factual. See B-01. | S |
| T-24 | (Own observation) | Genuinely existing but **under-sold test evidence**: 854-line `projects.service.spec.ts` (D05 §11), the e2e RBAC suite over supertest (D03 §11), **frontend property-based tests with fast-check** (D07 §11: 11 suites; D11 §11: 2 suites; D15 §11), Playwright e2e config. The report leads each mention with the gap, not the coverage. | **ACCEPT** | All dossier-cited. Reorder each "Tests de validation" intro to state what exists first, then scope honestly. Property-based testing in a PFE is a differentiator no reviewer even noticed because the report buries it. See B-05. | M |

---

## B. Accepted improvements — prioritized execution checklist

One item ≈ one fresh session. Order matters: B-01…B-08 are the framing core; B-02 must land
**before** B-07 removes nothing (B-07 receives what B-03…B-06 relocate). **Invariants to preserve in
every item:** US-ID ranges (S1:10 / S2:7 / S3:12 / S4:9 / S5:8 / S6:7), SP subtotals (41/26/64/44/35/42
= 252), figure numbers 1.1–4.6 (54 figures — do **not** add figures), Placeholder Register P-01…P-36,
and every existing dossier trace `(Dxx §y)` on any sentence that survives a rewrite.

> ✅ **Gate lifted (D-1 fully resolved):** built during the internship, author as main developer
> under two senior supervisors — the existing Scrum-team narrative is accurate as written.
> B-02…B-06 proceed. P-05 wording is drafted in D-1; only the seniors' titles remain to confirm.

- [ ] **B-01 (P0 · S) — Abstract & Résumé: end on capability.**
  Touches: Front Matter §Résumé (lines ~93–112) + §Abstract (~114–132). Rewrite the final sentence of
  each: replace "évalué avec honnêteté… la dette technique vérifiée" / "assessed honestly…
  alongside the verified technical debt" with a closing beat on the measured results (MRR 0.57→1.00,
  R@1 0.30→1.00, **zero cross-role leakage** — all in D14 §11) and the six-sprint Scrum delivery.
  Keep every number identical between FR and EN. No trace changes. Keywords unchanged.

- [ ] **B-02 (P0 · M) — Sprint 1 review (§3.1.5) reframe.**
  Keep ¶1 (capability) and strengthen it: the two-tier authorization pattern as the platform-wide
  template, the single declarative RBAC catalogue on 139 routes / 18 controllers (D03 §5, §9).
  Replace the six-bullet defect list with one short paragraph: "Security hardening items identified
  during this sprint — token lifetimes, throttling, and one authorization check — are consolidated
  with their remediations in the Limitations & Perspectives annex," naming at most the token-TTL
  item inline as the priority. Delete "Honesty demands recording the defects…" framing. The
  acceptance-table ⚠ flags in §3.1.4 stay (factual), but their parenthetical "(see review)" pointers
  retarget to the annex. Preserve D03/D04 traces on whatever text remains. Content removed here is
  **staged for B-07** (do not lose any item or trace — move them verbatim into the working notes).

- [ ] **B-03 (P0 · M) — Sprint 2 review (§3.2.4) reframe.** Same recipe. Keep/strengthen ¶1
  (single-manager invariant, scoping-in-the-query, email-bound tokens, first real behavioural tests —
  854-line spec, D05 §11). Compress the seven bullets to one forward-looking paragraph naming only
  the invitation-acceptance UI (because US-S2-05 ⚠ depends on it) as a scoping decision — the
  backend is complete; the UI was deprioritized to reach the depth sprint. Stage removed items for B-07.

- [ ] **B-04 (P0 · M) — Sprint 3 review (§3.3.5) reframe.** Keep/strengthen ¶1 — this is the
  strongest capability paragraph in Chapter 3 (workflow engine, shared FE/BE state-machine contract,
  every mutation already feeding the AI outbox). Delete "It is also the sprint where the debt is
  deepest…". Compress eight bullets → one paragraph acknowledging that breadth-first delivery left
  the module's backend tests and a set of consistency rules for the hardening phase (annex pointer).
  Stage removed items for B-07.

- [ ] **B-05 (P0 · M) — Sprint 4 review (§3.4.7) reframe.** Same recipe; keep the shared
  notification-backbone insight in ¶1 (it's the sprint's architectural payoff). The P1-1 dead zone
  stays named (it is the report's flagship root-cause analysis and shows diagnostic skill) but framed
  as *found and root-caused with a precise fix designed* rather than as one item in a shame list.
  Stage the rest for B-07.

- [ ] **B-06 (P0 · M) — Sprint 5 review (§3.5.5) reframe.** Keep ¶1 (self-observing loop, outbox,
  cron locking, correct ownership scoping — D12 §14, D13 §14). Compress the eight bullets; the
  honest headline ("two features look complete and are not": ntfy, service health-check) reduces to
  one measured sentence with the annex pointer. Stage for B-07.

- [ ] **B-07 (P0 · L) — Consolidated "Limitations & Perspectives" annex.**
  Create one annex (after the Conclusion, before the closing colophon) titled **"Annex — Consolidated
  hardening backlog"**: a single table, one row per defect relocated by B-02…B-06 + the Chapter 4
  items (§4.10 keeps its own review — see B-08), columns: *Theme (security / correctness /
  maintainability / testing / devops) · Item · Dossier trace · Planned remediation · Priority*.
  Every dossier trace from the removed bullets must reappear here — **zero information loss**, only
  relocation. Then slim the Conclusion's "Verified limitations" section (lines ~5654–5685) to a
  five-theme summary paragraph pointing at the annex. Update the List of Tables (§Front Matter) with
  the new annex table. Flag: this adds one table — List of Tables row required; no figure changes.

- [ ] **B-08 (P1 · M) — Conclusion & §4.10 tone pass.**
  Conclusion: retitle "Verified limitations" → "Limitations & perspectives"; rewrite "The platform is
  a strong prototype, not yet a production system" into the confident version (T-16): a functional
  platform delivered under a strict six-sprint timeline, with a precise, prioritized hardening path.
  Closing paragraph ends on capability + direction (the RAG results and the ten domains), not on
  "assessed with honesty." §4.10: keep the review (Chapter 4's self-found gaps are a *strength*
  reviewers praised — Sonnet explicitly) but tighten the list to the two significant items
  (comment-delete freshness, cosine-only gate) in prose, moving the "smaller items" bullet into the
  B-07 annex. Preserve D14 §13 traces.

- [ ] **B-09 (P1 · S) — Deployment readiness reframe (§2.4 + Fig 2.3/2.7 labels + Conclusion theme 5).**
  Rewrite the "Deployment topology" paragraph to lead with what runs (compose-provisioned Postgres/
  Redis/Mailpit with healthchecks, idempotent `prisma migrate deploy` on start, `/health` endpoint,
  Dockerfiles as build recipes — all D16 §2–8), then one sentence: CI/CD and orchestration are the
  first roadmap item. Word-choice fix in the PlantUML labels: "(provisioned; wiring dead)" →
  "(provisioned; not yet wired)" and "(unused)" → "(reserved)" in Figures 2.3 and 2.7 — equally true,
  not confessional. Same wording fix for the Redis sentence in §2.4 "Cross-cutting infrastructure"
  and §2.5's stack table. **Reframe, don't hide:** the Postgres-based locking choice
  (`SELECT … FOR UPDATE SKIP LOCKED`, D01 §4.7) gets promoted as a deliberate fewer-moving-parts
  decision (GLM praised exactly this). Figure *content* edits only — numbering untouched.

- [ ] **B-10 (P1 · M) — Surface the real test evidence (T-24).**
  Touches §3.1.4, §3.2.3, §3.3.4, §3.4.6, §3.5.4 intros. Recipe per intro: first sentence states
  what automated evidence exists (S1: the e2e RBAC permission-matrix suite over supertest, D03 §11;
  S2: the 854-line `projects.service.spec.ts` + controller spec, D05 §11; S3: 11 frontend
  property-based fast-check suites, D07 §11; S4: two fast-check property suites for reminders,
  D11 §11; S5: the mail-service spec, D12 §11); second sentence scopes coverage honestly (unchanged
  facts, calmer wording — drop "empty scaffolds that assert only toBeDefined" phrasing where it
  repeats; say it once in the annex). Add one sentence to §2.6 or §3.3.4 naming property-based
  testing (fast-check) as the frontend's validation approach — dossier-cited, currently invisible.

- [ ] **B-11 (P2 · M) — Frontend engineering depth (T-08).**
  Touches §2.4 "Frontend architecture" paragraph and §4.7. Expand with dossier-backed craft: the
  manual fetch+SSE-frame stream client (built to carry the Authorization header, with silent
  refresh-retry — D14 §6, already half-told in §4.7, promote it as a deliberate engineering choice);
  Zod schema factories with i18n'd messages + `z.infer` typing (D15 §14); the React Query/Zustand
  bridge pattern (D15 §4.3–4.5); the uniform six-folder module convention as the mirror of the
  backend rule (D15 §4.10). Prose only — no new figures, no new sections (keeps TOC/figure numbering
  frozen). 2–3 paragraphs total.

- [ ] **B-12 (P2 · S) — AGILE/FREESTYLE feature-mapping table (T-09).**
  Add a small table in §1.2 (or §3.2.1 if it reads better next to `projectType`): rows = feature
  clusters (epics/sprints/burndown-velocity vs. milestones vs. kanban vs. members/invitations…),
  columns = AGILE / FREESTYLE, from D05 §2–3, D06 (milestones also for FREESTYLE — already stated in
  US-S3-04), D07. Update List of Tables. No US-ID/figure impact.

- [ ] **B-13 (P2 · S) — Evaluation amplification (T-03 + T-10).**
  §4.8: (a) name the ablations explicitly (one sentence on what was ablated, from D14 §11 /
  `docs/ai-hybrid-rerank-eval.md` — verify wording against the eval doc before writing); (b) add a
  3–4 sentence qualitative failure note: what a vector-only identifier miss looks like (opaque token
  `NDF-24` carries no semantic signal → dense embedder ranks it low; `websearch_to_tsquery` matches
  it exactly; RRF fuses it to rank 1) — this is analysis of *existing* numbers, no new runs; (c) keep
  the corpus-size caveat to a single clause (73 chunks — already disclosed, don't re-dwell).
  Keep the Gemini-quota caveat + P-34 marker verbatim (it protects the author).
  **UPDATED 2026-07-07 (evals re-run — this supersedes item (c) and the "keep caveat verbatim" line):**
  - **Keyword set reproduced EXACTLY** (baseline MRR 0.570 / R@1 0.300; hybrid & hybrid-rerank 1.000
    across) — the §4.8 keyword table is verified current; keep it, re-date to 2026-07-07.
  - **Semantic set:** baseline & hybrid tie exactly at **MRR 0.958 / R@1 0.583** (hybrid = no
    regression, core point holds), but **hybrid-rerank now IMPROVES it to MRR 1.000 / nDCG@1 1.000**.
    FIX the current wording "hybrid and rerank tie it exactly — no regression where there is nothing to
    improve" -> "hybrid ties the saturated baseline (0.958, no regression); the LLM reranker matches or
    slightly edges it (1.000 this run)." The reranker is LLM-based so its number varies run-to-run while
    the deterministic vector/hybrid arms don't — state this once (honest; explains future re-run drift).
  - **QA/faithfulness DONE (closes P-34):** faithfulness 1.000 (n=6), citation precision 0.786, recall
    1.000, refusal accuracy 1.000, correct-refusal 1.000, false-refusal 0.000. REPLACE the old "could
    not re-run / older than retrieval" quota caveat with these figures (do NOT keep it verbatim — the run
    succeeded). Honest footnote: faithfulness n=6 (judge returned no verdict on one correctly-cited answer).

- [ ] **B-14 (P2 · S) — Scrum reconstruction: say it once, confidently (T-15).**
  §2.1 "Honesty note" becomes a two-sentence "Methodological note": the sprint decomposition is
  reverse-engineered from the delivered system's module dependency order; story points are relative
  complexity estimates presented as a plan. Remove the duplicate disclaimer sentence in §2.2 (keep
  the `[CONFIRM: story-point values]` marker + P-06 row — the Register is the right home for it).
  Also trim Figure 2.2's caption second sentence to one clause.

- [ ] **B-15 (P3 · M) — Global self-flagellation sweep.**
  One pass over the whole report for the recurring confessional tics, replacing with neutral,
  forward-looking phrasing while keeping facts and traces: "an honest piece of tech debt we carry
  forward", "we flag rather than hide", "This is reported rather than hidden", "recorded, not
  remediated/fixed" (×5), "Honesty demands", "we are candid about", "a latent consequence we flag
  rather than hide", §2.6's closing debt enumeration (2735-line TasksService etc. → one clause +
  annex pointer). Also §1.4's "(to be substantiated against the tools above)" → drop once P-03 is
  written. Do this LAST so it sweeps the rewritten sections too.

- [ ] **B-16 (P3 · S) — Final-assembly checklist additions (T-17).**
  In the assembly note / task_09 notes: explicit checklist — strip the assembly note + Placeholder
  Register from the export; verify List of Tables includes the B-07 annex table and B-12 table;
  re-verify figure list 1.1–4.6 unchanged; confirm the FR Résumé and EN Abstract numbers still match
  after B-01.

**Execution order:** B-01 → B-02 → B-03 → B-04 → B-05 → B-06 → B-07 (must follow 02–06) → B-08 →
B-09 → B-10 → B-11 → B-12 → B-13 → B-14 → B-15 (sweep, last content pass) → B-16 (assembly).
**But:** answer D-1 before starting B-02.

---

## C. Rejected feedback (grouped, one-line reasons)

**Asks for work/facts that don't exist (would fabricate or desync):**
- Bigger eval — more queries, human evaluation, latency numbers (ChatGPT, DeepSeek): no such data;
  new runs are out of scope for a report-only pass.
- Prometheus/Grafana/tracing/anomaly detection in monitoring (ChatGPT): new feature scope.
- Agentic / adaptive-retrieval AI extensions (ChatGPT): conceded by the reviewer as beyond PFE scope.
- Build CI/CD before the defense (ChatGPT, Gemini, DeepSeek): code change → §F; the framing half is
  accepted as B-09.
- "0→512 e2e test recovery" as report content (Sonnet): appears in no dossier; unclaimable as-is
  (gated behind D-1/D-2 if the author confirms and dossier-izes it).

**Piles on criticism / over-disclosure the framing goal rejects:**
- Keep expanding per-sprint defect detail or add more self-critique: the plan moves the opposite way
  (facts kept, placement consolidated).
- Wholesale length cuts / trimming the cumulative class diagrams (DeepSeek): multiple reviewers call
  the structure and the growing-model device the report's signature strength.

**Already satisfied — no action:**
- "Document decisions, not just code" (ChatGPT): the report already does this everywhere.
- "Permission-aware retrieval deserves emphasis" (ChatGPT, GLM): §4.6 already leads with it; B-01/B-08
  push it into the Abstract/Conclusion closers.
- "Mention the small corpus transparently" (Grok): already disclosed in §4.8; B-13 keeps it to one clause.

---

## D. Needs-user-input

- **D-1 — FULLY RESOLVED (names + titles confirmed 2026-07-07).** Internship with **two TDG
  co-founders supervising**; the author was the **main developer**; the project belongs to the
  company. Author does **not** want to over-expose collaboration to the jury (company privacy) — and
  doesn't need to: the report never itemizes per-line authorship.
  **Confirmed team (use in §2.1 Roles, B-14):** a Scrum team of three —
  - **Ahmed Awedi** — Co-Founder & CEO, TDG — **Product Owner** + frontend supervisor.
  - **Mohamed Awedi** — Co-Founder & CTO, TDG — backend supervisor (Scrum-Master-style unblocking).
  - the author — **Development Team / main developer**.
  **P-05 wording:** "The work was organized as a three-person Scrum team: the author as the Development
  Team and main developer, with two company co-founders as supervisors — the CEO acting as Product
  Owner and frontend supervisor, the CTO as backend supervisor — owning priorities, backlog, and
  unblocking." Both consented to appear on the title page as company supervisors (Q3 = yes → P-35).
- **D-2 — RESOLVED: SKIP.** The real-usage audit (`docs/diagnostic-report-v2.md`) stays **out of the
  report** and is kept as private jury-defense prep (§E). Rationale: dossier-izing it to satisfy the
  citation rule is avoidable work this close to defense, and B-10 already strengthens the testing story
  from existing dossier-cited evidence. Do **not** add an "exploratory validation" passage.
- **D-3 — P-34:** run `npm run ai:eval:qa -- --retrieval=hybrid` when the Gemini quota allows and give
  me the refreshed faithfulness / citation-precision numbers to substitute in §4.8.
- **D-4 — Placeholder Register:** P-01/P-02 (host org + internship framing), P-03 (competitor
  research), P-05 (team size/role — this also decides how §2.1's "Roles" paragraph reads), P-07…P-33
  (screenshots), P-35/P-36 (title page, acknowledgements).
- **D-5 — RESOLVED: APPROVED.** §1.4 (when P-03 is written) uses the T-14 thesis: **integration
  breadth + AI answers grounded in the org's own data under its own RBAC, bilingual, one surface** is
  the differentiator; Jira/Asana/ClickUp/Linear each own a slice. Per-tool comparison rows are the
  supporting evidence, not the headline.
- **D-6 — RESOLVED.** Conclusion subsection = **"Limitations & Perspectives"**; the relocated table
  (B-07) = **"Annex A — Hardening & Future-Work Backlog"**.

---

## E. Author-only: honest assessment & jury-defense notes

*(Private prep. Never in the report.)*

### Where you are genuinely strong — claim these without hedging
- **The RAG subsystem end-to-end.** In-SQL permission scoping, outbox freshness, confidence-gated
  refusal, measured eval with ablations. Every reviewer independently called it real engineering.
  Know Chapter 4 **cold**: be able to draw Figure 4.2 from memory, explain RRF's formula and why
  rank-fusion beats score-fusion, why Matryoshka truncation requires re-normalization, why the outbox
  swallows its own errors.
- **Architecture at scale.** The four-layer rule held over ~20 modules — say "any module reads the
  same way; open one, you've read them all." The two-tier authorization pattern (coarse guard +
  data-scoped service check) is your best security talking point.
- **Evidence discipline.** "Every claim in my report traces to a dossier and, through it, to a
  file:line in the source" is a sentence very few PFE candidates can say. Use it.

### Real weaknesses — and the confident answer for each

| # | Likely jury probe | Honest reality | Suggested answer |
|---|---|---|---|
| Q-01 | "Is this production-ready? You list a lot of bugs." | No; several features are broken end-to-end (invitation UI, ntfy, reminder recurrence, service health-check false alarms). | "It is a functional prototype delivered breadth-first under a six-sprint timeline. Every defect in the annex was found by *my own* audit, is root-caused to the line, and has a designed fix — that's the difference between debt and negligence. Production hardening is a scoped, prioritized backlog, not an unknown." |
| Q-02 | "Why is backend test coverage near zero?" | True for most modules; real coverage = projects spec (854 lines), the e2e RBAC suite, FE property tests. | "I made an explicit trade: 146 endpoints and a measured AI pipeline over broad unit coverage. Where risk was highest I did test — the RBAC permission matrix end-to-end, the projects module's service logic, and property-based tests on the frontend's parsing layers. The AI subsystem is *measured* by a gold-set harness, which for an ML component is the right kind of evidence. The first hardening item is exactly the missing tests — I know which ones, and why those." |
| Q-03 | "MRR = 1.00? Perfect scores are suspicious." | Legit but on a small corpus (73 chunks) and 10 keyword questions; the semantic set was already saturated. | Own it before they ask: "1.00 on the identifier set means the lexical arm always finds an exact ticket-key match and RRF promotes it — it's the expected behavior for exact-match queries, not a general claim. The honest reading is in the semantic set: the embedder was already saturated at 0.958 and hybrid *didn't regress it* — that's the engineering result. The corpus is small; the harness exists precisely so the numbers can be re-run as it grows." |
| Q-04 | "Walk me through the JWT refresh design." (or any deep internal) | You are the main dev; two seniors guided and occasionally coded. You can honestly explain *how every module works* — that's what the dossier work proves — even where a senior's hands touched the keyboard. | Answer on the merits, in system terms: refresh token = the PK of its own row, logout deletes it, access tokens stateless — then pivot to the limits you found (1200-day TTLs, unchecked `type` claim, first items on the hardening list). Knowing a module's weaknesses at line-level *is* the proof of understanding. No authorship disclaimer needed unless directly asked (→ Q-11); if a jury drills past your depth on some corner, "that part was implemented under my supervisors' guidance — what I can walk you through is its design and its limits" is honest and sufficient. |
| Q-05 | "Why not just use Jira/ClickUp?" | P-03 not yet written. | "Each covers a slice. None gives an agency agile *and* free-form projects, attendance, infra monitoring, and an AI that answers questions grounded in your own project data under your own RBAC — in one bilingual system. Integration is the product." (Then the P-03 table.) |
| Q-06 | "Did AI write this code/report?" | Substantial AI-assisted development (this repo's history makes it visible). | "I used AI tooling the way the industry now does — as an accelerant under my direction. Every architectural decision, scope call, and trade-off in this report is mine, and the dossier discipline exists precisely so that every claim is verified against the source rather than generated. Ask me anything in Chapter 4." Then *be able to back it*: your depth targets are Chapter 4, the RBAC design, and one Chapter 3 module of your choice (recommend Tasks/Kanban — the state machine + WIP + dependency gating is rich and demo-able). |
| Q-07 | "Your Scrum history — real or reconstructed?" | Reconstructed; the report says so. | "Reverse-engineered from the delivered system's dependency order, presented as a plan in story points, not dates — I chose transparency over inventing a tracker history. The decomposition itself is real: you cannot build the backlog before projects, or the copilot before the content it indexes." |
| Q-08 | "Why backend endpoints the frontend never calls?" | True (multi-member create, some manager endpoints; one 404s). | "The API is the product boundary — it's designed to serve any client, and the report is explicit that the browser client consumes a subset. Where FE and BE disagree I documented it rather than hiding it." |
| Q-09 | "The copilot refuses keyword queries hybrid could answer?" (if they read §4.10 closely) | True — cosine-only gate. | "Correct, and it's the first AI item on my roadmap: the gate predates the hybrid work, and making it arm-aware is a ~small change I've already specified. The eval harness is what let me *find* that gap." |
| Q-10 | "Why Gemini? Why a free tier for evaluation?" | Pragmatic: managed embeddings+generation, no inference stack; quota bit the QA re-run. | "One managed provider for both embeddings and generation meant zero inference infrastructure for a one-sprint subsystem, and flash-lite gave a separate quota bucket for reranking. The trade-off — rate limits — is documented, and the QA re-run is queued (P-34)." |
| Q-11 | "Did you build all of this alone?" | No — two senior engineers supervised, guided, and occasionally coded alongside; UI stands on shadcn/Radix (disclosed §2.5). Author prefers not to detail internal collaboration (company privacy) — and doesn't have to. | The one-sentence answer, calm and complete: "I carried out this project as the main developer, supervised by two senior engineers at the company who guided the priorities and unblocked me when needed — the standard internship setup." Full stop. That is 100% true, it's what §2.1's Scrum roles will say in writing, and no jury pushes past it — supervision is what an internship *is*. Do not volunteer who-coded-what; if pressed once, "the implementation details of the company's internal collaboration aren't mine to detail, but I can walk you through any part of the system" — then do. |

### Defense mechanics (from ChatGPT/Grok, worth doing)
- Build the 10–15 min demo around **decisions, not screens**: open with Figure 2.1 (scope), then
  Figure 4.2 (RAG pipeline), then a live copilot ask with a citation click-through, then the
  estimation suggestion, then ONE slide on the hardening roadmap — you controlling the debt story
  preempts the jury raising it.
- Rehearse the three depth targets until you can answer without notes: (1) Chapter 4 entirely,
  (2) the RBAC/two-tier authorization design, (3) the Tasks/Kanban engine.
- Pre-render all PlantUML and verify Figure 4.4's confidence-gate branch renders legibly — it's the
  diagram you'll talk to most.
- If the demo DB matters: mind P1-1 — don't demo check-in between 00:00–02:59 UTC (01:00–03:59 local).

---

## F. Code — flagged, not recommended

| Item | Raised by | Why flagged | Desync cost if done now |
|---|---|---|---|
| Minimal CI pipeline (GitHub Actions: lint + build + `prisma validate` + existing suites) | ChatGPT, Gemini, DeepSeek | Only code-level suggestion that is both small and jury-visible; Gemini calls it "easily solvable." | D16 states no CI/CD exists; report asserts it in §2.4, Figure 2.7's caption, the Conclusion's DevOps theme, and Perspectives item 4. Doing it means updating D16 → 4 report locations → the annex, and re-verifying Figure 2.7. **Recommendation: don't** — B-09's reframe + Perspectives item 4 covers it; if you *do* it, tell me and I'll sequence the sync edits. |
| Re-run of the QA/faithfulness eval (P-34) | DeepSeek, Grok | Not a code change — a command run producing numbers to paste. Listed here only because it touches the repo. | None (report already carries the caveat + placeholder). **Recommendation: do it** — see D-3. |

*Everything else stays untouched: the report's citation chain (code → dossier → report) is its
strongest defense asset, and it stays intact.*
