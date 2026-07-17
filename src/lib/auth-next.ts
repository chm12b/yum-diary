/**
 * Safe internal path for post-login redirect (must start with "/").
 * Rejects protocol-relative and absolute URLs.
 */
export function getSafeNextPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  const raw = value?.trim() ?? "";
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}
