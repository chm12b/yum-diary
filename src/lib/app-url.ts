/**
 * Public app origin for invite links, share URLs, and auth redirects.
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

/** Build restaurant share URL: {APP_URL}/restaurants/{restaurantId} */
export function buildRestaurantShareUrl(restaurantId: string): string {
  const id = restaurantId.trim();
  const base = getAppUrl();
  if (!base) {
    return `/restaurants/${id}`;
  }
  return `${base}/restaurants/${id}`;
}

/** Full restaurant share message for Web Share API and clipboard fallback. */
export function buildRestaurantShareMessage(
  restaurantName: string,
  url: string,
): string {
  const name = restaurantName.trim();
  return `🍽 今天決定吃這家！\n\n📍 ${name}\n\n一起看看菜單，決定要吃什麼吧 😋\n\n${url}`;
}

/** Build password-reset redirect URL: {APP_URL}/reset-password */
export function buildResetPasswordUrl(): string {
  const base = getAppUrl();
  if (!base) {
    return "/reset-password";
  }
  return `${base}/reset-password`;
}
