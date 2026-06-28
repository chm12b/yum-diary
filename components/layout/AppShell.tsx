import type { ReactNode } from "react";

import BottomNav from "@/components/layout/BottomNav";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      <div className="mx-auto min-h-dvh w-full max-w-app bg-cream-bg pb-bottom-nav">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
