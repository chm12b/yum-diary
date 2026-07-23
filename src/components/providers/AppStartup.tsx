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
  const hasResolvedStartupRef = useRef(false);
  const prevSessionRef = useRef<typeof session | undefined>(undefined);

  // One-shot startup: restore session path (home / onboarding / auth).
  useEffect(() => {
    if (loading || hasResolvedStartupRef.current) {
      return;
    }

    hasResolvedStartupRef.current = true;
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
