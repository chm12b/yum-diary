"use client";

import type { ReactNode } from "react";

import AppStartup from "@/src/components/providers/AppStartup";
import ServiceWorkerRegister from "@/src/components/pwa/ServiceWorkerRegister";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { CurrentGroupProvider } from "@/src/contexts/CurrentGroupContext";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CurrentGroupProvider>
        <AppStartup />
        <ServiceWorkerRegister />
        {children}
      </CurrentGroupProvider>
    </AuthProvider>
  );
}
