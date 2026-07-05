/**
 * Copilot telemetry summary (§6 "Live telemetry"). Rolls up every
 * `CopilotQueryLog` row into the dashboard numbers — latency p50/p95, mean
 * faithfulness, refusal rate, average top-score / citations — prints them and
 * writes `out/telemetry-summary.{json,csv}` for a report screenshot. Reuses the
 * same `TelemetryService` the admin endpoint serves.
 *
 * Usage:  npm run ai:telemetry
 */
import { TelemetryService } from 'src/ai/services/telemetry.service';
import { withApp } from './lib/bootstrap';
import { writeJson, writeCsv } from './lib/output';

async function main(): Promise<void> {
  await withApp(async (app) => {
    const telemetry = app.get(TelemetryService);
    const summary = await telemetry.copilotSummary();

    console.log('\n=== Copilot telemetry ===');
    console.log(`  total queries     : ${summary.totalQueries}`);
    console.log(
      `  refusals          : ${summary.refusals} (${(summary.refusalRate * 100).toFixed(1)}%)`,
    );
    console.log(
      `  latency p50 / p95 : ${summary.latencyMsP50} ms / ${summary.latencyMsP95} ms`,
    );
    console.log(
      `  avg faithfulness  : ${summary.avgFaithfulness === null ? 'n/a' : summary.avgFaithfulness.toFixed(3)} (scored ${summary.faithfulnessScored})`,
    );
    console.log(
      `  avg top score     : ${summary.avgTopScore === null ? 'n/a' : summary.avgTopScore.toFixed(3)}`,
    );
    console.log(`  avg citations     : ${summary.avgCitations}`);
    console.log(`  avg prompt tokens : ${summary.avgPromptTokens}`);

    const jsonPath = writeJson('telemetry-summary', {
      generatedAt: new Date().toISOString(),
      ...summary,
    });
    const csvPath = writeCsv('telemetry-summary', [
      summary as unknown as Record<string, unknown>,
    ]);
    console.log(`\nWrote ${jsonPath}\n      ${csvPath}\n`);
  });
}

main().catch((error) => {
  console.error('Telemetry summary failed:', error);
  process.exit(1);
});
