/**
 * Estimation-quality eval (§6, §4.6) — leave-one-out over every completed task.
 *
 * For each DONE task with real logged effort we re-embed its text as a fresh
 * draft (RETRIEVAL_QUERY), retrieve its nearest completed neighbors *excluding
 * itself*, and predict hours exactly the way `EstimationService` does (similarity-
 * weighted median, with a weighted IQR band). We then score the prediction
 * against the task's real `actualHours` and compare the k-NN predictor to two
 * baselines it must beat:
 *
 *   - project-mean  — predict the mean actualHours of the other tasks in the
 *     same project.
 *   - storypoints→hours — an OLS linear fit of hours on story points (refit
 *     leave-one-out), predicting from the held-out task's story points.
 *
 * Metrics: MAE, RMSE, % within ±25%, and (for k-NN) the IQR-band calibration —
 * how often the true value lands inside the predicted range. Writes
 * `out/estimation-eval.{json,csv}`.
 *
 * Usage:
 *   npm run ai:eval:estimation
 *   npm run ai:eval:estimation -- --k=8 --actor=mohamed@tawer.tn
 */
import { EmbeddingEntityType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { EmbeddingService } from 'src/ai/services/embedding.service';
import { EmbeddingRepository } from 'src/ai/repositories/embedding.repository';
import { AiAccessService } from 'src/ai/services/ai-access.service';

import {
  withApp,
  resolveActor,
  parseArgs,
  DEFAULT_ACTOR_EMAIL,
} from './lib/bootstrap';
import {
  regressionScores,
  weightedPercentile,
  linearFit,
  mean,
  round,
  RegressionScores,
} from './lib/metrics';
import { writeJson, writeCsv } from './lib/output';

interface CompletedTask {
  id: string;
  key: string;
  title: string;
  description: string | null;
  projectId: string;
  storyPoints: number | null;
  actualHours: number;
}

interface Prediction {
  key: string;
  actual: number;
  knn: number | null;
  knnLow: number | null;
  knnHigh: number | null;
  inBand: boolean | null;
  /** Variant A: text neighbors re-weighted by story-point proximity to the draft. */
  knnSizeWeighted: number | null;
  /** Variant B: draft points × similarity-weighted median of neighbor hours/point. */
  knnHoursPerPoint: number | null;
  projectMean: number | null;
  storyPointFit: number | null;
  neighborCount: number;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const k = args.k ? Number(args.k) : 8;
  const actorEmail =
    typeof args.actor === 'string' ? args.actor : DEFAULT_ACTOR_EMAIL;

  await withApp(async (app) => {
    const prisma = app.get(PrismaService);
    const embeddingService = app.get(EmbeddingService);
    const embeddingRepository = app.get(EmbeddingRepository);
    const aiAccess = app.get(AiAccessService);

    const actor = await resolveActor(app, actorEmail);
    const allowed = await aiAccess.allowedProjectIds(actor.userId, actor.roles);

    const tasks = await loadCompletedTasks(prisma);
    console.log(
      `\nEstimation eval — leave-one-out over ${tasks.length} completed tasks, k=${k}\n`,
    );
    if (tasks.length < 3) {
      throw new Error(
        'Too few completed tasks with embeddings to evaluate — seed + backfill first.',
      );
    }

    const predictions: Prediction[] = [];
    for (const held of tasks) {
      const p = await predictOne(
        held,
        tasks,
        k,
        embeddingService,
        embeddingRepository,
        aiAccess,
        allowed,
      );
      predictions.push(p);
      process.stdout.write('.');
    }
    console.log('');

    const summary = summarize(predictions);
    printSummary(summary);

    const jsonPath = writeJson('estimation-eval', {
      generatedAt: new Date().toISOString(),
      actor: { email: actor.email, roles: actor.roles },
      k,
      taskCount: tasks.length,
      summary,
      predictions,
    });
    const csvPath = writeCsv(
      'estimation-eval',
      predictions.map((p) => ({
        key: p.key,
        actual: p.actual,
        knn: p.knn,
        knnLow: p.knnLow,
        knnHigh: p.knnHigh,
        inBand: p.inBand,
        knnSizeWeighted: p.knnSizeWeighted,
        knnHoursPerPoint: p.knnHoursPerPoint,
        projectMean: p.projectMean,
        storyPointFit: p.storyPointFit,
        neighborCount: p.neighborCount,
      })),
      [
        'key',
        'actual',
        'knn',
        'knnLow',
        'knnHigh',
        'inBand',
        'knnSizeWeighted',
        'knnHoursPerPoint',
        'projectMean',
        'storyPointFit',
        'neighborCount',
      ],
    );
    console.log(`\nWrote ${jsonPath}\n      ${csvPath}\n`);
  });
}

/** DONE tasks with real effort AND a TASK embedding (so retrieval is defined). */
async function loadCompletedTasks(
  prisma: PrismaService,
): Promise<CompletedTask[]> {
  const embedded = await prisma.documentEmbedding.findMany({
    where: { entityType: EmbeddingEntityType.TASK },
    select: { entityId: true },
    distinct: ['entityId'],
  });
  const embeddedIds = new Set(embedded.map((e) => e.entityId));

  const tasks = await prisma.task.findMany({
    where: { status: 'DONE', actualHours: { gt: 0 } },
    select: {
      id: true,
      key: true,
      title: true,
      description: true,
      projectId: true,
      storyPoints: true,
      actualHours: true,
    },
  });
  return tasks.filter((t) => embeddedIds.has(t.id));
}

async function predictOne(
  held: CompletedTask,
  all: CompletedTask[],
  k: number,
  embeddingService: EmbeddingService,
  embeddingRepository: EmbeddingRepository,
  aiAccess: AiAccessService,
  allowedProjectIds: string[],
): Promise<Prediction> {
  // ── k-NN predictor (mirrors EstimationService, but excluding the held task) ──
  const draftText = held.description?.trim()
    ? `${held.title}\n${held.description}`
    : held.title;
  const queryVector = await embeddingService.embed(
    draftText,
    'RETRIEVAL_QUERY',
  );

  // Over-fetch so we can drop the held task itself and still keep k neighbors.
  const buffer = k + 5;
  let neighbors = (
    await embeddingRepository.searchCompletedTaskNeighbors(
      queryVector,
      [held.projectId],
      buffer,
    )
  ).filter((n) => n.key !== held.key);

  // Project → business-unit fallback, exactly like EstimationService (§4.6).
  if (neighbors.length < 3) {
    const buProjectIds = await aiAccess.sameBusinessUnitProjectIds(
      held.projectId,
      allowedProjectIds,
    );
    const wider = (
      await embeddingRepository.searchCompletedTaskNeighbors(
        queryVector,
        buProjectIds,
        buffer,
      )
    ).filter((n) => n.key !== held.key);
    if (wider.length > neighbors.length) neighbors = wider;
  }
  neighbors = neighbors.slice(0, k);

  let knn: number | null = null;
  let knnLow: number | null = null;
  let knnHigh: number | null = null;
  let inBand: boolean | null = null;
  if (neighbors.length > 0) {
    const total = neighbors.reduce((s, n) => s + Math.max(n.similarity, 0), 0);
    const samples = neighbors.map((n) => ({
      value: n.actualHours,
      weight: total > 0 ? Math.max(n.similarity, 0) : 1,
    }));
    knn = round1(weightedPercentile(samples, 0.5));
    knnLow = round1(weightedPercentile(samples, 0.25));
    knnHigh = round1(weightedPercentile(samples, 0.75));
    inBand = held.actualHours >= knnLow && held.actualHours <= knnHigh;
  }

  // ── Variants that fold a SIZE signal into the text neighbors ───────────────
  // The plain k-NN above regresses to the mean because text similarity does not
  // track effort (corr ≈ 0). These reuse the same neighbors but bring in the
  // draft's story points — the dominant effort driver — to show what fixes it.
  let knnSizeWeighted: number | null = null;
  let knnHoursPerPoint: number | null = null;
  if (neighbors.length > 0 && held.storyPoints != null) {
    const draftPoints = held.storyPoints;

    // Variant A: re-weight text neighbors by story-point proximity, so a
    // topically-similar BUT size-mismatched neighbor stops dominating.
    const sizeSamples = neighbors.map((n) => {
      const textSim = Math.max(n.similarity, 0);
      const sizeProximity =
        n.storyPoints != null
          ? 1 / (1 + Math.abs(n.storyPoints - draftPoints))
          : 0.1;
      return { value: n.actualHours, weight: textSim * sizeProximity };
    });
    if (sizeSamples.some((s) => s.weight > 0)) {
      knnSizeWeighted = round1(weightedPercentile(sizeSamples, 0.5));
    }

    // Variant B: predict the local hours-per-point rate from the neighbors, then
    // scale by the draft's own points (local reference-class forecasting).
    const rateSamples = neighbors
      .filter((n) => n.storyPoints != null && n.storyPoints > 0)
      .map((n) => ({
        value: n.actualHours / (n.storyPoints as number),
        weight: Math.max(n.similarity, 0),
      }));
    if (rateSamples.length > 0) {
      const rate = weightedPercentile(rateSamples, 0.5);
      knnHoursPerPoint = round1(rate * draftPoints);
    }
  }

  // ── Baseline 1: project mean of the OTHER completed tasks ──────────────────
  const projectPeers = all.filter(
    (t) => t.projectId === held.projectId && t.key !== held.key,
  );
  const projectMean =
    projectPeers.length > 0
      ? round1(mean(projectPeers.map((t) => t.actualHours)))
      : null;

  // ── Baseline 2: story-points → hours OLS fit (leave-one-out) ───────────────
  let storyPointFit: number | null = null;
  if (held.storyPoints != null) {
    const fitPoints = all
      .filter((t) => t.key !== held.key && t.storyPoints != null)
      .map((t) => ({ x: t.storyPoints as number, y: t.actualHours }));
    if (fitPoints.length >= 2) {
      const { slope, intercept } = linearFit(fitPoints);
      storyPointFit = round1(Math.max(0, slope * held.storyPoints + intercept));
    }
  }

  return {
    key: held.key,
    actual: held.actualHours,
    knn,
    knnLow,
    knnHigh,
    inBand,
    knnSizeWeighted,
    knnHoursPerPoint,
    projectMean,
    storyPointFit,
    neighborCount: neighbors.length,
  };
}

interface Summary {
  taskCount: number;
  knn: RegressionScores;
  knnSizeWeighted: RegressionScores;
  knnHoursPerPoint: RegressionScores;
  projectMean: RegressionScores;
  storyPointFit: RegressionScores;
  /** Fraction of held-out tasks whose true value fell inside the IQR band. */
  bandCalibration: number;
  bandN: number;
}

function summarize(predictions: Prediction[]): Summary {
  const score = (pick: (p: Prediction) => number | null): RegressionScores =>
    roundScores(
      regressionScores(
        predictions.map((p) => ({ predicted: pick(p), actual: p.actual })),
      ),
    );

  const banded = predictions.filter((p) => p.inBand !== null);
  const bandCalibration = banded.length
    ? round(mean(banded.map((p) => (p.inBand ? 1 : 0))))
    : 0;

  return {
    taskCount: predictions.length,
    knn: score((p) => p.knn),
    knnSizeWeighted: score((p) => p.knnSizeWeighted),
    knnHoursPerPoint: score((p) => p.knnHoursPerPoint),
    projectMean: score((p) => p.projectMean),
    storyPointFit: score((p) => p.storyPointFit),
    bandCalibration,
    bandN: banded.length,
  };
}

function roundScores(s: RegressionScores): RegressionScores {
  return {
    mae: round(s.mae, 2),
    rmse: round(s.rmse, 2),
    withinTolerance: round(s.withinTolerance),
    n: s.n,
  };
}

function printSummary(s: Summary): void {
  console.log('\n=== Estimation quality (leave-one-out) ===');
  const header = ['predictor', 'MAE', 'RMSE', 'within±25%', 'n'];
  const scoreRow = (label: string, sc: RegressionScores) => [
    label,
    sc.mae,
    sc.rmse,
    sc.withinTolerance,
    sc.n,
  ];
  const rows = [
    scoreRow('k-NN (text only)', s.knn),
    scoreRow('k-NN + size weight', s.knnSizeWeighted),
    scoreRow('k-NN hours/point', s.knnHoursPerPoint),
    scoreRow('project-mean', s.projectMean),
    scoreRow('storypoints→hours', s.storyPointFit),
  ].map((r) => r.map((c) => String(c)));
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((row) => row[i].length)),
  );
  const fmt = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join('  ');
  console.log(fmt(header));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(fmt(row));
  console.log(
    `\n  IQR-band calibration : ${s.bandCalibration.toFixed(3)} of true values inside the predicted range (n=${s.bandN}, ideal ≈ 0.50)`,
  );
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

main().catch((error) => {
  console.error('Estimation eval failed:', error);
  process.exit(1);
});
