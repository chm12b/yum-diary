"use client";

import { useEffect, useState } from "react";

import {
  listMyGroups,
  type GroupListItem,
} from "@/src/services/groups/group.service";

type GroupSwitchPopoverProps = {
  open: boolean;
  currentGroupId: string | null;
  onClose: () => void;
  onSelect: (groupId: string) => Promise<boolean>;
};

export default function GroupSwitchPopover({
  open,
  currentGroupId,
  onClose,
  onSelect,
}: GroupSwitchPopoverProps) {
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setStatus("loading");

      const { data, error } = await listMyGroups();

      if (cancelled) {
        return;
      }

      if (error) {
        setGroups([]);
        setStatus("error");
        return;
      }

      setGroups(data);
      setStatus("ready");
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !switchingId) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, switchingId]);

  if (!open) {
    return null;
  }

  async function handleSelect(groupId: string) {
    if (switchingId) {
      return;
    }

    if (groupId === currentGroupId) {
      onClose();
      return;
    }

    setSwitchingId(groupId);
    const ok = await onSelect(groupId);
    setSwitchingId(null);

    if (ok) {
      onClose();
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="關閉群組選單"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        onClick={() => {
          if (!switchingId) {
            onClose();
          }
        }}
      />

      <div
        role="listbox"
        aria-label="切換群組"
        className="popover-enter absolute top-full left-1/2 z-50 mt-2 w-[min(70vw,17.5rem)] origin-top -translate-x-1/2 rounded-2xl border border-border bg-rice-white py-1.5 shadow-card"
      >
        {status === "loading" ? (
          <div className="space-y-1.5 px-2 py-1" aria-hidden>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-xl bg-border/60"
              />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <p className="px-4 py-6 text-center text-sm text-cocoa">
            載入群組失敗
          </p>
        ) : null}

        {status === "ready" && groups.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-cocoa/70">
            還沒有任何群組。
          </p>
        ) : null}

        {status === "ready" && groups.length > 0 ? (
          <ul className="max-h-64 overflow-y-auto px-1.5">
            {groups.map((group) => {
              const isCurrent = group.id === currentGroupId;
              const isBusy = switchingId === group.id;

              return (
                <li key={group.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCurrent}
                    disabled={Boolean(switchingId)}
                    onClick={() => {
                      void handleSelect(group.id);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150 hover:bg-milk-tea/70 active:bg-milk-tea disabled:opacity-70"
                  >
                    <span className="w-4 shrink-0 text-sm font-bold text-caramel">
                      {isCurrent ? "✓" : ""}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-brown">
                      {isBusy ? "切換中…" : group.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </>
  );
}
