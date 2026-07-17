"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { buildInviteUrl } from "@/src/lib/app-url";
import { getGroupDetail } from "@/src/services/groups/group.service";

type GroupInvitePageProps = {
  groupId: string;
};

type LoadStatus = "loading" | "ready" | "forbidden" | "not-found" | "error";

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

const TOAST_MS = 1800;

export default function GroupInvitePage({ groupId }: GroupInvitePageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [groupName, setGroupName] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");

      try {
        const { data, error } = await getGroupDetail(groupId);

        if (cancelled) {
          return;
        }

        if (error) {
          setStatus("error");
          return;
        }

        if (!data) {
          setStatus("not-found");
          return;
        }

        if (!data.isOwner) {
          setStatus("forbidden");
          return;
        }

        setGroupName(data.name);
        setInviteUrl(buildInviteUrl(data.inviteCode));
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = inviteUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      showToast("已複製邀請連結。");
    } catch {
      // Clipboard unavailable — share fallback still lands here; avoid error UI.
    }
  }

  async function shareLink() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "🐰 邀請你加入 Yum Diary",
          text: "一起收藏好吃的餐廳、記錄美食回憶吧！",
          url: inviteUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyLink();
  }

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full">
        <div className="animate-pulse px-5 pt-4" aria-hidden>
          <div className="mx-auto h-9 w-40 rounded-full bg-border" />
          <div className="mt-8 h-64 w-full rounded-2xl bg-border/70" />
        </div>
      </div>
    );
  }

  if (status === "error" || status === "not-found" || status === "forbidden") {
    return (
      <div className="home-grid-bg min-h-full">
        <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
          <Link
            href={`/settings/groups/${groupId}`}
            aria-label="返回群組詳情"
            className={`${iconButtonClass} justify-self-start`}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <h1 className="text-center font-display text-base font-bold text-deep-brown">
            邀請成員
          </h1>
          <span aria-hidden />
        </header>
        <div className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">
            {status === "forbidden"
              ? "只有群組建立者可以邀請成員"
              : status === "not-found"
                ? "找不到這個群組"
                : "載入失敗"}
          </p>
          <button
            type="button"
            onClick={() => router.push(`/settings/groups/${groupId}`)}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button"
          >
            返回群組詳情
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full">
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href={`/settings/groups/${groupId}`}
          aria-label="返回群組詳情"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="text-center font-display text-base font-bold text-deep-brown">
          邀請成員
        </h1>
        <span aria-hidden />
      </header>

      <section className="px-5 pt-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white px-5 py-8 text-center shadow-soft">
          <p className="text-4xl" aria-hidden>
            🐰
          </p>
          <h2 className="mt-3 font-display text-lg font-bold text-deep-brown">
            邀請朋友加入
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-cocoa">
            任何取得此邀請連結的人，都可以加入此群組。
          </p>
          <p className="mt-1 text-xs text-text-secondary">{groupName}</p>

          <div className="my-5 border-t border-dashed border-border" />

          <p className="break-all rounded-xl border border-border bg-cream-bg/60 px-3 py-3 text-left text-xs leading-relaxed text-deep-brown">
            {inviteUrl}
          </p>

          <div className="my-5 border-t border-dashed border-border" />

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                void copyLink();
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              <Copy className="h-4 w-4" strokeWidth={2.5} />
              複製連結
            </button>
            <button
              type="button"
              onClick={() => {
                void shareLink();
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" strokeWidth={2.5} />
              分享
            </button>
          </div>
        </div>
      </section>

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-caramel/30 bg-sakura-pink/80 px-4 py-3 text-center text-sm font-medium text-deep-brown shadow-card"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
