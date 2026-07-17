/**
 * Public app origin for invite links and share URLs.
 * Prefer NEXT_PUBLIC_APP_URL; fall back to window.location.origin in the browser.
 */
export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}

/** Build invite URL: {APP_URL}/join/{inviteCode} */
export function buildInviteUrl(inviteCode: string): string {
  const code = inviteCode.trim();
  const base = getAppUrl();
  if (!base) {
    return `/join/${code}`;
  }
  return `${base}/join/${code}`;
}
