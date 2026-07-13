"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import BottomNav from "@/components/layout/BottomNav";
import { isHiddenNavPath } from "@/src/lib/shell";

type AppShellProps = {
  children: ReactNode;
  initialPathname?: string;
};

export default function AppShell({
  children,
  initialPathname = "",
}: AppShellProps) {
  const pathname = usePathname();
  const hideBottomNav = isHiddenNavPath(pathname || initialPathname);

  return (
    <>
      <div
        className={`mx-auto min-h-dvh w-full ${
          hideBottomNav
            ? "max-w-[420px] bg-rice-white"
            : "max-w-app bg-cream-bg pb-bottom-nav"
        }`}
      >
        {children}
      </div>
      {hideBottomNav ? null : <BottomNav />}
    </>
  );
}
