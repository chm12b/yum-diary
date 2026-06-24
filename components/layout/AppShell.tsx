import type { ReactNode } from "react";

import BottomNav from "@/components/layout/BottomNav";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      <div className="mx-auto min-h-dvh w-full max-w-app bg-milk-tea pb-bottom-nav">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
