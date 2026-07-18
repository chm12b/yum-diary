"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/src/hooks/useAuth";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import {
  getInvitePreview,
  joinGroupByInviteCode,
  listMyGroups,
  type InvitePreview,
} from "@/src/services/groups/group.service";

type JoinInvitePageProps = {
  inviteCode: string;
};

type LoadStatus =
  | "loading"
  | "ready"
  | "already-member"
  | "not-found"
  | "error";

const TOAST_MS = 1800;

export default function JoinInvitePage({ inviteCode }: JoinInvitePageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { switchGroup } = useCurrentGroup();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const code = inviteCode.trim().toUpperCase();

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(`/auth?next=${encodeURIComponent(`/join/${code}`)}`);
      return;
    }

    let cancelled = false;

    async function load() {
      setStatus("loading");

      try {
        const { data, error } = await getInvitePreview(code);

        if (cancelled) {
          return;
        }

        if (error) {
          setStatus("error");
          return;
        }

        if (!data) {
          setPreview(null);
          setStatus("not-found");
          return;
        }

        setPreview(data);

        const { data: mine } = await listMyGroups();
        if (cancelled) {
          return;
        }

        if (mine.some((group) => group.id === data.groupId)) {
          setStatus("already-member");
          return;
        }

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
  }, [authLoading, user, code, router]);

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

  async function handleJoin() {
    if (!preview || joining) {
      return;
    }

    setJoining(true);

    try {
      const { data: groupId, error } = await joinGroupByInviteCode(code);

      if (error || !groupId) {
        showToast("加入失敗，請稍後再試。");
        return;
      }

      await switchGroup(groupId);
      showToast(`歡迎加入「${preview.groupName}」。`);

      window.setTimeout(() => {
        router.replace("/");
      }, 700);
    } catch {
      showToast("加入失敗，請稍後再試。");
    } finally {
      setJoining(false);
    }
  }

  if (authLoading || status === "loading" || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-bg px-5">
        <div className="h-10 w-40 animate-pulse rounded-full bg-border" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-cream-bg px-5 text-center">
        <p className="text-4xl" aria-hidden>
          🐰
        </p>
        <p className="font-display text-lg font-bold text-deep-brown">
          找不到此邀請。
        </p>
        <p className="text-sm text-cocoa">邀請連結可能已失效。</p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button"
        >
          返回首頁
        </Link>
      </div>
    );
  }

  if (status === "error" || !preview) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-cream-bg px-5 text-center">
        <p className="text-sm font-medium text-cocoa">載入邀請失敗</p>
        <Link
          href="/"
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button"
        >
          返回首頁
        </Link>
      </div>
    );
  }

  if (status === "already-member") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-bg px-5">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-rice-white px-5 py-8 text-center shadow-soft">
          <p className="text-4xl" aria-hidden>
            🐰
          </p>
          <p className="mt-3 font-display text-lg font-bold text-deep-brown">
            {preview.groupName}
          </p>
          <p className="mt-3 text-sm text-cocoa">
            你已經是「{preview.groupName}」的成員了。
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button"
          >
            前往首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-bg px-5">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-rice-white px-5 py-8 text-center shadow-soft">
        <p className="text-4xl" aria-hidden>
          🐰
        </p>
        <p className="mt-3 text-sm text-cocoa">你受邀加入：</p>
        <p className="mt-1 font-display text-lg font-bold text-deep-brown">
          {preview.groupName}
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          建立者：{preview.ownerName}
        </p>

        <button
          type="button"
          disabled={joining}
          onClick={() => {
            void handleJoin();
          }}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
        >
          {joining ? "加入中…" : "加入群組"}
        </button>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-8 z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-caramel/30 bg-sakura-pink/80 px-4 py-3 text-center text-sm font-medium text-deep-brown shadow-card"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
