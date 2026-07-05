/**
 * Answer-quality eval for the RAG copilot (§6, §4.5). For each gold question it
 * calls the real `CopilotService.answer` (permission-scoped, grounded) and scores:
 *
 *  - Faithfulness / groundedness — LLM-as-judge over the answer vs the exact
 *    sources it cited (0..1 fraction of claims supported).
 *  - Citation accuracy — precision/recall of the cited refs against `mustCite`.
 *  - Refusal correctness — answerable questions should be answered; the
 *    deliberately-unanswerable ones should trigger the honest refusal.
 *
 * Writes `out/qa-eval.{json,csv}`.
 *
 * Usage:
 *   npm run ai:eval:qa
 *   npm run ai:eval:qa -- --actor=mohamed@tawer.tn
 */
import { EmbeddingEntityType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { GeminiService } from 'src/common/gemini/services/gemini.service';
import { CopilotService } from 'src/ai/services/copilot.service';
import { AiAccessService } from 'src/ai/services/ai-access.service';

import {
  withApp,
  resolveActor,
  parseArgs,
  DEFAULT_ACTOR_EMAIL,
  EvalActor,
} from './lib/bootstrap';
import { RefResolver } from './lib/refs';
import { loadQaGold, QaGoldItem } from './lib/gold';
import { mean, round } from './lib/metrics';
import { writeJson, writeCsv } from './lib/output';
import { FaithfulnessJudge } from './lib/faithfulness-judge';

interface QuestionResult {
  question: string;
  answerable: boolean;
  refused: boolean;
  answer: string;
  citedRefs: string[];
  mustCite: string[];
  citationPrecision: number | null;
  citationRecall: number | null;
  faithfulness: number | null;
  faithfulnessRationale: string | null;
  /** True when the copilot did the right thing on the refusal axis. */
  refusalCorrect: boolean;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const actorEmail =
    typeof args.actor === 'string' ? args.actor : DEFAULT_ACTOR_EMAIL;
  // Space out questions so the copilot + judge calls stay under the Gemini
  // free-tier generation RPM; a genuine throttle is still retried below.
  const delayMs = args.delayMs ? Number(args.delayMs) : 6000;

  await withApp(async (app) => {
    const prisma = app.get(PrismaService);
    const copilot = app.get(CopilotService);
    const gemini = app.get(GeminiService);
    const aiAccess = app.get(AiAccessService);

    const actor = await resolveActor(app, actorEmail);
    // Sanity: the actor must be able to see the graded project content.
    const allowed = await aiAccess.allowedProjectIds(actor.userId, actor.roles);
    const resolver = await RefResolver.build(prisma);
    const judge = new FaithfulnessJudge(gemini);
    const gold = loadQaGold();

    console.log(
      `\nQA eval — actor ${actor.name} (${actor.roles.join(', ')}), ` +
        `${allowed.length} project(s) in scope, ${gold.length} questions\n`,
    );

    const results: QuestionResult[] = [];
    for (let i = 0; i < gold.length; i += 1) {
      const item = gold[i];
      process.stdout.write(`  · ${item.question.slice(0, 60)}… `);
      const result = await gradeWithRetry(
        item,
        copilot,
        prisma,
        resolver,
        judge,
        actor,
      );
      results.push(result);
      console.log(
        result.refused
          ? 'refused'
          : `answered (faithfulness ${result.faithfulness ?? 'n/a'})`,
      );
      if (i < gold.length - 1) await sleep(delayMs);
    }

    const summary = summarize(results);
    printSummary(summary);

    const jsonPath = writeJson('qa-eval', {
      generatedAt: new Date().toISOString(),
      actor: { email: actor.email, roles: actor.roles },
      summary,
      results,
    });
    const csvPath = writeCsv(
      'qa-eval',
      results.map((r) => ({
        question: r.question,
        answerable: r.answerable,
        refused: r.refused,
        refusalCorrect: r.refusalCorrect,
        citationPrecision: r.citationPrecision,
        citationRecall: r.citationRecall,
        faithfulness: r.faithfulness,
      })),
      [
        'question',
        'answerable',
        'refused',
        'refusalCorrect',
        'citationPrecision',
        'citationRecall',
        'faithfulness',
      ],
    );
    console.log(`\nWrote ${jsonPath}\n      ${csvPath}\n`);
  });
}

/**
 * Grade a question, retrying when the copilot returns its "temporarily
 * unavailable" sentinel — on the free tier that means generation was throttled,
 * not a real answer, and must not pollute the metrics.
 */
async function gradeWithRetry(
  item: QaGoldItem,
  copilot: CopilotService,
  prisma: PrismaService,
  resolver: RefResolver,
  judge: FaithfulnessJudge,
  actor: EvalActor,
  maxRetries = 4,
): Promise<QuestionResult> {
  for (let attempt = 0; ; attempt += 1) {
    const result = await gradeQuestion(
      item,
      copilot,
      prisma,
      resolver,
      judge,
      actor,
    );
    const throttled = result.answer.startsWith(CopilotService.UNAVAILABLE);
    if (!throttled || attempt >= maxRetries) return result;
    process.stdout.write('(throttled, retrying) ');
    await sleep(35_000);
  }
}

async function gradeQuestion(
  item: QaGoldItem,
  copilot: CopilotService,
  prisma: PrismaService,
  resolver: RefResolver,
  judge: FaithfulnessJudge,
  actor: EvalActor,
): Promise<QuestionResult> {
  const answer = await copilot.answer({
    userId: actor.userId,
    roles: actor.roles,
    question: item.question,
  });

  const refused = answer.insufficientContext;
  const citedRefs = dedupe(
    answer.citations.map((c) =>
      resolver.toRef({ entityType: c.entityType, entityId: c.entityId }),
    ),
  );
  const mustCite = new Set(item.mustCite);

  // ── Citation precision / recall (only meaningful for answerable questions) ──
  let citationPrecision: number | null = null;
  let citationRecall: number | null = null;
  if (item.answerable) {
    const hits = citedRefs.filter((r) => mustCite.has(r)).length;
    citationPrecision = citedRefs.length === 0 ? 0 : hits / citedRefs.length;
    citationRecall = mustCite.size === 0 ? 1 : hits / mustCite.size;
  }

  // ── Faithfulness (judge answered, cited answers only) ──────────────────────
  let faithfulness: number | null = null;
  let faithfulnessRationale: string | null = null;
  if (!refused && answer.citations.length > 0) {
    const sources = await fetchCitedSources(prisma, answer.citations);
    const verdict = await judge.score(answer.answer, sources);
    if (verdict) {
      faithfulness = round(verdict.score);
      faithfulnessRationale = verdict.rationale;
    }
  }

  const refusalCorrect = item.answerable ? !refused : refused;

  return {
    question: item.question,
    answerable: item.answerable,
    refused,
    answer: answer.answer,
    citedRefs,
    mustCite: item.mustCite,
    citationPrecision:
      citationPrecision === null ? null : round(citationPrecision),
    citationRecall: citationRecall === null ? null : round(citationRecall),
    faithfulness,
    faithfulnessRationale,
    refusalCorrect,
  };
}

/** Full embedded text of each cited entity, for the faithfulness judge. */
async function fetchCitedSources(
  prisma: PrismaService,
  citations: { entityType: EmbeddingEntityType; entityId: string }[],
): Promise<string[]> {
  const sources: string[] = [];
  const seen = new Set<string>();
  for (const c of citations) {
    const key = `${c.entityType}:${c.entityId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const chunks = await prisma.documentEmbedding.findMany({
      where: { entityType: c.entityType, entityId: c.entityId },
      select: { content: true },
      orderBy: { chunkIndex: 'asc' },
    });
    if (chunks.length > 0) {
      sources.push(chunks.map((ch) => ch.content).join('\n'));
    }
  }
  return sources;
}

function dedupe(refs: string[]): string[] {
  return Array.from(new Set(refs));
}

interface Summary {
  questions: number;
  answerable: number;
  unanswerable: number;
  meanFaithfulness: number | null;
  faithfulnessN: number;
  meanCitationPrecision: number | null;
  meanCitationRecall: number | null;
  refusalAccuracy: number;
  falseRefusalRate: number;
  correctRefusalRate: number | null;
}

function summarize(results: QuestionResult[]): Summary {
  const answerable = results.filter((r) => r.answerable);
  const unanswerable = results.filter((r) => !r.answerable);

  const faithScores = results
    .map((r) => r.faithfulness)
    .filter((v): v is number => v !== null);
  const precScores = answerable
    .map((r) => r.citationPrecision)
    .filter((v): v is number => v !== null);
  const recallScores = answerable
    .map((r) => r.citationRecall)
    .filter((v): v is number => v !== null);

  return {
    questions: results.length,
    answerable: answerable.length,
    unanswerable: unanswerable.length,
    meanFaithfulness: faithScores.length ? round(mean(faithScores)) : null,
    faithfulnessN: faithScores.length,
    meanCitationPrecision: precScores.length ? round(mean(precScores)) : null,
    meanCitationRecall: recallScores.length ? round(mean(recallScores)) : null,
    refusalAccuracy: round(
      mean(results.map((r) => (r.refusalCorrect ? 1 : 0))),
    ),
    falseRefusalRate: answerable.length
      ? round(mean(answerable.map((r) => (r.refused ? 1 : 0))))
      : 0,
    correctRefusalRate: unanswerable.length
      ? round(mean(unanswerable.map((r) => (r.refused ? 1 : 0))))
      : null,
  };
}

function printSummary(s: Summary): void {
  console.log('\n=== Copilot answer quality ===');
  console.log(
    `  questions              : ${s.questions} (${s.answerable} answerable, ${s.unanswerable} unanswerable)`,
  );
  console.log(
    `  mean faithfulness      : ${fmt(s.meanFaithfulness)} (n=${s.faithfulnessN})`,
  );
  console.log(`  citation precision     : ${fmt(s.meanCitationPrecision)}`);
  console.log(`  citation recall        : ${fmt(s.meanCitationRecall)}`);
  console.log(`  refusal accuracy (all) : ${fmt(s.refusalAccuracy)}`);
  console.log(`  correct refusals (unans): ${fmt(s.correctRefusalRate)}`);
  console.log(`  false-refusal rate     : ${fmt(s.falseRefusalRate)}`);
}

const fmt = (v: number | null): string => (v === null ? 'n/a' : v.toFixed(3));

main().catch((error) => {
  console.error('QA eval failed:', error);
  process.exit(1);
});
