import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CopilotService } from './copilot.service';

/** Aggregated copilot telemetry for the eval dashboard (§6 "Live telemetry"). */
export interface CopilotTelemetrySummary {
  /** Total copilot calls logged. */
  totalQueries: number;
  /** Calls that ended in the honest refusal. */
  refusals: number;
  refusalRate: number;
  latencyMsP50: number;
  latencyMsP95: number;
  /** Mean faithfulness over the calls a judge has scored (null if none scored). */
  avgFaithfulness: number | null;
  faithfulnessScored: number;
  /** Mean best-retrieval-score over calls that retrieved anything. */
  avgTopScore: number | null;
  avgCitations: number;
  avgPromptTokens: number;
  /** Oldest / newest logged call in the window, for the dashboard caption. */
  firstQueryAt: string | null;
  lastQueryAt: string | null;
}

/**
 * Read-only rollup over `CopilotQueryLog` for the telemetry dashboard. Kept as a
 * service so both the admin endpoint and the offline `ai:telemetry` script share
 * one implementation.
 */
@Injectable()
export class TelemetryService {
  constructor(private readonly prismaService: PrismaService) {}

  async copilotSummary(): Promise<CopilotTelemetrySummary> {
    const rows = await this.prismaService.copilotQueryLog.findMany({
      select: {
        answer: true,
        topScore: true,
        faithfulnessScore: true,
        citationsCount: true,
        promptTokens: true,
        latencyMs: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (rows.length === 0) {
      return {
        totalQueries: 0,
        refusals: 0,
        refusalRate: 0,
        latencyMsP50: 0,
        latencyMsP95: 0,
        avgFaithfulness: null,
        faithfulnessScored: 0,
        avgTopScore: null,
        avgCitations: 0,
        avgPromptTokens: 0,
        firstQueryAt: null,
        lastQueryAt: null,
      };
    }

    const refusals = rows.filter(
      (r) => r.answer === CopilotService.REFUSAL,
    ).length;
    const latencies = rows.map((r) => r.latencyMs);
    const faithScores = rows
      .map((r) => r.faithfulnessScore)
      .filter((v): v is number => v !== null);
    const topScores = rows
      .map((r) => r.topScore)
      .filter((v): v is number => v !== null);

    return {
      totalQueries: rows.length,
      refusals,
      refusalRate: round(refusals / rows.length),
      latencyMsP50: percentile(latencies, 0.5),
      latencyMsP95: percentile(latencies, 0.95),
      avgFaithfulness: faithScores.length ? round(avg(faithScores)) : null,
      faithfulnessScored: faithScores.length,
      avgTopScore: topScores.length ? round(avg(topScores)) : null,
      avgCitations: round(avg(rows.map((r) => r.citationsCount))),
      avgPromptTokens: Math.round(avg(rows.map((r) => r.promptTokens))),
      firstQueryAt: rows[0].createdAt.toISOString(),
      lastQueryAt: rows[rows.length - 1].createdAt.toISOString(),
    };
  }
}

/** Nearest-rank percentile over a numeric sample (0..1). */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil(p * sorted.length);
  const index = Math.min(Math.max(rank - 1, 0), sorted.length - 1);
  return sorted[index];
}

function avg(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
