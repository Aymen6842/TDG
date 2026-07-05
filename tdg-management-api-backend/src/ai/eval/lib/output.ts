/**
 * Result serialization for the eval scripts (§6): every run writes both a JSON
 * blob (full detail for the report / re-analysis) and a flat CSV (for a quick
 * spreadsheet chart) under `src/ai/eval/out/`.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/** Absolute path to the eval output directory (`src/ai/eval/out`). */
export const OUT_DIR = join(__dirname, '..', 'out');

function ensureOutDir(): void {
  mkdirSync(OUT_DIR, { recursive: true });
}

/** Pretty-print an object to `out/<name>.json`. Returns the path written. */
export function writeJson(name: string, data: unknown): string {
  ensureOutDir();
  const path = join(OUT_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return path;
}

/** RFC-4180-ish CSV escaping for a single cell. */
function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Write an array of flat row objects to `out/<name>.csv`. Columns are taken from
 * `columns` when given, else the union of keys across all rows (first-seen order).
 * Returns the path written.
 */
export function writeCsv(
  name: string,
  rows: Record<string, unknown>[],
  columns?: string[],
): string {
  ensureOutDir();
  const cols =
    columns ??
    rows.reduce<string[]>((acc, row) => {
      for (const key of Object.keys(row)) if (!acc.includes(key)) acc.push(key);
      return acc;
    }, []);

  const lines = [cols.join(',')];
  for (const row of rows) {
    lines.push(cols.map((col) => csvCell(row[col])).join(','));
  }
  const path = join(OUT_DIR, `${name}.csv`);
  writeFileSync(path, lines.join('\n') + '\n', 'utf8');
  return path;
}
