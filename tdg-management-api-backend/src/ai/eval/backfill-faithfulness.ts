/**
 * Deferred faithfulness scoring for live copilot calls (§4.5 step 7).
 *
 * The live pipeline logs `CopilotQueryLog` rows with `faithfulnessScore = null`
 * (the judge is intentionally out of the request hot path). This one-shot script
 * drains those unscored, non-refused rows: it fetches the exact retrieved sources
 * they used (`retrievedIds` → `DocumentEmbedding.content`), runs the shared
 * faithfulness judge, and writes the score back. Idempotent — only null rows are
 * touched, so it can be run repeatedly (e.g. on a cron) as usage accrues.
 *
 * Usage:
 *   npm run ai:eval:faithfulness
 *   npm run ai:eval:faithfulness -- --limit=200
 */
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { GeminiService } from 'src/common/gemini/services/gemini.service';
import { CopilotService } from 'src/ai/services/copilot.service';
import { withApp, parseArgs } from './lib/bootstrap';
import { FaithfulnessJudge } from './lib/faithfulness-judge';

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const limit = args.limit ? Number(args.limit) : 500;

  await withApp(async (app) => {
    const prisma = app.get(PrismaService);
    const gemini = app.get(GeminiService);
    const judge = new FaithfulnessJudge(gemini);

    const rows = await prisma.copilotQueryLog.findMany({
      where: {
        faithfulnessScore: null,
        answer: { not: CopilotService.REFUSAL },
      },
      select: { id: true, answer: true, retrievedIds: true },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    console.log(
      `\nFaithfulness backfill — ${rows.length} unscored copilot call(s)\n`,
    );

    let scored = 0;
    let skipped = 0;
    for (const row of rows) {
      if (row.retrievedIds.length === 0 || row.answer.trim().length === 0) {
        skipped += 1;
        continue;
      }
      const chunks = await prisma.documentEmbedding.findMany({
        where: { id: { in: row.retrievedIds } },
        select: { content: true },
      });
      const sources = chunks.map((c) => c.content);
      const verdict = await judge.score(row.answer, sources);
      if (!verdict) {
        skipped += 1;
        continue;
      }
      await prisma.copilotQueryLog.update({
        where: { id: row.id },
        data: { faithfulnessScore: verdict.score },
      });
      scored += 1;
      process.stdout.write('.');
    }
    console.log('');
    console.log(`\nScored ${scored}, skipped ${skipped}.\n`);
  });
}

main().catch((error) => {
  console.error('Faithfulness backfill failed:', error);
  process.exit(1);
});
