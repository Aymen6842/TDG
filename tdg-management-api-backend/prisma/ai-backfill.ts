/**
 * One-shot AI backfill (Sprint 2 / M0).
 *
 * Embeds all existing tasks, comments, epics, milestones and sprints into
 * `DocumentEmbedding` so the vector index is populated on first deploy.
 * Idempotent — re-running skips chunks whose content hash is unchanged.
 *
 * Run with:  npm run ai:backfill
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { IndexingService } from 'src/ai/services/indexing.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const indexingService = app.get(IndexingService);
    console.log('Starting AI content backfill…');
    const summary = await indexingService.reindexAll();
    console.log('\nBackfill complete:');
    console.table(summary);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('AI backfill failed:', error);
  process.exit(1);
});
