"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/src/hooks/useAuth";

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
        if (pathname !== "/auth") {
          router.replace("/auth");
        }
        return;
      }

      const path = await getPostLoginPath(session.user.id);

      if (pathname !== path) {
        router.replace(path);
      }
    }

    void resolveStartupPath();
  }, [loading, session, pathname, router, getPostLoginPath]);

  return null;
}
