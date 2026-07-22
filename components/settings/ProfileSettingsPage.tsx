"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import RenameDisplayNameSheet from "@/components/settings/RenameDisplayNameSheet";
import { useAuth } from "@/src/hooks/useAuth";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import {
  getMyProfile,
  updateMyDisplayName,
} from "@/src/services/profile/profile.service";

type LoadStatus = "loading" | "ready" | "error";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

function formatJoinedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function ProfileField({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-text-secondary">{label}</span>
        <span className="mt-1 block truncate text-base font-medium text-deep-brown">
          {value}
        </span>
      </span>
      {onClick ? (
        <ChevronRight
          className="h-5 w-5 shrink-0 text-cocoa"
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-3 px-4 py-4">{content}</div>;
}

function RowDivider() {
  return <div className="border-t border-dashed border-border" />;
}

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { currentGroup } = useCurrentGroup();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [displayName, setDisplayName] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);

  const email = user?.email?.trim() || "—";
  const groupName = currentGroup?.name?.trim() || "尚未加入群組";

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  useEffect(() => {
    let cancelled = false;

    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        setStatus("loading");

        try {
          const { data, error } = await getMyProfile();

          if (cancelled) {
            return;
          }

          if (error || !data) {
            setDisplayName("");
            setCreatedAt(null);
            setStatus("error");
            return;
          }

          setDisplayName(data.displayName);
          setCreatedAt(data.createdAt);
          setStatus("ready");
        } catch {
          if (!cancelled) {
            setDisplayName("");
            setCreatedAt(null);
            setStatus("error");
          }
        }
      })();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [reloadToken]);

  async function handleRenameSave(nextName: string) {
    if (renaming) {
      return;
    }

    setRenaming(true);

    try {
      const { data, error } = await updateMyDisplayName(nextName);

      if (error || !data) {
        showToast("error", "更新失敗，請稍後再試。");
        return;
      }

      setDisplayName(data.displayName);
      setRenameOpen(false);
      showToast("success", "名稱已更新。");
    } catch {
      showToast("error", "更新失敗，請稍後再試。");
    } finally {
      setRenaming(false);
    }
  }

  return (
    <div className="home-grid-bg min-h-full">
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href="/settings"
          aria-label="返回設定"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="text-center font-display text-base font-bold text-deep-brown">
          👤 個人資料
        </h1>
        <span aria-hidden />
      </header>

      <section className="px-5 pt-4 pb-8">
        {status === "loading" ? (
          <div
            className="animate-pulse overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft"
            aria-hidden
          >
            <div className="space-y-4 px-4 py-5">
              <div className="h-4 w-16 rounded-full bg-border/80" />
              <div className="h-5 w-40 rounded-full bg-border/70" />
              <div className="h-px w-full bg-border/60" />
              <div className="h-4 w-14 rounded-full bg-border/80" />
              <div className="h-5 w-52 rounded-full bg-border/70" />
            </div>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-rice-white px-4 py-10 text-center shadow-soft">
            <p className="text-sm font-medium text-cocoa">載入個人資料失敗</p>
            <button
              type="button"
              onClick={() => {
                setReloadToken((token) => token + 1);
              }}
              className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {status === "ready" ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
            <ProfileField
              label="名稱"
              value={displayName || "—"}
              onClick={() => setRenameOpen(true)}
            />
            <RowDivider />
            <ProfileField label="Email" value={email} />
            <RowDivider />
            <ProfileField label="目前群組" value={groupName} />
            <RowDivider />
            <ProfileField
              label="加入日期"
              value={createdAt ? formatJoinedDate(createdAt) : "—"}
            />
          </div>
        ) : null}
      </section>

      <RenameDisplayNameSheet
        open={renameOpen}
        currentName={displayName}
        submitting={renaming}
        onClose={() => {
          if (!renaming) {
            setRenameOpen(false);
          }
        }}
        onSave={handleRenameSave}
      />

      {toast ? (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-card ${
            toast.type === "success"
              ? "border border-caramel/30 bg-sakura-pink/80 text-deep-brown"
              : "border border-border bg-rice-white text-cocoa"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
