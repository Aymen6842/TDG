/**
 * Gold-set loading (§6). The hand-labeled truth lives in `gold/*.jsonl`, one JSON
 * object per line, and is committed so every run is reproducible. Labels use the
 * canonical refs from {@link ./refs} (e.g. `COMMENT:NDF-3`), never raw ids.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

export const GOLD_DIR = join(__dirname, '..', 'gold');

/** A retrieval gold item: a question and the refs that should be retrieved. */
export interface RetrievalGoldItem {
  question: string;
  relevantEntityIds: string[];
}

/** A QA gold item: a question, a reference answer, and who it must cite. */
export interface QaGoldItem {
  question: string;
  answer: string;
  mustCite: string[];
  /** False for deliberately-unanswerable questions (the copilot should refuse). */
  answerable: boolean;
}

/** Parse a `.jsonl` file into an array of `T`, skipping blank lines. */
export function loadJsonl<T>(fileName: string): T[] {
  const path = join(GOLD_DIR, fileName);
  const raw = readFileSync(path, 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, i) => {
      try {
        return JSON.parse(line) as T;
      } catch (error) {
        throw new Error(
          `Malformed JSON on line ${i + 1} of ${fileName}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    });
}

/**
 * Named retrieval gold sets. `semantic` (default) is the original natural-language
 * set; `keyword` is a lexical-stress set of identifier / acronym / proper-noun
 * queries (task keys like "NDF-24", "LoRaWAN vs NB-IoT", "e-Dinar") — the queries
 * a pure bi-encoder is weakest on and where hybrid+RRF is expected to help.
 */
export const RETRIEVAL_GOLD_SETS: Record<string, string> = {
  semantic: 'retrieval.jsonl',
  keyword: 'retrieval-keyword.jsonl',
};

export const loadRetrievalGold = (
  set: string = 'semantic',
): RetrievalGoldItem[] => {
  const fileName = RETRIEVAL_GOLD_SETS[set];
  if (!fileName) {
    throw new Error(
      `Unknown retrieval gold set "${set}". Available: ${Object.keys(
        RETRIEVAL_GOLD_SETS,
      ).join(', ')}.`,
    );
  }
  return loadJsonl<RetrievalGoldItem>(fileName);
};

export const loadQaGold = (): QaGoldItem[] => loadJsonl<QaGoldItem>('qa.jsonl');
