/**
 * LLM-as-judge faithfulness / groundedness scoring (§4.5 step 7, §6).
 *
 * Given an answer and the exact sources it was allowed to use, a second cheap
 * Gemini pass estimates what fraction of the answer's factual claims actually
 * follow from those sources (0 = ungrounded/hallucinated, 1 = fully supported).
 * Shared by `run-qa-eval` (offline gold eval) and `backfill-faithfulness`
 * (scoring real `CopilotQueryLog` rows after the fact).
 *
 * The judge is deliberately conservative and returns a plain number so it can be
 * averaged and charted; the prompt keeps sources and answer clearly separated so
 * untrusted retrieved text can't steer the score (§7).
 */
import { GeminiService } from 'src/common/gemini/services/gemini.service';

export interface FaithfulnessVerdict {
  /** 0..1 fraction of claims supported by the sources. */
  score: number;
  /** One-line rationale from the judge (kept for spot-checking / the report). */
  rationale: string;
}

export class FaithfulnessJudge {
  constructor(private readonly gemini: GeminiService) {}

  /**
   * Score how well `answer` is supported by `sources`. Returns `null` only when
   * the judge call fails entirely (so callers can skip rather than record a 0).
   */
  async score(
    answer: string,
    sources: string[],
  ): Promise<FaithfulnessVerdict | null> {
    if (sources.length === 0) {
      return {
        score: 0,
        rationale: 'No sources were provided to support the answer.',
      };
    }

    const numbered = sources
      .map(
        (s, i) => `[${i + 1}] ${s.replace(/\s+/g, ' ').trim().slice(0, 1500)}`,
      )
      .join('\n\n');

    const prompt = [
      'You are a strict faithfulness judge for a retrieval-augmented answer.',
      "Decide what fraction of the ANSWER's factual claims are directly supported by the SOURCES.",
      'A claim is supported only if a source states or clearly entails it. Outside knowledge does not count as support.',
      'Ignore hedging, questions, and generic filler; judge only concrete factual claims.',
      '',
      'SOURCES:',
      numbered,
      '',
      'ANSWER:',
      answer.replace(/\s+/g, ' ').trim(),
      '',
      'Respond with ONLY a compact JSON object of the form',
      '{"score": <number 0..1>, "rationale": "<short reason>"}',
      'where score is the fraction of supported claims. No markdown, no code fences.',
    ].join('\n');

    // `generateContent` swallows errors into `null` (no retry of its own), which
    // on the free tier usually means a transient rate limit — retry a couple of
    // times with a long pause before giving up.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const raw = await this.gemini.generateContent(prompt);
      if (raw !== null) return this.parse(raw);
      if (attempt < 2) await sleep(20_000);
    }
    return null;
  }

  /** Extract the JSON verdict, tolerating code fences / surrounding prose. */
  private parse(raw: string): FaithfulnessVerdict {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return {
        score: 0,
        rationale: `Unparseable judge output: ${raw.slice(0, 120)}`,
      };
    }
    try {
      const parsed = JSON.parse(match[0]) as {
        score?: unknown;
        rationale?: unknown;
      };
      const score =
        typeof parsed.score === 'number'
          ? Math.min(Math.max(parsed.score, 0), 1)
          : 0;
      const rationale =
        typeof parsed.rationale === 'string' ? parsed.rationale : '';
      return { score, rationale };
    } catch {
      return {
        score: 0,
        rationale: `Unparseable judge output: ${raw.slice(0, 120)}`,
      };
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
