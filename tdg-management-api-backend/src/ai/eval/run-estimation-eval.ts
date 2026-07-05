/**
 * Estimation-quality eval (§6, §4.6) — leave-one-out over every completed task.
 *
 * For each DONE task with real logged effort we re-embed its text as a fresh
 * draft (RETRIEVAL_QUERY), retrieve its nearest completed neighbors *excluding
 * itself*, and run the real `EstimationService.predictFromNeighbors` in BOTH
 * modes — text-only (size-agnostic) and size-aware (given the draft's own story
 * points) — scoring each against the task's real `actualHours`. This is what
 * shows the size-aware path fixes the text-only predictor's regression-to-mean.
 * Both are compared to two baselines:
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
  EstimationService,
  EstimationScope,
} from 'src/ai/services/estimation.service';

import {
  withApp,
  resolveActor,
  parseArgs,
  DEFAULT_ACTOR_EMAIL,
} from './lib/bootstrap';
import {
  regressionScores,
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
  /** Production text-only predictor: EstimationService with no draft points. */
  knnText: number | null;
  knnTextInBand: boolean | null;
  /** Production size-aware predictor: EstimationService given the draft's points. */
  knnPoints: number | null;
  knnPointsLow: number | null;
  knnPointsHigh: number | null;
  knnPointsInBand: boolean | null;
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
    const estimationService = app.get(EstimationService);

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
        estimationService,
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
        knnText: p.knnText,
        knnTextInBand: p.knnTextInBand,
        knnPoints: p.knnPoints,
        knnPointsLow: p.knnPointsLow,
        knnPointsHigh: p.knnPointsHigh,
        knnPointsInBand: p.knnPointsInBand,
        projectMean: p.projectMean,
        storyPointFit: p.storyPointFit,
        neighborCount: p.neighborCount,
      })),
      [
        'key',
        'actual',
        'knnText',
        'knnTextInBand',
        'knnPoints',
        'knnPointsLow',
        'knnPointsHigh',
        'knnPointsInBand',
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
  estimationService: EstimationService,
  allowedProjectIds: string[],
): Promise<Prediction> {
  // Embed the held task as a fresh draft and retrieve its neighbors *excluding
  // itself*, mirroring EstimationService's scope + fallback (§4.6).
  const draftText = held.description?.trim()
    ? `${held.title}\n${held.description}`
    : held.title;
  const queryVector = await embeddingService.embed(
    draftText,
    'RETRIEVAL_QUERY',
  );

  const buffer = k + 5; // over-fetch so we can drop the held task and keep k
  let scope: EstimationScope = 'PROJECT';
  let neighbors = (
    await embeddingRepository.searchCompletedTaskNeighbors(
      queryVector,
      [held.projectId],
      buffer,
    )
  ).filter((n) => n.key !== held.key);

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
    if (wider.length > neighbors.length) {
      neighbors = wider;
      scope = 'BUSINESS_UNIT';
    }
  }
  neighbors = neighbors.slice(0, k);

  // ── Measure the REAL production predictor, both modes ──────────────────────
  // text-only (no draft points) vs size-aware (given the draft's own points).
  let knnText: number | null = null;
  let knnTextInBand: boolean | null = null;
  let knnPoints: number | null = null;
  let knnPointsLow: number | null = null;
  let knnPointsHigh: number | null = null;
  let knnPointsInBand: boolean | null = null;
  if (neighbors.length > 0) {
    const text = estimationService.predictFromNeighbors(neighbors, scope, null);
    knnText = text.predictedHours;
    knnTextInBand =
      text.rangeLow != null && text.rangeHigh != null
        ? held.actualHours >= text.rangeLow &&
          held.actualHours <= text.rangeHigh
        : null;

    const points = estimationService.predictFromNeighbors(
      neighbors,
      scope,
      held.storyPoints,
    );
    knnPoints = points.predictedHours;
    knnPointsLow = points.rangeLow;
    knnPointsHigh = points.rangeHigh;
    knnPointsInBand =
      points.rangeLow != null && points.rangeHigh != null
        ? held.actualHours >= points.rangeLow &&
          held.actualHours <= points.rangeHigh
        : null;
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
    knnText,
    knnTextInBand,
    knnPoints,
    knnPointsLow,
    knnPointsHigh,
    knnPointsInBand,
    projectMean,
    storyPointFit,
    neighborCount: neighbors.length,
  };
}

interface Summary {
  taskCount: number;
  knnText: RegressionScores;
  knnPoints: RegressionScores;
  projectMean: RegressionScores;
  storyPointFit: RegressionScores;
  /** IQR-band calibration for the text-only vs size-aware predictor (ideal ≈ 0.50). */
  bandCalibrationText: number;
  bandCalibrationPoints: number;
  bandN: number;
}

function summarize(predictions: Prediction[]): Summary {
  const score = (pick: (p: Prediction) => number | null): RegressionScores =>
    roundScores(
      regressionScores(
        predictions.map((p) => ({ predicted: pick(p), actual: p.actual })),
      ),
    );

  const calibration = (pick: (p: Prediction) => boolean | null): number => {
    const banded = predictions.filter((p) => pick(p) !== null);
    return banded.length
      ? round(mean(banded.map((p) => (pick(p) ? 1 : 0))))
      : 0;
  };

  const banded = predictions.filter((p) => p.knnPointsInBand !== null);

  return {
    taskCount: predictions.length,
    knnText: score((p) => p.knnText),
    knnPoints: score((p) => p.knnPoints),
    projectMean: score((p) => p.projectMean),
    storyPointFit: score((p) => p.storyPointFit),
    bandCalibrationText: calibration((p) => p.knnTextInBand),
    bandCalibrationPoints: calibration((p) => p.knnPointsInBand),
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
    scoreRow('k-NN (text only)', s.knnText),
    scoreRow('k-NN + points', s.knnPoints),
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
    `\n  Band calibration (fraction of truths inside the band, n=${s.bandN}):` +
      `\n    text-only 25–75 IQR : ${s.bandCalibrationText.toFixed(3)} (nominal ≈ 0.50)` +
      `\n    +points   10–90     : ${s.bandCalibrationPoints.toFixed(3)} (nominal ≈ 0.80)`,
  );
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

main().catch((error) => {
  console.error('Estimation eval failed:', error);
  process.exit(1);
});
