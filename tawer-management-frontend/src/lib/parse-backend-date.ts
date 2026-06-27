/**
 * Parses backend date strings (ISO 8601 or "YYYY-MM-DD HH:mm:ss" Tunisia format).
 */
export function parseBackendDate(
  val: string | null | undefined,
): Date | null {
  if (!val) return null;
  const isoLike = val.includes("T") ? val : val.replace(" ", "T");
  const d = new Date(isoLike);
  return isNaN(d.getTime()) ? null : d;
}

export function parseBackendDateRequired(
  val: string | null | undefined,
  fallback?: string | null,
): Date {
  return (
    parseBackendDate(val) ??
    parseBackendDate(fallback) ??
    new Date(0)
  );
}
