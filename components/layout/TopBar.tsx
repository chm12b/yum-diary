"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";

import GroupSwitchPopover from "@/components/layout/GroupSwitchPopover";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";

const TOAST_MS = 1800;

export default function TopBar() {
  const { currentGroup, switchGroup } = useCurrentGroup();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

  async function handleSelect(groupId: string): Promise<boolean> {
    const { ok } = await switchGroup(groupId);
    if (!ok) {
      showToast("切換群組失敗，請稍後再試。");
    }
    return ok;
  }

  return (
    <>
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-1">
        <button
          type="button"
          aria-label="開啟選單"
          className="flex h-10 w-10 items-center justify-center justify-self-start text-text-primary transition-transform active:scale-[0.98]"
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>

        <div className="relative justify-self-center">
          <button
            type="button"
            aria-label={`目前群組：${currentGroup?.name ?? "尚未加入群組"}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className={`flex max-w-full cursor-pointer items-center justify-center gap-1 rounded-full px-3 py-1.5 text-text-primary transition-[background-color,transform,opacity] duration-150 hover:bg-milk-tea/80 active:scale-[0.98] active:opacity-90 ${
              open ? "bg-milk-tea/80" : "bg-transparent"
            }`}
          >
            <span aria-hidden className="text-base leading-none">
              🏠
            </span>
            <span className="max-w-[9.5rem] truncate font-mono text-base">
              {currentGroup?.name ?? "尚未加入群組"}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-text-secondary transition-transform duration-150 ${
                open ? "rotate-180" : ""
              }`}
              strokeWidth={2.5}
              aria-hidden
            />
          </button>

          <GroupSwitchPopover
            open={open}
            currentGroupId={currentGroup?.id ?? null}
            onClose={() => setOpen(false)}
            onSelect={handleSelect}
          />
        </div>

        <button
          type="button"
          aria-label="通知"
          className="flex h-10 w-10 items-center justify-center justify-self-end text-text-primary transition-transform active:scale-[0.98]"
        >
          <Bell className="h-6 w-6" strokeWidth={2} />
        </button>
      </header>

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-[60] mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-border bg-rice-white px-4 py-3 text-center text-sm font-medium text-cocoa shadow-card"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
