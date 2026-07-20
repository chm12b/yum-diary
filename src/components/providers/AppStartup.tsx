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

function isAuthNextPath(pathname: string) {
  return isJoinPath(pathname) || isRestaurantDetailPath(pathname);
}

export default function AppStartup() {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, session, getPostLoginPath } = useAuth();
  const hasResolvedRef = useRef(false);

  useEffect(() => {
    if (loading || hasResolvedRef.current) {
      return;
    }

    hasResolvedRef.current = true;

    async function resolveStartupPath() {
      if (!session) {
        if (isAuthNextPath(pathname)) {
          router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
          return;
        }

        if (
          pathname !== "/auth" &&
          !isPasswordResetPath(pathname)
        ) {
          router.replace("/auth");
        }
        return;
      }

      if (
        isAuthNextPath(pathname) ||
        isPasswordResetPath(pathname)
      ) {
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

  return null;
}
