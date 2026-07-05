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

export const loadRetrievalGold = (): RetrievalGoldItem[] =>
  loadJsonl<RetrievalGoldItem>('retrieval.jsonl');

export const loadQaGold = (): QaGoldItem[] => loadJsonl<QaGoldItem>('qa.jsonl');
