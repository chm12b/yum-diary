"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import LogoutConfirmDialog from "@/components/settings/LogoutConfirmDialog";
import { useAuth } from "@/src/hooks/useAuth";
import { clearClientAuthState } from "@/src/services/auth/clearClientAuthState";

type SettingsRowProps = {
  emoji: string;
  label: string;
  subtitle?: string;
  href?: string;
  trailing?: string;
  disabled?: boolean;
};

function SettingsRow({
  emoji,
  label,
  subtitle,
  href,
  trailing,
  disabled = false,
}: SettingsRowProps) {
  const content = (
    <>
      <span className="text-base leading-none" aria-hidden>
        {emoji}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-base font-medium text-deep-brown">
          {label}
        </span>
        {subtitle ? (
          <span className="mt-1 block text-xs leading-relaxed text-text-secondary">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span className="shrink-0 text-xs text-text-secondary">{trailing}</span>
      ) : null}
      {!disabled && !trailing ? (
        <ChevronRight
          className="h-5 w-5 shrink-0 text-cocoa"
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
    </>
  );

  const rowClassName =
    "flex w-full items-center gap-3 px-4 py-4 text-left transition-colors";

  if (disabled || !href) {
    return (
      <div
        className={`${rowClassName} cursor-default opacity-70`}
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${rowClassName} hover:bg-cream-bg/40 active:bg-cream-bg/60`}
    >
      {content}
    </Link>
  );
}

function RowDivider() {
  return <div className="border-t border-dashed border-border" />;
}

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);

  const handleLogoutConfirm = useCallback(async () => {
    if (logoutSubmitting) {
      return;
    }

    setLogoutSubmitting(true);
    try {
      const { error } = await signOut();
      if (error) {
        setLogoutSubmitting(false);
        return;
      }

      clearClientAuthState();
      setLogoutOpen(false);
      router.replace("/auth");
    } catch {
      setLogoutSubmitting(false);
    }
  }, [logoutSubmitting, router, signOut]);

  return (
    <div className="home-grid-bg min-h-full">
      <header className="px-5 pt-4 pb-2">
        <h1 className="text-center font-display text-base font-bold text-deep-brown">
          設定
        </h1>
      </header>

      <section className="px-5 pt-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
          <SettingsRow
            emoji="👤"
            label="個人資料"
            href="/settings/profile"
          />
          <RowDivider />
          <SettingsRow emoji="👥" label="群組管理" href="/settings/groups" />
          <RowDivider />
          <SettingsRow emoji="📍" label="預設位置" href="/settings/location" />
          <RowDivider />
          <SettingsRow
            emoji="🍽"
            label="今天吃什麼"
            subtitle="設定兔兔幫你決定餐廳時使用的條件。"
            href="/settings/decide"
          />
          <RowDivider />
          <SettingsRow
            emoji="📦"
            label="已封存餐廳"
            subtitle="查看與管理已封存的餐廳。"
            href="/settings/restaurants/archived"
          />
          <RowDivider />
          <SettingsRow
            emoji="ℹ️"
            label="關於 Yum Diary"
            href="/settings/about"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
          >
            <span className="text-base leading-none" aria-hidden>
              🚪
            </span>
            <span className="min-w-0 flex-1 text-left text-base font-medium text-red-600">
              登出
            </span>
          </button>
        </div>
      </section>

      <LogoutConfirmDialog
        open={logoutOpen}
        submitting={logoutSubmitting}
        onClose={() => {
          if (!logoutSubmitting) {
            setLogoutOpen(false);
          }
        }}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
