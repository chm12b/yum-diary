"use client";

import type { ReactNode } from "react";

import AppStartup from "@/src/components/providers/AppStartup";
import { AuthProvider } from "@/src/contexts/AuthContext";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AppStartup />
      {children}
    </AuthProvider>
  );
}
