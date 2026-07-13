"use client";

import { useState } from "react";

import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthTabs, { type AuthTab } from "@/components/auth/AuthTabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function AuthPage() {
  const [tab, setTab] = useState<AuthTab>("login");

  return (
    <div className="flex min-h-dvh flex-col bg-rice-white">
      <AuthHeader />

      <div className="flex flex-1 flex-col px-6 pb-2">
        <AuthTabs value={tab} onChange={setTab} />

        <div className="mt-6 flex-1">
          {tab === "login" ? <LoginForm /> : (
            <RegisterForm />
          )}
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}
