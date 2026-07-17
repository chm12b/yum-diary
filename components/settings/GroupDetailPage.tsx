"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

import {
  getGroupDetail,
  type GroupDetail,
} from "@/src/services/groups/group.service";

type GroupDetailPageProps = {
  groupId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

const TOAST_MS = 1800;

function RowDivider() {
  return <div className="border-t border-dashed border-border" />;
}

type SettingsRowProps = {
  emoji: string;
  label: string;
  href: string;
};

function SettingsRow({ emoji, label, href }: SettingsRowProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
    >
      <span className="text-base leading-none" aria-hidden>
        {emoji}
      </span>
      <span className="min-w-0 flex-1 text-base font-medium text-deep-brown">
        {label}
      </span>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-cocoa"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}

export default function GroupDetailPage({ groupId }: GroupDetailPageProps) {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  async function load() {
    setStatus("loading");

    try {
      const { data, error } = await getGroupDetail(groupId);

      if (error) {
        setGroup(null);
        setStatus("error");
        return;
      }

      if (!data) {
        setGroup(null);
        setStatus("not-found");
        return;
      }

      setGroup(data);
      setStatus("ready");
    } catch {
      setGroup(null);
      setStatus("error");
    }
  }

  useEffect(() => {
    void load();
  }, [groupId]);

  function showComingSoon() {
    setToast("Coming Soon");
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full">
        <div className="animate-pulse px-5 pt-4" aria-hidden>
          <div className="mx-auto h-9 w-40 rounded-full bg-border" />
          <div className="mt-8 h-20 w-full rounded-2xl bg-border/70" />
          <div className="mt-4 h-48 w-full rounded-2xl bg-border/60" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="home-grid-bg min-h-full">
        <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
          <Link
            href="/settings/groups"
            aria-label="返回我的群組"
            className={`${iconButtonClass} justify-self-start`}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <h1 className="text-center font-display text-base font-bold text-deep-brown">
            群組詳情
          </h1>
          <span aria-hidden />
        </header>
        <div className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">載入群組失敗</p>
          <button
            type="button"
            onClick={() => {
              void load();
            }}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            重新整理
          </button>
        </div>
      </div>
    );
  }

  if (status === "not-found" || !group) {
    return (
      <div className="home-grid-bg min-h-full">
        <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
          <Link
            href="/settings/groups"
            aria-label="返回我的群組"
            className={`${iconButtonClass} justify-self-start`}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <h1 className="text-center font-display text-base font-bold text-deep-brown">
            群組詳情
          </h1>
          <span aria-hidden />
        </header>
        <div className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">找不到這個群組</p>
          <Link
            href="/settings/groups"
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            返回我的群組
          </Link>
        </div>
      </div>
    );
  }

  const basePath = `/settings/groups/${group.id}`;

  return (
    <div className="home-grid-bg min-h-full">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-5 pt-4 pb-2">
        <Link
          href="/settings/groups"
          aria-label="返回我的群組"
          className="flex items-center gap-1 justify-self-start text-deep-brown transition-transform active:scale-[0.98]"
        >
          <span className={iconButtonClass}>
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-xs font-medium text-cocoa">我的群組</span>
        </Link>
        <h1 className="truncate text-center font-display text-base font-bold text-deep-brown">
          {group.name}
        </h1>
        <span className="w-[4.5rem]" aria-hidden />
      </header>

      <section className="space-y-4 px-5 pt-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white px-4 py-5 text-center shadow-soft">
          <p className="font-display text-lg font-bold text-deep-brown">
            {group.name}
          </p>
          <p className="mt-1.5 text-sm text-cocoa">
            {group.memberCount} 位成員
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
          <SettingsRow
            emoji="👥"
            label="成員"
            href={`${basePath}/members`}
          />
          {group.isOwner ? (
            <>
              <RowDivider />
              <SettingsRow
                emoji="📨"
                label="邀請成員"
                href={`${basePath}/invite`}
              />
            </>
          ) : null}
          <RowDivider />
          <SettingsRow
            emoji="✏️"
            label="修改群組名稱"
            href={`${basePath}/edit`}
          />
          <RowDivider />
          {group.isOwner ? (
            <button
              type="button"
              onClick={showComingSoon}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
            >
              <span className="text-base leading-none" aria-hidden>
                🗑
              </span>
              <span className="min-w-0 flex-1 text-base font-medium text-status-closed-fg">
                解散群組
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={showComingSoon}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
            >
              <span className="text-base leading-none" aria-hidden>
                🚪
              </span>
              <span className="min-w-0 flex-1 text-base font-medium text-status-closed-fg">
                離開群組
              </span>
            </button>
          )}
        </div>
      </section>

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-border bg-rice-white px-4 py-3 text-center text-sm font-medium text-cocoa shadow-card"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
