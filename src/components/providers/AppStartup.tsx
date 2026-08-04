"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/src/hooks/useAuth";
import { getSafeNextPath } from "@/src/lib/auth-next";

function isJoinPath(pathname: string) {
  return pathname === "/join" || pathname.startsWith("/join/");
}

function isPasswordResetPath(pathname: string) {
  return pathname === "/forgot-password" || pathname === "/reset-password";
}

/** Restaurant detail deep link: /restaurants/{id} (not list or nested routes). */
function isRestaurantDetailPath(pathname: string) {
  return /^\/restaurants\/[^/]+$/.test(pathname);
}

/** Group order deep link: /orders/{id} (not nested routes like my-order). */
function isGroupOrderPath(pathname: string) {
  return /^\/orders\/[^/]+$/.test(pathname);
}

function isAuthNextPath(pathname: string) {
  return (
    isJoinPath(pathname) ||
    isRestaurantDetailPath(pathname) ||
    isGroupOrderPath(pathname)
  );
}

function isPublicAuthPath(pathname: string) {
  return pathname === "/auth" || isPasswordResetPath(pathname);
}

export default function AppStartup() {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, session, getPostLoginPath } = useAuth();
  /** last handled auth identity: "anon" | userId */
  const lastHandledKeyRef = useRef<string | null>(null);
  const prevSessionRef = useRef<typeof session | undefined>(undefined);

  // Startup path: re-run when session identity changes (not one-shot forever).
  useEffect(() => {
    if (loading) {
      return;
    }

    const sessionKey = session?.user.id ?? "anon";
    if (lastHandledKeyRef.current === sessionKey) {
      return;
    }
    lastHandledKeyRef.current = sessionKey;
    prevSessionRef.current = session;

    async function resolveStartupPath() {
      if (!session) {
        if (isAuthNextPath(pathname)) {
          router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!isPublicAuthPath(pathname)) {
          router.replace("/auth");
        }
        return;
      }

      if (isAuthNextPath(pathname) || isPasswordResetPath(pathname)) {
        return;
      }

      const path = await getPostLoginPath(session.user.id);

      if (pathname === "/auth") {
        const params = new URLSearchParams(window.location.search);
        const next = getSafeNextPath(params.get("next"), path);
        router.replace(next);
        return;
      }

      if (pathname !== path) {
        router.replace(path);
      }
    }

    void resolveStartupPath();
  }, [loading, session, pathname, router, getPostLoginPath]);

  // Ongoing: redirect to login when session is lost (logout / expiry).
  useEffect(() => {
    if (loading) {
      return;
    }

    const prevSession = prevSessionRef.current;
    prevSessionRef.current = session;

    // Only react after we have observed at least one auth state.
    if (prevSession === undefined) {
      return;
    }

    // Session still present, or never had a session to lose.
    if (session || !prevSession) {
      return;
    }

    // Reset so next sign-in re-resolves post-login path.
    lastHandledKeyRef.current = null;

    if (isPublicAuthPath(pathname)) {
      return;
    }

    if (isAuthNextPath(pathname)) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    }

    router.replace("/auth");
  }, [loading, session, pathname, router]);

  return null;
}
