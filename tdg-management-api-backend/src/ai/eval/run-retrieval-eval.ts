/**
 * Retrieval-quality eval (§6). For each gold question it runs one or more
 * retriever configs, turns the ranked hits into canonical refs, and scores them
 * against the hand-labeled relevant set with Recall@k, Precision@k, MRR and
 * nDCG@k — then prints a config-vs-config comparison table and writes
 * `out/retrieval-eval.{json,csv}`.
 *
 * The default configs (`baseline`, `wrong-task-type`) run against the real
 * pgvector index and only cost query embeddings. Add `--configs=...,dims-3072`
 * for the dimensionality ablation, which re-embeds the corpus in memory. Hybrid
 * and reranking are reserved for M5 (§ out of scope) but recognized as names.
 *
 * Usage:
 *   npm run ai:eval:retrieval
 *   npm run ai:eval:retrieval -- --configs=baseline,wrong-task-type,dims-3072
 *   npm run ai:eval:retrieval -- --k=10 --actor=mohamed@tawer.tn
 */
import { GoogleGenAI } from '@google/genai';
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
import { RefResolver } from './lib/refs';
import { loadRetrievalGold } from './lib/gold';
import {
  recallAtK,
  precisionAtK,
  reciprocalRank,
  ndcgAtK,
  mean,
  round,
} from './lib/metrics';
import { writeJson, writeCsv } from './lib/output';
import {
  Retriever,
  RETRIEVAL_CONFIGS,
  RESERVED_CONFIGS,
  PgVectorRetriever,
  InMemoryRetriever,
} from './lib/retrievers';

const K_VALUES = [1, 3, 5, 10];

interface ConfigMetrics {
  config: string;
  note: string;
  questions: number;
  mrr: number;
  perK: Record<number, { recall: number; precision: number; ndcg: number }>;
  perQuestion: {
    question: string;
    rankedRefs: string[];
    relevant: string[];
    reciprocalRank: number;
  }[];
}

async function evalConfig(
  retriever: Retriever,
  resolver: RefResolver,
  note: string,
  depth: number,
  reportKs: number[],
): Promise<ConfigMetrics> {
  const gold = loadRetrievalGold();

  const perQuestion: ConfigMetrics['perQuestion'] = [];
  const rrs: number[] = [];
  const recallByK: Record<number, number[]> = {};
  const precByK: Record<number, number[]> = {};
  const ndcgByK: Record<number, number[]> = {};
  for (const k of reportKs) {
    recallByK[k] = [];
    precByK[k] = [];
    ndcgByK[k] = [];
  }

  for (const item of gold) {
    const hits = await retriever.retrieve(item.question, depth);
    const rankedRefs = dedupeRefs(hits.map((h) => resolver.toRef(h)));
    const relevant = new Set(item.relevantEntityIds);

    const rr = reciprocalRank(rankedRefs, relevant);
    rrs.push(rr);
    for (const k of reportKs) {
      recallByK[k].push(recallAtK(rankedRefs, relevant, k));
      precByK[k].push(precisionAtK(rankedRefs, relevant, k));
      ndcgByK[k].push(ndcgAtK(rankedRefs, relevant, k));
    }
    perQuestion.push({
      question: item.question,
      rankedRefs: rankedRefs.slice(0, depth),
      relevant: item.relevantEntityIds,
      reciprocalRank: round(rr),
    });
  }

  const perK: ConfigMetrics['perK'] = {};
  for (const k of reportKs) {
    perK[k] = {
      recall: round(mean(recallByK[k])),
      precision: round(mean(precByK[k])),
      ndcg: round(mean(ndcgByK[k])),
    };
  }

  return {
    config: retriever.name,
    note,
    questions: gold.length,
    mrr: round(mean(rrs)),
    perK,
    perQuestion,
  };
}

/** Collapse chunk-level hits to first-occurrence-ordered unique refs. */
function dedupeRefs(refs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ref of refs) {
    if (!seen.has(ref)) {
      seen.add(ref);
      out.push(ref);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const depth = args.k ? Number(args.k) : 10;
  const reportKs = K_VALUES.filter((k) => k <= depth);
  if (!reportKs.includes(depth)) reportKs.push(depth);
  const actorEmail =
    typeof args.actor === 'string' ? args.actor : DEFAULT_ACTOR_EMAIL;
  const configNames =
    typeof args.configs === 'string'
      ? args.configs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['baseline', 'wrong-task-type'];

  await withApp(async (app) => {
    const prisma = app.get(PrismaService);
    const embeddingService = app.get(EmbeddingService);
    const embeddingRepository = app.get(EmbeddingRepository);
    const aiAccess = app.get(AiAccessService);
    const client = app.get<GoogleGenAI>('GEMINI_CLIENT');

    const actor = await resolveActor(app, actorEmail);
    const allowedProjectIds = await aiAccess.allowedProjectIds(
      actor.userId,
      actor.roles,
    );
    const resolver = await RefResolver.build(prisma);

    console.log(
      `\nRetrieval eval — actor ${actor.name} (${actor.roles.join(', ')}), ` +
        `${allowedProjectIds.length} project(s) in scope, depth ${depth}\n`,
    );

    const results: ConfigMetrics[] = [];
    for (const name of configNames) {
      if (RESERVED_CONFIGS.includes(name)) {
        console.log(
          `  · skipping "${name}" — reserved for the M5 hybrid/reranker sprint (not implemented).`,
        );
        continue;
      }
      const config = RETRIEVAL_CONFIGS[name];
      if (!config) {
        console.log(
          `  · skipping "${name}" — unknown config. Available: ${Object.keys(
            RETRIEVAL_CONFIGS,
          ).join(', ')}.`,
        );
        continue;
      }

      const retriever: Retriever =
        config.backend === 'pgvector'
          ? new PgVectorRetriever(
              config,
              embeddingService,
              embeddingRepository,
              allowedProjectIds,
            )
          : new InMemoryRetriever(config, client, prisma, allowedProjectIds);

      console.log(`  · running "${name}" (${config.backend})…`);
      results.push(
        await evalConfig(retriever, resolver, config.note, depth, reportKs),
      );
    }

    if (results.length === 0) {
      throw new Error('No valid configs to run.');
    }

    printTable(results, reportKs);

    const jsonPath = writeJson('retrieval-eval', {
      generatedAt: new Date().toISOString(),
      actor: { email: actor.email, roles: actor.roles },
      depth,
      reportKs,
      results,
    });
    const csvRows = results.flatMap((r) =>
      reportKs.map((k) => ({
        config: r.config,
        k,
        recall: r.perK[k].recall,
        precision: r.perK[k].precision,
        ndcg: r.perK[k].ndcg,
        mrr: r.mrr,
        questions: r.questions,
      })),
    );
    const csvPath = writeCsv('retrieval-eval', csvRows, [
      'config',
      'k',
      'recall',
      'precision',
      'ndcg',
      'mrr',
      'questions',
    ]);
    console.log(`\nWrote ${jsonPath}\n      ${csvPath}\n`);
  });
}

function printTable(results: ConfigMetrics[], reportKs: number[]): void {
  console.log('\n=== Retrieval quality (mean over gold questions) ===');
  const header = [
    'config',
    'MRR',
    ...reportKs.flatMap((k) => [`R@${k}`, `nDCG@${k}`]),
  ];
  const rows = results.map((r) => [
    r.config,
    r.mrr.toFixed(3),
    ...reportKs.flatMap((k) => [
      r.perK[k].recall.toFixed(3),
      r.perK[k].ndcg.toFixed(3),
    ]),
  ]);
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((row) => row[i].length)),
  );
  const fmt = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join('  ');
  console.log(fmt(header));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(fmt(row));
}

main().catch((error) => {
  console.error('Retrieval eval failed:', error);
  process.exit(1);
});
