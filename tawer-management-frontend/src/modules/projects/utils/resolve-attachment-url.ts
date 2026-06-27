/**
 * Backend attachment paths are stored as `/static/attachments/...`.
 * The browser must load them from the API host, not the Next.js app origin.
 */
export function resolveAttachmentUrl(path: string): string {
  if (!path) return path;
  if (
    path.startsWith("blob:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const base = process.env.BACKEND_ADDRESS || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/** Extract the stored DB path (e.g. `/static/attachments/tasks/file.pdf`). */
export function getAttachmentStoragePath(path: string): string {
  if (!path) return path;
  if (path.startsWith("blob:")) return path;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      return new URL(path).pathname;
    } catch {
      return path;
    }
  }

  return path.startsWith("/") ? path : `/${path}`;
}
